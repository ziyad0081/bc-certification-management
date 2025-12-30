from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import json
from datetime import datetime
import hashlib
import qrcode
import io
import base64

from .models import (
    CredentialCreate,
    CredentialResponse,
    VerifyCredentialResponse,
    IssuerAuthorization,
    QRCodeResponse
)
from .blockchain import BlockchainService
from .config import settings

app = FastAPI(
    title="Credential Verification API",
    description="Blockchain-based credential verification system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize blockchain service
blockchain_service = BlockchainService()


@app.get("/")
async def root():
    return {
        "message": "Credential Verification API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "contract_info": "/api/contract/info",
            "issue_credential": "/api/credentials/issue",
            "verify_credential": "/api/credentials/verify/{credential_id}",
            "get_credential": "/api/credentials/{credential_id}",
            "revoke_credential": "/api/credentials/revoke/{credential_id}",
            "issuer_credentials": "/api/issuers/{issuer_address}/credentials",
            "recipient_credentials": "/api/recipients/{email}/credentials"
        }
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "blockchain_connected": blockchain_service.is_connected()
    }


@app.get("/api/contract/info")
async def get_contract_info():
    """Get smart contract information"""
    return {
        "contract_address": blockchain_service.contract_address,
        "network": "localhost",  # or get from config
        "abi_available": blockchain_service.contract is not None
    }


@app.post("/api/credentials/issue", response_model=CredentialResponse)
async def issue_credential(credential: CredentialCreate):
    """
    Issue a new credential on the blockchain
    Requires the issuer to be authorized
    """
    try:
        # Generate unique credential ID
        credential_id = generate_credential_id(
            credential.recipient_email,
            credential.credential_type,
            credential.issuer_name
        )
        
        # Issue credential on blockchain
        tx_hash = blockchain_service.issue_credential(
            credential_id=credential_id,
            recipient_name=credential.recipient_name,
            recipient_email=credential.recipient_email,
            issuer_name=credential.issuer_name,
            credential_type=credential.credential_type,
            description=credential.description,
            metadata_uri=credential.metadata_uri or "",
            issuer_address=credential.issuer_address
        )
        
        return CredentialResponse(
            credential_id=credential_id,
            transaction_hash=tx_hash,
            status="success",
            message="Credential issued successfully",
            issue_date=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/credentials/verify/{credential_id}", response_model=VerifyCredentialResponse)
async def verify_credential(credential_id: str):
    """
    Verify a credential by its ID
    Returns credential details if valid
    """
    try:
        verification = blockchain_service.verify_credential(credential_id)
        
        if not verification["exists"]:
            return VerifyCredentialResponse(
                exists=False,
                is_valid=False,
                message="Credential not found"
            )
        
        return VerifyCredentialResponse(
            exists=True,
            is_valid=verification["is_valid"],
            recipient_name=verification["recipient_name"],
            issuer_name=verification["issuer_name"],
            credential_type=verification["credential_type"],
            issue_date=verification["issue_date"],
            message="Credential verified" if verification["is_valid"] else "Credential has been revoked"
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/credentials/{credential_id}")
async def get_credential(credential_id: str):
    """Get full credential details"""
    try:
        credential = blockchain_service.get_credential(credential_id)
        
        if not credential or credential["credentialId"] == "":
            raise HTTPException(status_code=404, detail="Credential not found")
        
        return {
            "credential_id": credential["credentialId"],
            "recipient_name": credential["recipientName"],
            "recipient_email": credential["recipientEmail"],
            "issuer_name": credential["issuerName"],
            "credential_type": credential["credentialType"],
            "description": credential["description"],
            "issue_date": datetime.fromtimestamp(credential["issueDate"]).isoformat(),
            "issuer_address": credential["issuer"],
            "is_valid": credential["isValid"],
            "metadata_uri": credential["metadataURI"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/credentials/revoke/{credential_id}")
async def revoke_credential(credential_id: str, issuer_address: str):
    """
    Revoke a credential
    Only the original issuer can revoke
    """
    try:
        tx_hash = blockchain_service.revoke_credential(credential_id, issuer_address)
        
        return {
            "status": "success",
            "message": "Credential revoked successfully",
            "credential_id": credential_id,
            "transaction_hash": tx_hash
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/issuers/authorize")
async def authorize_issuer(auth: IssuerAuthorization):
    """
    Authorize a new issuer
    Only contract owner can do this
    """
    try:
        tx_hash = blockchain_service.authorize_issuer(
            auth.issuer_address,
            auth.owner_address
        )
        
        return {
            "status": "success",
            "message": "Issuer authorized successfully",
            "issuer_address": auth.issuer_address,
            "transaction_hash": tx_hash
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/issuers/{issuer_address}/credentials")
async def get_issuer_credentials(issuer_address: str):
    """Get all credentials issued by a specific issuer"""
    try:
        credential_ids = blockchain_service.get_issuer_credentials(issuer_address)
        
        credentials = []
        for cred_id in credential_ids:
            try:
                cred = blockchain_service.get_credential(cred_id)
                if cred and cred["credentialId"] != "":
                    credentials.append({
                        "credential_id": cred["credentialId"],
                        "recipient_name": cred["recipientName"],
                        "recipient_email": cred["recipientEmail"],
                        "credential_type": cred["credentialType"],
                        "issue_date": datetime.fromtimestamp(cred["issueDate"]).isoformat(),
                        "is_valid": cred["isValid"]
                    })
            except:
                continue
        
        return {
            "issuer_address": issuer_address,
            "credentials": credentials,
            "total": len(credentials)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/recipients/{email}/credentials")
async def get_recipient_credentials(email: str):
    """Get all credentials for a specific recipient"""
    try:
        credential_ids = blockchain_service.get_recipient_credentials(email)
        
        credentials = []
        for cred_id in credential_ids:
            try:
                cred = blockchain_service.get_credential(cred_id)
                if cred and cred["credentialId"] != "":
                    credentials.append({
                        "credential_id": cred["credentialId"],
                        "issuer_name": cred["issuerName"],
                        "credential_type": cred["credentialType"],
                        "description": cred["description"],
                        "issue_date": datetime.fromtimestamp(cred["issueDate"]).isoformat(),
                        "is_valid": cred["isValid"]
                    })
            except:
                continue
        
        return {
            "recipient_email": email,
            "credentials": credentials,
            "total": len(credentials)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/credentials/{credential_id}/qr", response_model=QRCodeResponse)
async def generate_qr_code(credential_id: str):
    """Generate QR code for credential verification"""
    try:
        # Verify credential exists
        verification = blockchain_service.verify_credential(credential_id)
        if not verification["exists"]:
            raise HTTPException(status_code=404, detail="Credential not found")
        
        # Generate verification URL
        verification_url = f"{settings.frontend_url}/verify/{credential_id}"
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(verification_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return QRCodeResponse(
            credential_id=credential_id,
            qr_code=f"data:image/png;base64,{img_str}",
            verification_url=verification_url
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/issuers/{issuer_address}/authorized")
async def check_issuer_authorization(issuer_address: str):
    """Check if an address is an authorized issuer"""
    try:
        is_authorized = blockchain_service.is_authorized_issuer(issuer_address)
        
        return {
            "issuer_address": issuer_address,
            "is_authorized": is_authorized
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def generate_credential_id(email: str, credential_type: str, issuer: str) -> str:
    """Generate a unique credential ID"""
    timestamp = datetime.now().isoformat()
    data = f"{email}{credential_type}{issuer}{timestamp}"
    return hashlib.sha256(data.encode()).hexdigest()[:32]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)