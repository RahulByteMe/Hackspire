import express from "express";
import {
  createElection,
  addCandidate,
  registerVoter,
  getElection
} from "../controllers/election.controller.js";
import { addCandidateValidator, createElectionValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = express.Router();

router.post("/create-election", createElectionValidator(),  validate, createElection);
router.post("/add-candidate", addCandidateValidator(),  validate, addCandidate);
router.post("/register-voter", registerVoter);
router.get("/get-election/:id", getElection);

export default router;
