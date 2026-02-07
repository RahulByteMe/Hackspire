import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import { sendOtpValidator, verifyOtpValidator } from "../validators/index.js";
const router = Router()

router.route("/send-otp").post(sendOtpValidator(), validate, sendOtp )
router.route("/verify-otp").post(verifyOtpValidator(), validate, verifyOtp)
export default router

