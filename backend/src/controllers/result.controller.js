import contract from "../blockchain/contract.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getResults = asyncHandler(async (req, res) => {

  const { electionId } = req.params;

  const count = await contract.getCandidateCount(electionId);

  const results = [];

  for (let i = 0; i < count; i++) {
    const [name, voteCount] = await contract.getCandidate(electionId, i);

    results.push({
      id: i,
      name,
      voteCount: voteCount.toString()
    });
  }

  res.json({
    success: true,
    electionId,
    results
  });
});
