// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {

    /* -------------------- ADMIN -------------------- */

    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender; // Deployer is admin
    }

    /* -------------------- STRUCTS -------------------- */

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string title;
        uint256 startTime;
        uint256 endTime;
        bool exists;
        uint256 candidateCount;
    }

    /* -------------------- STORAGE -------------------- */

    uint256 public electionCount;

    // electionId => Election
    mapping(uint256 => Election) public elections;

    // electionId => candidateId => Candidate
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;

    // electionId => voter address => isRegistered
    mapping(uint256 => mapping(address => bool)) public registeredVoters;

    // electionId => voter address => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    /* -------------------- MODIFIERS -------------------- */

    modifier electionExists(uint256 _electionId) {
        require(elections[_electionId].exists, "Election does not exist");
        _;
    }

    modifier electionNotStarted(uint256 _electionId) {
        require(block.timestamp < elections[_electionId].startTime, "Election already started");
        _;
    }

    modifier electionOngoing(uint256 _electionId) {
        require(
            block.timestamp >= elections[_electionId].startTime &&
            block.timestamp <= elections[_electionId].endTime,
            "Election is not active"
        );
        _;
    }

    /* -------------------- ADMIN FUNCTIONS -------------------- */

    // 1️⃣ Create a new election
    function createElection(
        string memory _title,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyAdmin {

        require(_startTime < _endTime, "Invalid time range");

        elections[electionCount] = Election({
            id: electionCount,
            title: _title,
            startTime: _startTime,
            endTime: _endTime,
            exists: true,
            candidateCount: 0
        });

        electionCount++;
    }

    // 2️⃣ Add candidate (only before election starts)
    function addCandidate(
        uint256 _electionId,
        string memory _name
    )
        external
        onlyAdmin
        electionExists(_electionId)
        electionNotStarted(_electionId)
    {
        uint256 cid = elections[_electionId].candidateCount;

        candidates[_electionId][cid] = Candidate({
            id: cid,
            name: _name,
            voteCount: 0
        });

        elections[_electionId].candidateCount++;
    }

    // 3️⃣ Register voter (called by backend/admin after OTP verification)
    function registerVoter(
        uint256 _electionId,
        address _voter
    )
        external
        onlyAdmin
        electionExists(_electionId)
        electionNotStarted(_electionId)
    {
        registeredVoters[_electionId][_voter] = true;
    }

    /* -------------------- VOTER FUNCTION -------------------- */

    // 4️⃣ Vote
    function vote(
        uint256 _electionId,
        uint256 _candidateId
    )
        external
        electionExists(_electionId)
        electionOngoing(_electionId)
    {
        require(registeredVoters[_electionId][msg.sender], "Voter not registered");
        require(!hasVoted[_electionId][msg.sender], "Already voted");
        require(_candidateId < elections[_electionId].candidateCount, "Invalid candidate");

        candidates[_electionId][_candidateId].voteCount++;
        hasVoted[_electionId][msg.sender] = true;
    }

    /* -------------------- VIEW FUNCTIONS -------------------- */

    // 5️⃣ Get candidate details
    function getCandidate(
        uint256 _electionId,
        uint256 _candidateId
    )
        external
        view
        returns (string memory name, uint256 voteCount)
    {
        Candidate memory c = candidates[_electionId][_candidateId];
        return (c.name, c.voteCount);
    }

    // 6️⃣ Get total candidates in election
    function getCandidateCount(uint256 _electionId)
        external
        view
        returns (uint256)
    {
        return elections[_electionId].candidateCount;
    }

    // 7️⃣ Get election info
    function getElection(uint256 _electionId)
        external
        view
        returns (
            string memory title,
            uint256 startTime,
            uint256 endTime,
            uint256 candidateCount
        )
    {
        Election memory e = elections[_electionId];
        return (e.title, e.startTime, e.endTime, e.candidateCount);
    }
}
