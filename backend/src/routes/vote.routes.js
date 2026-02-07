import express from "express";
import { castVote } from "../controllers/vote.controller.js";
import { voteValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = express.Router();

router.post("/cast-vote",voteValidator(),validate,castVote);

export default router;
