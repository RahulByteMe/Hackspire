import { body } from "express-validator";

/* ================= OTP ================= */

export const sendOtpValidator = () => {
  return [
    body("aadhaar")
      .notEmpty().withMessage("Aadhaar is required")
      .isLength({ min: 12, max: 12 }).withMessage("Aadhaar must be 12 digits")
      .isNumeric().withMessage("Aadhaar must contain only numbers")
  ];
};

export const verifyOtpValidator = () => {
  return [
    body("aadhaar")
      .notEmpty().withMessage("Aadhaar is required")
      .isLength({ min: 12, max: 12 }).withMessage("Aadhaar must be 12 digits")
      .isNumeric().withMessage("Aadhaar must contain only numbers"),

    body("otp")
      .notEmpty().withMessage("OTP is required")
      .isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits")
      .isNumeric().withMessage("OTP must contain only numbers"),

    body("wallet")
      .notEmpty().withMessage("Wallet address is required")
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage("Invalid Ethereum wallet address"),

    body("electionId")
      .notEmpty().withMessage("Election ID is required")
      .isInt({ min: 0 }).withMessage("Election ID must be a positive integer")
  ];
};

/* ================= ELECTION ================= */

export const createElectionValidator = () => {
  return [
    body("title")
      .notEmpty().withMessage("Title is required")
      .isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),

    body("startTime")
      .notEmpty().withMessage("Start time is required")
      .isNumeric().withMessage("Start time must be a timestamp"),

    body("endTime")
      .notEmpty().withMessage("End time is required")
      .isNumeric().withMessage("End time must be a timestamp")
      .custom((value, { req }) => {
        if (Number(value) <= Number(req.body.startTime)) {
          throw new Error("End time must be greater than start time");
        }
        return true;
      })
  ];
};

export const addCandidateValidator = () => {
  return [
    body("electionId")
      .notEmpty().withMessage("Election ID is required")
      .isInt({ min: 0 }).withMessage("Election ID must be a positive number"),

    body("name")
      .notEmpty().withMessage("Candidate name is required")
      .isLength({ min: 2 }).withMessage("Candidate name must be at least 2 characters")
  ];
};

export const registerVoterValidator = () => {
  return [
    body("electionId")
      .notEmpty().withMessage("Election ID is required")
      .isInt({ min: 0 }).withMessage("Election ID must be valid"),

    body("walletAddress")
      .notEmpty().withMessage("Wallet address is required")
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage("Invalid Ethereum wallet address")
  ];
};

export const getElectionValidator = () => {
  return [
    body("id")
      .notEmpty().withMessage("Election ID is required")
      .isInt({ min: 0 }).withMessage("Invalid election ID")
  ];
};

export const voteValidator = () => {
  return [
    body("electionId")
      .notEmpty().withMessage("Election ID is required")
      .isNumeric().withMessage("Election ID must be numeric"),

    body("candidateId")
      .notEmpty().withMessage("Candidate ID is required")
      .isNumeric().withMessage("Candidate ID must be numeric")
  ];
};