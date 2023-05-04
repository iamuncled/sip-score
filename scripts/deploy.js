async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const SipScore = await ethers.getContractFactory("SipScore");
  const sipScore = await SipScore.deploy();
  await sipScore.deployed();

  console.log("SipScore contract deployed to:", sipScore.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
