# Blockchain-based Credential Verification System

A full-stack decentralized application (DApp) for issuing, verifying, and managing academic credentials on the blockchain. This system provides tamper-proof, transparent, and immutable credential management.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636.svg)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [Important Notes](#important-notes)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **🎓 Issue Credentials**: Authorized institutions can issue blockchain-verified credentials
- **✅ Verify Credentials**: Instantly verify credential authenticity
- **📱 QR Code Support**: Generate QR codes for easy verification
- **🔒 Immutable Records**: All credentials permanently stored on blockchain
- **❌ Revocation**: Issuers can revoke credentials if needed
- **🔐 Authorization System**: Only authorized addresses can issue credentials
- **📑 PDF & QR Code Features**: The system uses WeasyPrint for modern, high-fidelity certificate generation with custom TTF/OTF fonts, Flexbox Layout, and QR Verification.

### Use Cases
- Course completion certificates
- Competition awards
- Project validations
- Internship completions
- Academic achievements

## 🛠️ Tech Stack

### Smart Contract
- **Solidity** (v0.8.19) - Smart contract development
- **Hardhat** - Ethereum development environment
- **OpenZeppelin** - Secure smart contract library

### Backend
- **FastAPI** - Modern Python web framework
- **Web3.py** - Ethereum blockchain interaction
- **Pydantic** - Data validation
- **QRCode** - QR code generation

### Frontend
- **React** (v18.2.0) - UI library
- **Web3.js** - Blockchain interaction
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Vite** - Build tool

## 📁 Project Structure

```
credential-verification/
├── smart-contracts/              # Blockchain smart contracts
│   ├── contracts/
│   │   └── CredentialVerification.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── hardhat.config.js
│   ├── package.json
│   └── .env.example
│
├── backend/                      # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # Main FastAPI app
│   │   ├── models.py            # Pydantic models
│   │   ├── blockchain.py        # Web3 service
│   │   ├── config.py            # Configuration
│   │   ├── pdf_utils.py         # PDF generation utilities
│   │   ├── contract-abi.json    # Auto-generated
│   │   └── contract-address.json # Auto-generated
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── ui/              # UI components
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── DownloadButton.jsx
│   │   │   │   └── QRCodeDisplay.jsx
│   │   ├── contexts/
│   │   │   └── Web3Context.jsx  # Web3 state management
│   │   ├── pages/               # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── IssueCredential.jsx
│   │   │   ├── VerifyCredential.jsx
│   │   │   ├── MyCredentials.jsx
│   │   │   └── IssuerDashboard.jsx
│   │   ├── contracts/           # Contract files
│   │   │   ├── contract-abi.json
│   │   │   └── contract-address.json
│   │   ├── lib/
│   │   │   └── utils.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── .gitignore
└── README.md
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/)
- **npm** or **yarn** - Comes with Node.js
- **MetaMask** - Browser extension for Web3 interaction
- **Git** - For cloning the repository
- **GTK3 Runtime** (Required for PDF Generation)
  * WeasyPrint requires the GTK+ libraries to render fonts and layouts.
  * **Windows**: Download the [GTK3 Installer](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases). **Important**: Check "Add to PATH" during installation.
  * **macOS**: `brew install pango libffi`
  * **Linux**: `sudo apt install libpango-1.0-0 libpangoft2-1.0-0 shared-mime-info`

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/credential-verification.git
cd credential-verification
```

### 2. Smart Contract Setup

```bash
cd smart-contracts

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env if deploying to testnet (optional)
```

### 3. Backend Setup

```bash
cd ../backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

## 🚀 Running the Application

You need **three terminal windows** to run all components:

### Terminal 1: Start Hardhat Node (Blockchain)

```bash
cd smart-contracts
npx hardhat node
```

**Keep this running!** You'll see 20 test accounts with private keys. Note the first account:
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Terminal 2: Deploy Smart Contract & Start Backend

```bash
# Deploy the smart contract (in smart-contracts directory)
cd smart-contracts
npx hardhat run scripts/deploy.js --network localhost

# Output will show:
# CredentialVerification deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

# Start the backend (in backend directory)
cd ../backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be available at:** http://localhost:8000

### Terminal 3: Start Frontend

```bash
cd frontend
npm run dev
```

**Frontend will be available at:** http://localhost:5173

## 📖 Usage Guide

### 1. Setup MetaMask

1. **Install MetaMask** browser extension
2. **Add Hardhat Network** to MetaMask:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

3. **Import Test Account**:
   - Click "Import Account" in MetaMask
   - Paste the private key from Hardhat node output
   - This account is pre-authorized to issue credentials

### 2. Connect Wallet

1. Open http://localhost:5173
2. Click "Connect Wallet" button
3. Approve the connection in MetaMask
4. Ensure you're on the Hardhat Local network

### 3. Issue a Credential

1. Navigate to **Issue Credential**
2. Fill in the form:
   - Recipient Name: `John Doe`
   - Recipient Email: `john@example.com`
   - Issuer Name: `University of Technology`
   - Credential Type: `Course Completion Certificate`
   - Description: `Blockchain Development Bootcamp 2024`
3. Click **Issue Credential**
4. Confirm transaction in MetaMask
5. Wait for confirmation (you'll see the transaction hash)

### 4. Verify a Credential

1. Navigate to **Verify**
2. Enter the Credential ID (from the issue step)
3. Click **Verify Credential**
4. View the full credential details

### 5. View Your Credentials

1. Navigate to **My Credentials**
2. Enter your email address
3. View all credentials issued to that email

### 6. Issuer Dashboard

1. Navigate to **Issuer Dashboard**
2. View all credentials you've issued
3. Revoke credentials if needed

## ⚠️ Important Notes

### Authorization
- **Only the deployer account** is authorized by default
- To authorize more issuers, the contract owner must call `authorizeIssuer(address)`
- Test account #0 from Hardhat is pre-authorized

### Transaction Signing
- All transactions must be signed through MetaMask
- The frontend sends transactions directly to the blockchain
- The backend only reads data from the blockchain

### Data Privacy
- All credential data is stored on the blockchain
- Recipient emails are visible on-chain
- Consider privacy implications before using real data

### Network
- Default setup uses Hardhat local network (Chain ID: 1337)
- For production, deploy to testnets (Sepolia, Polygon Mumbai) or mainnet
- Update contract addresses in both backend and frontend after deployment

### Contract Files
- `contract-abi.json` and `contract-address.json` are auto-generated during deployment
- These files are copied to both backend and frontend
- Don't manually edit these files

## 🔧 Troubleshooting

### "Smart contract not initialized"
**Problem:** Backend can't find contract files

**Solution:**
```bash
cd smart-contracts
npx hardhat run scripts/deploy.js --network localhost
```

### "Please install MetaMask"
**Problem:** MetaMask not detected

**Solution:**
1. Install MetaMask browser extension
2. Refresh the page

### "Wrong Network"
**Problem:** Connected to wrong blockchain network

**Solution:**
1. Open MetaMask
2. Switch to "Hardhat Local" network
3. If network doesn't exist, add it manually (see Setup MetaMask section)

### "Not an authorized issuer"
**Problem:** Account not authorized to issue credentials

**Solution:**
1. Use Account #0 from Hardhat (pre-authorized)
2. Or have the contract owner authorize your account

### "OSError: cannot load library <>"
**Problem:** WeasyPrint cannot find the GTK+ libraries.

**Solution:**
1. Ensure you installed the GTK3 Runtime.
2. Ensure you checked "Add to PATH" during installation.
3. Restart your computer or terminal.

### "Certificate fonts look like Helvetica/Serif"
**Problem:** The custom font file isn't being loaded.

**Solution:**
* Verify the font file exists in `backend/assets/fonts/`.
* Ensure you are using a static `.ttf` file rather than a "Variable" font file.

### Port Already in Use

**For Hardhat (8545):**
```bash
# Linux/macOS
lsof -ti:8545 | xargs kill -9

# Windows
netstat -ano | findstr :8545
taskkill /PID <PID> /F
```

**For Backend (8000):**
```bash
# Linux/macOS
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**For Frontend (5173):**
```bash
# Linux/macOS
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Transaction Fails
**Common causes:**
- Insufficient gas
- Not connected to correct network
- Account not authorized (for issuing)
- Credential ID already exists

**Solution:**
- Check MetaMask network
- Ensure you have test ETH
- Verify account authorization

## 📚 API Documentation

Once the backend is running, visit:
- **Interactive API Docs:** http://localhost:8000/docs
- **Alternative Docs:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

## 🧪 Testing

### Test API with curl

```bash
# Health check
curl http://localhost:8000/health

# Verify credential
curl http://localhost:8000/api/credentials/verify/YOUR_CREDENTIAL_ID

# Get recipient credentials
curl http://localhost:8000/api/recipients/john@example.com/credentials
```

## 🌐 Deployment to Testnet

### 1. Get Test ETH

- **Sepolia:** https://sepoliafaucet.com/
- **Polygon Mumbai:** https://faucet.polygon.technology/

### 2. Configure Environment

Edit `smart-contracts/.env`:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key_without_0x
```

### 3. Deploy to Testnet

```bash
cd smart-contracts
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Update Backend

Edit `backend/.env`:
```env
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CHAIN_ID=11155111
```

### 5. Update Frontend

The contract files will be auto-updated. Just rebuild:
```bash
cd frontend
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Hardhat for excellent development tools
- FastAPI for the modern Python framework
- React and Vite for frontend tooling

## 💬 Support

If you have any questions or run into issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [API Documentation](http://localhost:8000/docs)
3. Open an issue on GitHub

---

**⚡ Quick Start Commands:**

```bash
# Terminal 1 - Blockchain
cd smart-contracts && npx hardhat node

# Terminal 2 - Deploy & Backend
cd smart-contracts && npx hardhat run scripts/deploy.js --network localhost
cd ../backend && source venv/bin/activate && uvicorn app.main:app --reload

# Terminal 3 - Frontend
cd frontend && npm run dev
```

**🔗 Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

Made with ❤️ using Blockchain Technology