from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class CredentialCreate(BaseModel):
    recipient_name: str = Field(..., description="Name of the credential recipient")
    recipient_email: EmailStr = Field(..., description="Email of the recipient")
    issuer_name: str = Field(..., description="Name of the issuing institution")
    issuer_address: str = Field(..., description="Ethereum address of the issuer")
    credential_type: str = Field(..., description="Type of credential (e.g., Certificate, Award, Validation)")
    description: str = Field(..., description="Description of the credential")
    metadata_uri: Optional[str] = Field(None, description="URI to additional metadata (IPFS, etc.)")

    class Config:
        json_schema_extra = {
            "example": {
                "recipient_name": "John Doe",
                "recipient_email": "john.doe@example.com",
                "issuer_name": "University of Technology",
                "issuer_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
                "credential_type": "Course Completion Certificate",
                "description": "Blockchain Development Bootcamp 2024",
                "metadata_uri": "ipfs://QmX..."
            }
        }


class CredentialResponse(BaseModel):
    credential_id: str
    transaction_hash: str
    status: str
    message: str
    issue_date: str


class VerifyCredentialResponse(BaseModel):
    exists: bool
    is_valid: bool
    recipient_name: Optional[str] = None
    issuer_name: Optional[str] = None
    credential_type: Optional[str] = None
    issue_date: Optional[str] = None
    message: str


class CredentialDetails(BaseModel):
    credential_id: str
    recipient_name: str
    recipient_email: str
    issuer_name: str
    credential_type: str
    description: str
    issue_date: str
    issuer_address: str
    is_valid: bool
    metadata_uri: Optional[str] = None


class IssuerAuthorization(BaseModel):
    issuer_address: str = Field(..., description="Address to authorize as issuer")
    owner_address: str = Field(..., description="Contract owner address")

    class Config:
        json_schema_extra = {
            "example": {
                "issuer_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
                "owner_address": "0x1234567890123456789012345678901234567890"
            }
        }


class QRCodeResponse(BaseModel):
    credential_id: str
    qr_code: str  # Base64 encoded image
    verification_url: str