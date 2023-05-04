import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { sipScoreAbi, sipScoreAddress } from './config';
import './App.css';

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

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
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      } catch (error) {
        console.error('User denied account access');
      }
    } else {
      alert('Please install MetaMask to use this app.');
    }
  };

  const mintNFT = async () => {
    if (contract && account) {
      try {
        await contract.methods.mint(account).send({ from: account });
        alert('NFT successfully minted!');
      } catch (error) {
        console.error('Error minting NFT:', error);
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
        <button onClick={connectWallet}>Connect</button>
        <label htmlFor="nft-id">NFT ID:</label>
        <input type="text" id="nft-id" />
        <label htmlFor="points-earned">Points Earned:</label>
        <input type="text" id="points-earned" />
        <div id="balance">Your balance is: x</div>
        <button>Redeem Reward</button>
      </header>
    </div>
  );
}
export default App;
