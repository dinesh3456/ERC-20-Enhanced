import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TokenABI from "./TokenABI.json";

const contractAddress = "0x88DdAE528B02AE0c9b4A020337aaafc24DEA50a0";

function App() {
  const [tokenInfo, setTokenInfo] = useState({});
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [mintRecipient, setMintRecipient] = useState("");
  const [blacklistAddress, setBlacklistAddress] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          const signer = await provider.getSigner();
          setSigner(signer);
          const address = await signer.getAddress();
          setUserAddress(address);

          const contract = new ethers.Contract(
            contractAddress,
            TokenABI,
            signer
          );
          setContract(contract);

          await fetchTokenInfo(contract, signer);
          await checkOwner(contract, address);
        } catch (error) {
          console.error("Error initializing:", error);
          setError(
            "Failed to initialize. Please make sure MetaMask is connected."
          );
        }
      } else {
        setError("Ethereum provider not found. Please install MetaMask.");
      }
    };

    init();
  }, []);

  const fetchTokenInfo = async (contract, signer) => {
    try {
      const symbol = await contract.symbol();
      const totalSupply = await contract.totalSupply();
      const cap = await contract.cap();
      const owner = await contract.owner();
      const paused = await contract.paused();
      const name = await contract.name();
      const decimals = await contract.decimals();

      const userAddress = await signer.getAddress();
      const userBalance = await contract.balanceOf(userAddress);

      setTokenInfo({
        symbol,
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        cap: ethers.formatUnits(cap, decimals),
        owner,
        paused,
        name,
        decimals,
        userBalance: ethers.formatUnits(userBalance, decimals),
      });
    } catch (err) {
      console.error("Error fetching token info:", err);
      setError("Failed to fetch token information. Please try again later.");
    }
  };

  const checkOwner = async (contract, address) => {
    try {
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
    } catch (error) {
      console.error("Error checking owner:", error);
    }
  };

  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      setSigner(signer);
      const address = await signer.getAddress();
      setUserAddress(address);
      const contract = new ethers.Contract(contractAddress, TokenABI, signer);
      setContract(contract);
      await fetchTokenInfo(contract);
      checkOwner(contract, address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const senderBalance = await contract.balanceOf(userAddress);
      console.log("Sender balance:", ethers.formatEther(senderBalance));

      const isPaused = await contract.paused();
      console.log("Contract paused:", isPaused);

      const isSenderBlacklisted = await contract.blacklist(userAddress);
      const isRecipientBlacklisted = await contract.blacklist(recipient);
      console.log("Sender blacklisted:", isSenderBlacklisted);
      console.log("Recipient blacklisted:", isRecipientBlacklisted);

      console.log("Attempting to transfer", amount, "tokens to", recipient);

      const tx = await contract.transfer(recipient, ethers.parseEther(amount));
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      alert("Transfer successful!");
      fetchTokenInfo(contract);
    } catch (error) {
      console.error("Detailed error:", error);
      if (error.reason) {
        alert("Transfer failed: " + error.reason);
      } else if (error.data && error.data.message) {
        alert("Transfer failed: " + error.data.message);
      } else {
        alert("Transfer failed: " + error.message);
      }
    }
  };
  const handleBurn = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.burn(ethers.parseEther(amount));
      await tx.wait();
      alert("Burn successful!");
      fetchTokenInfo(contract);
    } catch (error) {
      console.error("Error burning tokens:", error);
      alert("Burn failed: " + error.message);
    }
  };

  const checkOwnerStatus = async () => {
    try {
      const owner = await contract.owner();
      const currentUser = await signer.getAddress();
      console.log("Contract Owner:", owner);
      console.log("Current User:", currentUser);
      console.log(
        "Is Current User Owner:",
        owner.toLowerCase() === currentUser.toLowerCase()
      );
    } catch (error) {
      console.error("Error checking owner status:", error);
    }
  };
  const checkSupplyAndCap = async () => {
    try {
      const totalSupply = await contract.totalSupply();
      const cap = await contract.cap();
      const decimals = await contract.decimals();
      console.log("Total Supply:", ethers.formatUnits(totalSupply, decimals));
      console.log("Cap:", ethers.formatUnits(cap, decimals));
      console.log(
        "Remaining Mintable:",
        ethers.formatUnits(cap - totalSupply, decimals)
      );
    } catch (error) {
      console.error("Error checking supply and cap:", error);
    }
  };

  const mintTokens = async (amount) => {
    try {
      await checkOwnerStatus();
      await checkSupplyAndCap();

      const decimals = await contract.decimals();
      const mintAmount = ethers.parseUnits(amount.toString(), decimals);
      console.log(
        "Attempting to mint:",
        ethers.formatUnits(mintAmount, decimals),
        "tokens"
      );

      const tx = await contract.mint(await signer.getAddress(), mintAmount, {
        gasLimit: 200000, // Explicitly set gas limit
      });
      console.log("Mint transaction sent:", tx.hash);
      await tx.wait();
      console.log("Mint transaction confirmed");

      // Check new balance and total supply
      const newBalance = await contract.balanceOf(await signer.getAddress());
      const newTotalSupply = await contract.totalSupply();
      console.log("New Balance:", ethers.formatUnits(newBalance, decimals));
      console.log(
        "New Total Supply:",
        ethers.formatUnits(newTotalSupply, decimals)
      );
    } catch (error) {
      console.error("Detailed minting error:", error);
      if (error.reason) console.error("Error reason:", error.reason);
      if (error.code) console.error("Error code:", error.code);
      if (error.data) console.error("Error data:", error.data);
      if (error.transaction)
        console.error("Error transaction:", error.transaction);
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    try {
      await mintTokens(mintAmount);

      alert("Mint successful!");
      fetchTokenInfo(contract);
    } catch (error) {
      console.error("Error minting tokens:", error);
      alert("Mint failed: " + error.message);
    }
  };

  const handlePause = async () => {
    try {
      const tx = await contract.pause();
      await tx.wait();
      alert("Contract paused successfully!");
      fetchTokenInfo(contract);
    } catch (error) {
      console.error("Error pausing contract:", error);
      alert("Pause failed: " + error.message);
    }
  };

  const handleUnpause = async () => {
    try {
      const tx = await contract.unpause();
      await tx.wait();
      alert("Contract unpaused successfully!");
      fetchTokenInfo(contract);
    } catch (error) {
      console.error("Error unpausing contract:", error);
      alert("Unpause failed: " + error.message);
    }
  };

  const handleBlacklist = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.updateBlacklist(blacklistAddress, true);
      await tx.wait();
      alert("Address blacklisted successfully!");
    } catch (error) {
      console.error("Error blacklisting address:", error);
      alert("Blacklist failed: " + error.message);
    }
  };

  const handleRemoveFromBlacklist = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.updateBlacklist(blacklistAddress, false);
      await tx.wait();
      alert("Address removed from blacklist successfully!");
    } catch (error) {
      console.error("Error removing address from blacklist:", error);
      alert("Remove from blacklist failed: " + error.message);
    }
  };

  return (
    <div className="App">
      <h1>Enhanced ERC20 Token</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!userAddress && <button onClick={connectWallet}>Connect Wallet</button>}
      {userAddress && <p>Connected Address: {userAddress}</p>}
      {tokenInfo.symbol && (
        <div>
          <h2>Token Info</h2>
          <p>Symbol: {tokenInfo.symbol}</p>
          <p>Total Supply: {tokenInfo.totalSupply}</p>
          <p>Max Supply: {tokenInfo.cap}</p>
          <p>Owner: {tokenInfo.owner}</p>
          <p>Paused: {tokenInfo.paused ? "Yes" : "No"}</p>
          <p>Name: {tokenInfo.name}</p>
          <p>Decimals: {tokenInfo.decimals}</p>
          <p>Your Balance: {tokenInfo.userBalance}</p>
        </div>
      )}
      {userAddress && (
        <div>
          <h2>Transfer Tokens</h2>
          <form onSubmit={handleTransfer}>
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <input
              type="text"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button type="submit">Transfer</button>
          </form>
          <h2>Burn Tokens</h2>
          <form onSubmit={handleBurn}>
            <input
              type="text"
              placeholder="Amount to Burn"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button type="submit">Burn</button>
          </form>
        </div>
      )}
      {isOwner && (
        <div>
          <h2>Owner Functions</h2>
          <h3>Mint Tokens</h3>
          <form onSubmit={handleMint}>
            <input
              type="text"
              placeholder="Recipient Address"
              value={mintRecipient}
              onChange={(e) => setMintRecipient(e.target.value)}
            />
            <input
              type="text"
              placeholder="Amount to Mint"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
            />
            <button type="submit">Mint</button>
          </form>
          <h3>Pause/Unpause Contract</h3>
          <button onClick={handlePause}>Pause Contract</button>
          <button onClick={handleUnpause}>Unpause Contract</button>
          <h3>Manage Blacklist</h3>
          <form onSubmit={handleBlacklist}>
            <input
              type="text"
              placeholder="Address to Blacklist"
              value={blacklistAddress}
              onChange={(e) => setBlacklistAddress(e.target.value)}
            />
            <button type="submit">Add to Blacklist</button>
          </form>
          <form onSubmit={handleRemoveFromBlacklist}>
            <input
              type="text"
              placeholder="Address to Remove from Blacklist"
              value={blacklistAddress}
              onChange={(e) => setBlacklistAddress(e.target.value)}
            />
            <button type="submit">Remove from Blacklist</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
