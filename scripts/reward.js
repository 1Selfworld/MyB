// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const web3 = require("web3");
async function main() {

  const address = '0x5d9E1260570D1C943E6386A64064045B502e7e48';
  const contractName = "SBT";
  const data = "Token Data";
  const SBT = await hre.ethers.getContractFactory(contractName);
  const sbt = await SBT.attach(address);
  const result = await sbt.reward(address, data)
  console.log(result.hash)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
