import mongoose, {Schema} from "mongoose";


const otpSchema = new Schema({
    aadhaarHash: String,
    phone: String,
    otp: String,
    expiresAt: Date
});

export const Otp = mongoose.model("Otp", otpSchema)
