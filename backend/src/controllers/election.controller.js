import contract from "../blockchain/contract.js";

export const createElection = async (req, res) => {
  try {
    const { title, startTime, endTime } = req.body;

    const tx = await contract.createElection(
      title,
      startTime,
      endTime
    );

    await tx.wait();

    res.json({
      success: true,
      message: "Election created",
      txHash: tx.hash
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const addCandidate = async (req, res) => {
  try {
    const { electionId, name } = req.body;

    const tx = await contract.addCandidate(
      electionId,
      name
    );

    await tx.wait();

    res.json({
      success: true,
      message: "Candidate added",
      txHash: tx.hash
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const registerVoter = async (req, res) => {
  try {
    const { electionId, walletAddress } = req.body;

    const tx = await contract.registerVoter(
      electionId,
      walletAddress
    );

    await tx.wait();

    res.json({
      success: true,
      message: "Voter registered on blockchain",
      txHash: tx.hash
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getElection = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await contract.getElection(id);

    res.json({
      title: data[0],
      startTime: data[1].toString(),
      endTime: data[2].toString(),
      candidateCount: data[3].toString()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

