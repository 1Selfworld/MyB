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
  const from = '0xF4f7A3Ca99Fa72d2Ae2cFff5a87464bEc5de0936';
  const to = '0x20D58Da9AC7DD728329B497DA58927725090027b';
  const contractName = "SBT";
  const data = ethers.utils.arrayify('0x');
  const SBT = await hre.ethers.getContractFactory(contractName);
  const sbt = await SBT.attach(address);
  const result = await sbt.safeTransferFrom(from, to, 1, 1, data)


  console.log(result)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
