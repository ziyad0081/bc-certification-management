// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CredentialVerification {
    
    struct Credential {
        string credentialId;
        string recipientName;
        string recipientEmail;
        string issuerName;
        string credentialType;
        string description;
        uint256 issueDate;
        address issuer;
        bool isValid;
        string metadataURI;
    }
    
    // Mapping from credential ID to Credential
    mapping(string => Credential) public credentials;
    
    // Mapping from address to list of credential IDs they issued
    mapping(address => string[]) public issuerCredentials;
    
    // Mapping from recipient email to list of credential IDs
    mapping(string => string[]) public recipientCredentials;
    
    // Authorized issuers (universities, organizations)
    mapping(address => bool) public authorizedIssuers;
    
    // Contract owner
    address public owner;
    
    // Events
    event CredentialIssued(
        string indexed credentialId,
        address indexed issuer,
        string recipientEmail,
        uint256 issueDate
    );
    
    event CredentialRevoked(
        string indexed credentialId,
        address indexed issuer
    );
    
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }
    
    // Authorize a new issuer
    function authorizeIssuer(address _issuer) public onlyOwner {
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer);
    }
    
    // Revoke issuer authorization
    function revokeIssuerAuthorization(address _issuer) public onlyOwner {
        authorizedIssuers[_issuer] = false;
        emit IssuerRevoked(_issuer);
    }
    
    // Issue a new credential
    function issueCredential(
        string memory _credentialId,
        string memory _recipientName,
        string memory _recipientEmail,
        string memory _issuerName,
        string memory _credentialType,
        string memory _description,
        string memory _metadataURI
    ) public onlyAuthorizedIssuer {
        require(
            bytes(credentials[_credentialId].credentialId).length == 0,
            "Credential ID already exists"
        );
        
        Credential memory newCredential = Credential({
            credentialId: _credentialId,
            recipientName: _recipientName,
            recipientEmail: _recipientEmail,
            issuerName: _issuerName,
            credentialType: _credentialType,
            description: _description,
            issueDate: block.timestamp,
            issuer: msg.sender,
            isValid: true,
            metadataURI: _metadataURI
        });
        
        credentials[_credentialId] = newCredential;
        issuerCredentials[msg.sender].push(_credentialId);
        recipientCredentials[_recipientEmail].push(_credentialId);
        
        emit CredentialIssued(_credentialId, msg.sender, _recipientEmail, block.timestamp);
    }
    
    // Revoke a credential
    function revokeCredential(string memory _credentialId) public {
        require(
            credentials[_credentialId].issuer == msg.sender,
            "Only the issuer can revoke this credential"
        );
        require(
            credentials[_credentialId].isValid,
            "Credential is already revoked"
        );
        
        credentials[_credentialId].isValid = false;
        emit CredentialRevoked(_credentialId, msg.sender);
    }
    
    // Verify a credential
    function verifyCredential(string memory _credentialId) 
        public 
        view 
        returns (
            bool exists,
            bool isValid,
            string memory recipientName,
            string memory issuerName,
            string memory credentialType,
            uint256 issueDate
        ) 
    {
        Credential memory cred = credentials[_credentialId];
        
        exists = bytes(cred.credentialId).length > 0;
        
        if (exists) {
            return (
                true,
                cred.isValid,
                cred.recipientName,
                cred.issuerName,
                cred.credentialType,
                cred.issueDate
            );
        }
        
        return (false, false, "", "", "", 0);
    }
    
    // Get credential details
    function getCredential(string memory _credentialId) 
        public 
        view 
        returns (Credential memory) 
    {
        return credentials[_credentialId];
    }
    
    // Get all credentials issued by an address
    function getIssuerCredentials(address _issuer) 
        public 
        view 
        returns (string[] memory) 
    {
        return issuerCredentials[_issuer];
    }
    
    // Get all credentials for a recipient
    function getRecipientCredentials(string memory _email) 
        public 
        view 
        returns (string[] memory) 
    {
        return recipientCredentials[_email];
    }
    
    // Check if an address is an authorized issuer
    function isAuthorizedIssuer(address _issuer) public view returns (bool) {
        return authorizedIssuers[_issuer];
    }
}