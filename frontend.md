# Frontend Product Requirements Document (PRD)
## Hybrid Blockchain-Based Voting System

---

## 1. Purpose

The frontend application provides a user-friendly interface that allows users to:

- Connect their blockchain wallet
- Verify identity using Aadhaar-based verification (simulated)
- View available elections
- Cast votes securely on the blockchain
- View real-time election results

The goal is to make blockchain-based voting accessible to non-technical users while ensuring transparency and security.

---

## 2. Target Users

### Primary Users
- Students participating in institutional elections
- Members of organizations or clubs

### Secondary Users
- Election administrators (admin panel)

---

## 3. Functional Requirements

### 3.1 Wallet Integration

- Detect MetaMask installation
- Show prompt to install MetaMask if not found
- Allow users to connect wallet
- Display connected wallet address
- Detect network and prompt to switch to Sepolia testnet

---

### 3.2 Home Page

- Display project overview
- Show wallet connection status
- Show next action:
  - Verify identity if not verified
  - Go to elections if verified

---

### 3.3 Identity Verification Page

- Input fields:
  - Aadhaar number (mock)
  - OTP input
- Button to send OTP (simulated)
- Button to submit verification
- Display verification status
- Show privacy notice:
  - Aadhaar is not stored on blockchain

---

### 3.4 Elections Dashboard

- Display list of elections:
  - Election name
  - Status (Active / Closed)
  - Time remaining (if active)
- Action buttons:
  - View & Vote for active elections
  - View Results for closed elections

---

### 3.5 Voting Page

- Display candidate cards:
  - Name
  - Party or description
- Vote button for each candidate
- Disable voting if:
  - User not verified
  - Voting already completed
  - Election closed
- Show MetaMask transaction confirmation
- Show transaction success or failure feedback

---

### 3.6 Results Page

- Display:
  - Candidate-wise vote counts
  - Percentage share
  - Winner highlight
- Display total votes
- Refresh or auto-update results

---

### 3.7 Admin Interface (Optional)

- Add candidates
- Start or end elections
- Register or revoke voters (if required)

---

## 4. Non-Functional Requirements

### 4.1 Usability

- Clean and simple UI
- Clear navigation and instructions
- Minimal technical terminology

### 4.2 Performance

- Page loads within 2 seconds
- Blockchain calls optimized and minimized

### 4.3 Security

- No storage of Aadhaar or personal data on frontend
- No access to private keys
- All blockchain transactions signed via MetaMask only

### 4.4 Compatibility

- Supported browsers:
  - Chrome
  - Edge
  - Brave
- Desktop-first design
- Mobile responsive if time permits

---

## 5. Technology Stack

| Component | Technology |
|--------|------------|
| Framework | React |
| Styling | Tailwind CSS |
| Blockchain Library | ethers.js |
| Wallet Integration | MetaMask |
| API Calls | Axios |
| Hosting | Vercel / Netlify |

---

## 6. User Flow

1. User opens website  
2. Connects MetaMask wallet  
3. Verifies identity (Aadhaar mock)  
4. Selects election  
5. Casts vote (blockchain transaction)  
6. Views real-time results  

---

## 7. Error Handling & Edge Cases

- MetaMask not installed
- Wrong blockchain network selected
- Backend verification failure
- Blockchain transaction rejected
- Network latency or timeout

Each case must show:
- Clear error message
- Retry or corrective guidance

---

## 8. Success Metrics

- Successful wallet connection rate
- Successful verification completion
- Successful vote transaction
- Correct result display

---

## 9. Future Enhancements

- Mobile-first UI design
- QR-based voter login
- Support for multiple elections
- Integration with official identity APIs
- Accessibility improvements

---

## 10. Compliance and Privacy

- Aadhaar data never stored on blockchain
- Aadhaar verification handled off-chain
- Only wallet addresses stored in smart contracts
- System follows privacy-by-design principles

---

**Document Version:** 1.0  
**Prepared For:** Hackathon Submission  
**Project:** Hybrid Blockchain Voting System
