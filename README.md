# 🗳️ Decentralized Blockchain Voting System

A secure, transparent, and tamper-proof voting platform built using:

- ⚛️ React (Frontend)
- 🟢 Node.js + Express (Backend)
- 🍃 MongoDB (Database)
- ⛓️ Solidity Smart Contract (Ethereum - Sepolia)
- 🦊 MetaMask + Ethers.js

This system ensures:
- One vote per wallet
- Transparent and immutable vote storage
- Admin-controlled election management
- OTP-based identity verification (off-chain)

---

# 📌 Features

## 👤 User Side
- Connect wallet via MetaMask
- OTP identity verification
- View active elections
- Vote securely on blockchain
- View real-time results

## 👨‍💼 Admin Side
- Admin wallet authentication
- Create elections
- Add candidates (before election starts)
- Monitor results
- Blockchain-enforced voting rules

## 🔐 Smart Contract Security
- Only admin can create elections
- Only admin can add candidates
- Voting allowed only during active period
- One vote per wallet
- Blockchain-based vote storage

---

# 🏗 Project Structure

root/
│
├── frontend/
│ ├── src/
│ ├── .env
│ └── package.json
│
├── backend/
│ ├── controllers/
│ ├── routes/
│ ├── blockchain/
│ ├── .env
│ └── package.json
│
└── contracts/
└── Voting.sol

---

# ⚙️ Environment Setup

---

# 🔧 1️⃣ Backend Setup

## Step 1: Install Dependencies
```bash
cd backend
npm install
```

## Step 2: Create `.env` file inside backend

PORT=9000  

MONGO_URI=your_mongodb_connection_string  

TWILIO_SID=your_twilio_sid  
TWILIO_AUTH=your_twilio_auth_token  
TWILIO_PHONE=your_twilio_phone_number  

PRIVATE_KEY=your_admin_wallet_private_key  
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY  

CONTRACT_ADDRESS=your_deployed_contract_address  


## Step 3: Run Backend

```bash
npm run dev
```


Backend runs at:
http://localhost:9000


---

# 💻 2️⃣ Frontend Setup

## Step 1: Install Dependencies

```bash
cd frontend
npm install
```


## Step 2: Create `.env` file inside frontend

VITE_API_URL=http://localhost:9000/api  
VITE_CONTRACT_ADDRESS=your_deployed_contract_address  


## Step 3: Run Frontend

```bash
npm run dev
```


Frontend runs at:
http://localhost:5173


---

# ⛓ 3️⃣ Smart Contract Deployment

## Step 1: Install Hardhat (if not installed)

```bash
npm install --save-dev hardhat
```


## Step 2: Compile Contract

```bash
npx hardhat compile
```


## Step 3: Deploy to Sepolia

Make sure:
- You have Sepolia ETH
- PRIVATE_KEY and RPC_URL are set

```bash
npx hardhat run scripts/deploy.js --network sepolia
```


After deployment:
- Copy deployed contract address
- Paste it into backend `.env`
- Paste it into frontend `.env`

Restart both servers.

---

# 🧠 How It Works

1. Admin deploys contract.
2. Admin creates election.
3. Admin adds candidates.
4. User verifies identity via OTP (backend).
5. User connects MetaMask wallet.
6. User votes on blockchain.
7. Votes are permanently stored on Ethereum.
8. Anyone can verify results.

---

# 🛠 Tech Stack

## Frontend
- React (Vite)
- React Router
- Tailwind CSS
- Axios
- Ethers.js v6
- MetaMask

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Twilio
- dotenv

## Blockchain
- Solidity 0.8.19
- Hardhat
- Ethers.js
- Ethereum Sepolia Testnet

---

# 🔥 Common Issues & Fixes

### ❌ "Voter not registered"
Make sure:
- registerVoter is called before election starts
- wallet is connected
- correct network (Sepolia)

### ❌ "Election already started"
Registration must happen before startTime.

### ❌ "Contract address not set"
Check:
VITE_CONTRACT_ADDRESS
CONTRACT_ADDRESS


Restart servers after editing `.env`.

### ❌ MetaMask not connecting
Make sure:
- MetaMask installed
- Using correct browser
- window.ethereum exists
- Sepolia network selected

---

# 🚀 Future Improvements

- Gasless voting (ERC-2771)
- Zero-Knowledge identity verification
- DAO-based admin governance
- On-chain voter registration
- Mainnet deployment

---

# 📜 License

MIT License

---

# 👤 Author

Bhavdeep Singh  
Blockchain & Full Stack Developer

Rahul yadav  
Blockchain & Full Stack Developer

---

# 🏁 Final Notes

✔ Always restart backend after changing `.env`  
✔ Always restart frontend after changing `.env`  
✔ Make sure MetaMask is on Sepolia  
✔ Ensure admin wallet matches deployed contract admin  

---

# 🎉 Done!

You now have a full Web3 voting system running locally.



