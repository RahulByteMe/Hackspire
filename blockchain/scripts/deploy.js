async function main() {
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.deployed();

  console.log("Voting deployed to:", voting.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
