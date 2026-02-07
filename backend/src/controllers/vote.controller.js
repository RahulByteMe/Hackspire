import contract from "../blockchain/contract.js";
import { asyncHandler } from "../utils/async-handler.js";

export const castVote = asyncHandler(async (req, res) => {

  const { electionId, candidateId, wallet } = req.body;

  if (electionId === undefined || candidateId === undefined || !wallet) {
    return res.status(400).json({
      message: "electionId, candidateId and wallet required"
    });
  }

  // Create signer from wallet private key
  const tx = await contract.vote(electionId, candidateId, {
    from: wallet
  });

  await tx.wait();

  res.status(200).json({
    success: true,
    message: "Vote cast successfully",
    txHash: tx.hash
  });
});
