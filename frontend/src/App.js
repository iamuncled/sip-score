import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { sipScoreAbi, sipScoreAddress } from './config';
import './App.css';

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [nftId, setNftId] = useState('');
  const [pointsEarned, setPointsEarned] = useState('');
  const [customerBalance, setCustomerBalance] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const initWeb3 = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);

        const sipScoreContract = new web3Instance.eth.Contract(sipScoreAbi, sipScoreAddress);
        setContract(sipScoreContract);
      } else {
        alert('Please install MetaMask to use this app.');
      }
    };
    initWeb3();
    getCurrentWalletConnected(); 
    addWalletListener();
  }, []);

  useEffect(() => {
    fetchCustomerBalance(account);
  }, [account, contract]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        fetchCustomerBalance(accounts[0]);
        console.log(accounts[0]);
      } catch (error) {
        console.error('User denied account access');
      }
    } else {
      alert('Please install MetaMask to use this app.');
    }
  };
  
  const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          fetchCustomerBalance(accounts[0]);
          console.log(accounts[0]);
        } else {
          console.log("Connect to MetaMask using the Connect button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      console.log("Please install MetaMask");
    }
  };
  
  const addWalletListener = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
        fetchCustomerBalance(accounts[0]);
        console.log(accounts[0]);
      });
    } else {
      console.log("Please install MetaMask");
    }
  };  
  
  const mintNFT = async () => {
    if (contract && account) {
      try {
        await contract.methods.mintNFT().send({ from: account });
        alert('NFT successfully minted!');
      } catch (error) {
        console.error('Error minting NFT:', error);
      }
    } else {
      alert('Please connect your wallet first.');
    }
  };

  const updateBalance = async (tokenId, points) => {
    if (contract && account) {
      try {
        await contract.methods.updateBalance(tokenId, points).send({ from: account });
        alert('Balance updated successfully!');
        fetchCustomerBalance();
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    } else {
      alert('Please connect your wallet first.');
    }
  };

  const handleUpdateBalanceClick = () => {
    if (nftId && pointsEarned) {
      updateBalance(nftId, pointsEarned);
    } else {
      alert('Please enter a valid NFT ID and Points Earned.');
    }
  };

  const fetchCustomerBalance = async (account) => {
    if (contract && account) {
      try {
        const tokenId = await contract.methods.getTokenId(account).call();
        console.log('Token ID:', tokenId); // Debug: log the token ID
        const balance = await contract.methods.getBalance(tokenId).call();
        console.log('Balance:', balance); // Debug: log the balance
        setCustomerBalance(balance);
      } catch (error) {
        console.error('Error fetching customer balance:', error);
      }
    }
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  const redeemReward = async () => {
    if (contract && account) {
      const tokenId = await contract.methods.tokenOfOwnerByIndex(account, 0).call();
      const pointsToRedeem = 50; // Set this to the number of points needed to redeem a reward
  
      try {
        await contract.methods.redeem(tokenId, pointsToRedeem).send({ from: account });
        alert('Reward successfully redeemed!');
        setShowConfirmation(true);
      } catch (error) {
        console.error('Error redeeming reward:', error);
      }
    } else {
      alert('Please connect your wallet first.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>SipScore</h1>
        <h3>The ultimate reward system for your bar</h3>
        <button onClick={mintNFT}>Mint</button>
        <button onClick={connectWallet}>
            {account && account.length > 0
              ? `Connected: ${account.substring(0, 5)}...${account.substring(38)}`
              : "Connect"}
          </button>
        <label htmlFor="nft-id">NFT ID:</label>
        <input type="text" id="nft-id" value={nftId} onChange={(e) => setNftId(e.target.value)} />
        <label htmlFor="points-earned">Points Earned:</label>
        <input type="text" id="points-earned" value={pointsEarned} onChange={(e) => setPointsEarned(e.target.value)} />
        <button onClick={handleUpdateBalanceClick}>Update Balance</button>
        <div id="balance">Your balance is: {customerBalance}</div>
        <button onClick={redeemReward}>Redeem Reward</button>
        {showConfirmation && (
          <div className="confirmation-screen">
            <h2>Redemption Confirmation</h2>
            <p>Show this screen to the staff to claim your reward.</p>
            <button onClick={closeConfirmation}>Close</button>
          </div>
        )}
      </header>
    </div>
  );
}
export default App;
