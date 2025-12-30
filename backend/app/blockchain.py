from web3 import Web3
from web3.middleware import geth_poa_middleware
import json
import os
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
from eth_account import Account

class BlockchainService:
    def __init__(self):
        self.w3 = None
        self.contract = None
        self.contract_address = None
        self.contract_abi = None
        self._initialize()

    def _initialize(self):
        """Initialize Web3 connection and load contract"""
        try:
            # Connect to local blockchain (Hardhat)
            rpc_url = os.getenv("BLOCKCHAIN_RPC_URL", "http://127.0.0.1:8545")
            self.w3 = Web3(Web3.HTTPProvider(rpc_url))
            
            # Add PoA middleware for some networks
            self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
            
            # Load contract address and ABI
            self._load_contract_info()
            
            if self.contract_address and self.contract_abi:
                self.contract = self.w3.eth.contract(
                    address=Web3.to_checksum_address(self.contract_address),
                    abi=self.contract_abi
                )
                print(f"Connected to contract at {self.contract_address}")
            else:
                print("Contract not deployed yet. Please deploy the smart contract first.")
                
        except Exception as e:
            print(f"Error initializing blockchain service: {e}")
            self.w3 = None

    def _load_contract_info(self):
        """Load contract address and ABI from files"""
        try:
            base_path = Path(__file__).parent
            
            # Load contract address
            address_file = base_path / "contract-address.json"
            if address_file.exists():
                with open(address_file, 'r') as f:
                    data = json.load(f)
                    self.contract_address = data.get("address")
            
            # Load contract ABI
            abi_file = base_path / "contract-abi.json"
            if abi_file.exists():
                with open(abi_file, 'r') as f:
                    self.contract_abi = json.load(f)
                    
        except Exception as e:
            print(f"Error loading contract info: {e}")

    def is_connected(self) -> bool:
        """Check if connected to blockchain"""
        try:
            return self.w3 is not None and self.w3.is_connected()
        except:
            return False

    def _send_transaction(self, txn_dict: Dict) -> str:
        """Sign and send a transaction"""
        try:
            # Load private key from settings
            from .config import settings
            private_key = settings.private_key
            if not private_key:
                raise Exception("Private key not configured")

            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(txn_dict, private_key)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            if receipt['status'] == 1:
                return tx_hash.hex()
            else:
                raise Exception("Transaction failed")
                
        except Exception as e:
            raise Exception(f"Transaction failed: {str(e)}")

    def issue_credential(
        self,
        credential_id: str,
        recipient_name: str,
        recipient_email: str,
        issuer_name: str,
        credential_type: str,
        description: str,
        metadata_uri: str,
        issuer_address: str
    ) -> str:
        """Issue a new credential on the blockchain"""
        if not self.contract:
            raise Exception("Smart contract not initialized")

        try:
            # Convert address to checksum format
            issuer_checksum = Web3.to_checksum_address(issuer_address)
            
            # Build transaction
            txn = self.contract.functions.issueCredential(
                credential_id,
                recipient_name,
                recipient_email,
                issuer_name,
                credential_type,
                description,
                metadata_uri
            ).build_transaction({
                'from': issuer_checksum,
                'nonce': self.w3.eth.get_transaction_count(issuer_checksum),
                'gas': 2000000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            return self._send_transaction(txn)
            
        except Exception as e:
            raise Exception(f"Error issuing credential: {str(e)}")

    def verify_credential(self, credential_id: str) -> Dict:
        """Verify a credential"""
        if not self.contract:
            raise Exception("Smart contract not initialized")

        try:
            result = self.contract.functions.verifyCredential(credential_id).call()
            
            return {
                "exists": result[0],
                "is_valid": result[1],
                "recipient_name": result[2],
                "issuer_name": result[3],
                "credential_type": result[4],
                "issue_date": datetime.fromtimestamp(result[5]).isoformat() if result[5] > 0 else None
            }
            
        except Exception as e:
            raise Exception(f"Error verifying credential: {str(e)}")

    def get_credential(self, credential_id: str) -> Optional[Dict]:
        """Get full credential details"""
        if not self.contract:
            raise Exception("Smart contract not initialized")

        try:
            result = self.contract.functions.getCredential(credential_id).call()
            
            return {
                "credentialId": result[0],
                "recipientName": result[1],
                "recipientEmail": result[2],
                "issuerName": result[3],
                "credentialType": result[4],
                "description": result[5],
                "issueDate": result[6],
                "issuer": result[7],
                "isValid": result[8],
                "metadataURI": result[9]
            }
            
        except Exception as e:
            raise Exception(f"Error getting credential: {str(e)}")

    def revoke_credential(self, credential_id: str, issuer_address: str) -> str:
        """Revoke a credential"""
        if not self.contract:
            raise Exception("Smart contract not initialized")

        try:
            issuer_checksum = Web3.to_checksum_address(issuer_address)
            
            txn = self.contract.functions.revokeCredential(
                credential_id
            ).build_transaction({
                'from': issuer_checksum,
                'nonce': self.w3.eth.get_transaction_count(issuer_checksum),
                'gas': 2000000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            return self._send_transaction(txn)
            
        except Exception as e:
            raise Exception(f"Error revoking credential: {str(e)}")

    def authorize_issuer(self, issuer_address: str, owner_address: str) -> str:
        """Authorize a new issuer"""
        if not self.contract:
            raise Exception("Smart contract not initialized")

        try:
            issuer_checksum = Web3.to_checksum_address(issuer_address)
            owner_checksum = Web3.to_checksum_address(owner_address)
            
            txn = self.contract.functions.authorizeIssuer(
                issuer_checksum
            ).build_transaction({
                'from': owner_checksum,
                'nonce': self.w3.eth.get_transaction_count(owner_checksum),
                'gas': 2000000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            return self._send_transaction(txn)
            
        except Exception as e:
            raise Exception(f"Error authorizing issuer: {str(e)}")

    def get_issuer_credentials(self, issuer_address: str) -> List[str]:
        """Get all credentials issued by an address"""
        if not self.contract:
            raise Exception("Smart contract not initialized")

        try:
            issuer_checksum = Web3.to_checksum_address(issuer_address)
            return self.contract.functions.getIssuerCredentials(issuer_checksum).call()
            
        except Exception as e:
            raise Exception(f"Error getting issuer credentials: {str(e)}")

    def get_recipient_credentials(self, email: str) -> List[str]:
        """Get all credentials for a recipient"""
        if not self.contract:
            raise Exception("Smart contract not initialized")

        try:
            return self.contract.functions.getRecipientCredentials(email).call()
            
        except Exception as e:
            raise Exception(f"Error getting recipient credentials: {str(e)}")

    def is_authorized_issuer(self, issuer_address: str) -> bool:
        """Check if an address is an authorized issuer"""
        if not self.contract:
            raise Exception("Smart contract not initialized")

        try:
            issuer_checksum = Web3.to_checksum_address(issuer_address)
            return self.contract.functions.isAuthorizedIssuer(issuer_checksum).call()
            
        except Exception as e:
            raise Exception(f"Error checking issuer authorization: {str(e)}")