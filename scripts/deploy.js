// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
async function main() {


  const contractName = "SBT";
  const SBT = await hre.ethers.getContractFactory(contractName);
  const sbt = await SBT.deploy("https://ipfs.io/ipfs/token.data");

  await sbt.deployed();
  console.log(
    `${contractName} deployed ,contract address: ${sbt.address}`
  );


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
