import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import contractABI from '../contracts/contract-abi.json';
import contractAddress from '../contracts/contract-address.json';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initWeb3();
  }, []);

  const initWeb3 = async () => {
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // Get network
        const network = await web3Instance.eth.getChainId();
        setChainId(Number(network));

        // Setup contract
        const contractInstance = new web3Instance.eth.Contract(
          contractABI,
          contractAddress.address
        );
        setContract(contractInstance);

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      } else {
        console.warn('MetaMask not detected');
      }
    } catch (err) {
      console.error('Error initializing Web3:', err);
      // Don't set global error on init failure to avoid annoying popup
    }
  };

  const clearError = () => setError(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError('MetaMask is not installed. Please install MetaMask extension from https://metamask.io/download/');
        // Open MetaMask download page in new tab
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setAccount(accounts[0]);
      setIsConnected(true);
      setError(null);
      return accounts[0];
    } catch (err) {
      console.error('Error connecting wallet:', err);
      if (err.code === 4001) {
        setError('Wallet connection rejected. Please try again and approve the connection.');
      } else {
        setError(`Failed to connect wallet: ${err.message || 'Unknown error'}`);
      }
      return null;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const switchToHardhatNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }], // 1337 in hex
      });
    } catch (err) {
      // If network doesn't exist, add it
      if (err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x539',
            chainName: 'Hardhat Local',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['http://127.0.0.1:8545'],
          }],
        });
      }
    }
  };

  const issueCredential = async (credentialData) => {
    if (!contract || !account) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const tx = await contract.methods.issueCredential(
        credentialData.credentialId,
        credentialData.recipientName,
        credentialData.recipientEmail,
        credentialData.issuerName,
        credentialData.credentialType,
        credentialData.description,
        credentialData.metadataUri || ''
      ).send({ from: account });

      return tx.transactionHash;
    } catch (err) {
      console.error('Error issuing credential:', err);
      throw err;
    }
  };

  const verifyCredential = async (credentialId) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const result = await contract.methods.verifyCredential(credentialId).call();
      return {
        exists: result[0],
        isValid: result[1],
        recipientName: result[2],
        issuerName: result[3],
        credentialType: result[4],
        issueDate: Number(result[5])
      };
    } catch (err) {
      console.error('Error verifying credential:', err);
      throw err;
    }
  };

  const getCredential = async (credentialId) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const result = await contract.methods.getCredential(credentialId).call();
      return {
        credentialId: result[0],
        recipientName: result[1],
        recipientEmail: result[2],
        issuerName: result[3],
        credentialType: result[4],
        description: result[5],
        issueDate: Number(result[6]),
        issuer: result[7],
        isValid: result[8],
        metadataURI: result[9]
      };
    } catch (err) {
      console.error('Error getting credential:', err);
      throw err;
    }
  };

  const revokeCredential = async (credentialId) => {
    if (!contract || !account) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const tx = await contract.methods.revokeCredential(credentialId).send({ from: account });
      return tx.transactionHash;
    } catch (err) {
      console.error('Error revoking credential:', err);
      throw err;
    }
  };

  const getIssuerCredentials = async (issuerAddress) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const credentialIds = await contract.methods.getIssuerCredentials(issuerAddress).call();
      return credentialIds;
    } catch (err) {
      console.error('Error getting issuer credentials:', err);
      throw err;
    }
  };

  const getRecipientCredentials = async (email) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const credentialIds = await contract.methods.getRecipientCredentials(email).call();
      return credentialIds;
    } catch (err) {
      console.error('Error getting recipient credentials:', err);
      throw err;
    }
  };

  const isAuthorizedIssuer = async (address) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await contract.methods.isAuthorizedIssuer(address).call();
    } catch (err) {
      console.error('Error checking issuer authorization:', err);
      throw err;
    }
  };

  const value = {
    web3,
    account,
    contract,
    isConnected,
    chainId,
    error,
    connectWallet,
    disconnectWallet,
    switchToHardhatNetwork,
    issueCredential,
    verifyCredential,
    getCredential,
    revokeCredential,
    getIssuerCredentials,
    getRecipientCredentials,
    isAuthorizedIssuer,
    clearError,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
