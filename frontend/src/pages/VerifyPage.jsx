import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input, Label } from "../components/Input";
import { useWallet } from "../state/wallet";
import { isVerified, setVerified } from "../lib/storage";
import { useToast } from "../state/toast";

function normalizeAadhaar(s) {
  return s.replace(/\s+/g, "").slice(0, 12);
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function VerifyPage() {
  const wallet = useWallet();
  const toast = useToast();

  const [aadhaar, setAadhaar] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [otp, setOtp] = useState("");
  const verified = isVerified(wallet.address);

  const canSend = useMemo(() => {
    const a = normalizeAadhaar(aadhaar);
    return wallet.status === "connected" && wallet.isSepolia && a.length === 12;
  }, [aadhaar, wallet.isSepolia, wallet.status]);

  const canVerify = useMemo(() => {
    return canSend && otpSent && otp.trim().length === 6;
  }, [canSend, otp, otpSent]);

const onSendOtp = async () => {
  try {
    const res = await api.post("/otp/send-otp", {
      aadhaar: normalizeAadhaar(aadhaar)
    });

    setOtpSent(true);

    toast.push({
      kind: "success",
      title: "OTP sent",
      message: res.data.message
    });

  } catch (err) {
    toast.push({
      kind: "error",
      title: "Failed",
      message: err.response?.data?.message || "Error sending OTP"
    });
  }
};


const onVerify = async () => {
  if (!wallet.address) return;

  try {
    const res = await api.post("/otp/verify-otp", {
      aadhaar: normalizeAadhaar(aadhaar),
      otp,
      wallet: wallet.address
    });

    setVerified(wallet.address, true);

    toast.push({
      kind: "success",
      title: "Verified",
      message: res.data.message
    });

  } catch (err) {
    toast.push({
      kind: "error",
      title: "Verification failed",
      message: err.response?.data?.message || "Error"
    });
  }
};


  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <Card>
        <h1 className="text-2xl font-extrabold tracking-tight">Identity Verification</h1>
        <p className="mt-2 text-sm text-slate-300">
          This is a hackathon demo. Aadhaar and OTP are simulated and never stored on-chain.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <Label>Aadhaar number (mock)</Label>
            <Input
              value={aadhaar}
              onChange={(e) => setAadhaar(normalizeAadhaar(e.target.value))}
              inputMode="numeric"
              placeholder="12 digits"
              disabled={verified}
            />
            <div className="mt-1 text-xs text-slate-400">Tip: any 12 digits work for demo.</div>
          </div>

          <div className="flex flex-wrap gap-3">
            {wallet.status !== "connected" ? (
              <Button onClick={() => void wallet.connect()} disabled={!wallet.isMetaMaskInstalled}>
                Connect wallet
              </Button>
            ) : !wallet.isSepolia ? (
              <Button onClick={() => void wallet.requestSepolia()} variant="secondary">
                Switch to Sepolia
              </Button>
            ) : (
              <Button onClick={onSendOtp} disabled={!canSend || verified} variant="secondary">
                Send OTP
              </Button>
            )}

            {verified ? (
              <Link to="/elections">
                <Button>Go to Elections</Button>
              </Link>
            ) : null}
          </div>

          <div>
            <Label>OTP</Label>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D+/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="6 digits"
              disabled={!otpSent || verified}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              Privacy: Aadhaar is not stored. Only verification status is stored locally per wallet.
            </div>
            <Button onClick={onVerify} disabled={!canVerify || verified}>
              {verified ? "Verified" : "Submit verification"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="text-sm text-slate-300">
        <div className="font-semibold text-slate-200">Why verify?</div>
        <div className="mt-1">
          Verification helps prevent duplicate voting. In production, this would be handled off-chain and only a
          verification proof/flag would be used to gate voting.
        </div>
      </Card>
    </div>
  );
}
