import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import twilio from "twilio";

import { Otp } from "../models/otp.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User} from "../models/user.model.js";
import { hashAadhaar } from "../utils/hash.js";
import contract from "../blockchain/contract.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockDataPath = path.join(__dirname, "../data/MockAdhaar.json");

function getMockAadhaarData() {
  const raw = fs.readFileSync(mockDataPath, "utf-8");
  return JSON.parse(raw);
}

export const sendOtp = asyncHandler(async (req, res) => {
  const { aadhaar } = req.body;
  const aadhaarHash = hashAadhaar(aadhaar)

  if (!aadhaar) {
    return res.status(400).json({ message: "Aadhaar is required" });
  }

  const mockData = getMockAadhaarData();
  const person = mockData.find(p => p.aadhaar === aadhaar);

  if (!person) {
    return res.status(404).json({ message: "Aadhaar not found in records" });
  }

  const phone = person.phone; // must be +91XXXXXXXXXX

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.create({
    aadhaarHash,
    phone,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  const client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH
  );

  await client.messages.create({
    body: `Your Aadhaar Verification OTP is ${otp}`,
    from: process.env.TWILIO_PHONE,
    to: phone
  });

  console.log(`OTP sent to ${phone}: ${otp}`);

  res.json({
    success: true,
    message: "OTP sent to registered mobile number"
  });
});



export const verifyOtp = asyncHandler(async (req, res) => {

  const { aadhaar, otp, wallet, electionId } = req.body;

  if (!aadhaar || !otp || !wallet || electionId === undefined) {
    return res.status(400).json({
      message: "Aadhaar, OTP, wallet and electionId are required"
    });
  }

  const aadhaarHash = hashAadhaar(aadhaar);
  const normalizedWallet = wallet.toLowerCase();

  const otpRecord = await Otp.findOne({ aadhaarHash });

  if (!otpRecord || otpRecord.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (otpRecord.expiresAt < new Date()) {
    await Otp.deleteMany({ aadhaarHash });
    return res.status(400).json({
      message: "OTP expired. Please request again."
    });
  }

  const aadhaarExists = await User.findOne({ aadhaarHash });
  if (aadhaarExists) {
    return res.status(400).json({
      message: "This Aadhaar is already registered"
    });
  }

  const walletExists = await User.findOne({ wallet: normalizedWallet });
  if (walletExists) {
    return res.status(400).json({
      message: "This wallet is already registered"
    });
  }

  const user = await User.create({
    aadhaarHash,
    wallet: normalizedWallet,
    verified: true
  });

  const tx = await contract.registerVoter(electionId, normalizedWallet);
  await tx.wait();

  await Otp.deleteMany({ aadhaarHash });

  return res.status(200).json({
    success: true,
    message: "Identity verified & voter registered on blockchain",
    txHash: tx.hash,
    user: {
      wallet: user.wallet,
      verified: user.verified
    }
  });
});

