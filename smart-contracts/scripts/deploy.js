const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying CredentialVerification contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy the contract
  const CredentialVerification = await hre.ethers.getContractFactory("CredentialVerification");
  const credentialVerification = await CredentialVerification.deploy();

  await credentialVerification.waitForDeployment();

  const contractAddress = await credentialVerification.getAddress();
  console.log("CredentialVerification deployed to:", contractAddress);

  // Save contract address and ABI
  const contractData = {
    address: contractAddress,
    network: hre.network.name,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString()
  };

  // Create directories if they don't exist
  const backendDir = path.join(__dirname, "../../backend/app");
  const frontendDir = path.join(__dirname, "../../frontend-bc/src/contracts");

  [backendDir, frontendDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Save to backend
  fs.writeFileSync(
    path.join(backendDir, "contract-address.json"),
    JSON.stringify(contractData, null, 2)
  );

  // Save to frontend
  fs.writeFileSync(
    path.join(frontendDir, "contract-address.json"),
    JSON.stringify(contractData, null, 2)
  );

  // Copy ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/CredentialVerification.sol/CredentialVerification.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  fs.writeFileSync(
    path.join(backendDir, "contract-abi.json"),
    JSON.stringify(artifact.abi, null, 2)
  );

  fs.writeFileSync(
    path.join(frontendDir, "contract-abi.json"),
    JSON.stringify(artifact.abi, null, 2)
  );

  console.log("\nContract details saved to backend and frontend directories");
  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });