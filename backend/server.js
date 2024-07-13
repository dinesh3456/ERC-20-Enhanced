// server.js
const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
const TokenABI = require("./TokenABI.json");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const contractAddress = "0x88DdAE528B02AE0c9b4A020337aaafc24DEA50a0";
const provider = new ethers.JsonRpcProvider(
  "https://sepolia.infura.io/v3/81889c71684745eeb34cd219c7fa70dd"
);
const contract = new ethers.Contract(contractAddress, TokenABI, provider);

app.get("/api/token-info", async (req, res) => {
  try {
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const cap = await contract.cap();
    const owner = await contract.owner();
    const paused = await contract.paused();

    res.json({
      symbol,
      totalSupply: ethers.formatEther(totalSupply),
      cap: ethers.formatEther(cap),
      owner,
      paused,
    });
  } catch (error) {
    console.error("Error fetching token info:", error);
    res.status(500).json({ error: "Error fetching token info" });
  }
});

app.get("/api/balance/:address", async (req, res) => {
  try {
    const balance = await contract.balanceOf(req.params.address);
    res.json({ balance: ethers.formatEther(balance) });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ error: "Error fetching balance" });
  }
});

app.get("/api/blacklist/:address", async (req, res) => {
  try {
    const isBlacklisted = await contract.blacklist(req.params.address);
    res.json({ isBlacklisted });
  } catch (error) {
    console.error("Error checking blacklist status:", error);
    res.status(500).json({ error: "Error checking blacklist status" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
