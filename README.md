# Soulbound Token

## Soulbound Token

Implementation of the Soulbound Token.

## Problem Trying to Solve

This EIP was inspired by the main characteristics of the [EIP-1155](./eip-1155.md) token and by articles in which benefits and potential use cases of Soulbound/Accountbound Tokens (SBTs) were presented.
This design also allows for batch token transfers, saving on transaction costs. Trading of multiple tokens can be built on top of this standard and it removes the need to approve individual token contracts separately. It is also easy to describe and mix multiple fungible or non-fungible token types in a single contract.

## How to Use

```
contracts/
          activity/
          core/
          interfaces/
```

## Contracts

- **SBT.sol**: Reference implementation of the eip-5516 interface.
- **IERC5516.sol.sol**: ERC5516 Token Interface.

## Prepare Development Environment (Choose Hardhat as the Tool)

- To install Hardhat:

```sh
npm install --save-dev hardhat
```

## Clone the Repository

```sh
git clone ghttps://github.com/1Selfworld/MyB
cd sbt
```

## Compile the Contracts

- Install the project dependencies:

```sh
npm install
```

- Compile contracts:

```sh
npx hardhat compile
```

- Test contracts:

```sh
npx hardhat test
```

## Deploy

### 1. Deploy to Local

```sh
npm run deploy
```

### 2. Deploy to Testnet (Using Wemix Testnet as an Example)

- Fill in the parameters in `hardhat.config.js`:

```js
// Replace "INFURA PROJECT ID" with your INFURA project id
// Go to https://infura.io/, sign up, create a new App in its dashboard, and replace "KEY" with its key
const INFURA_PROJECT_ID = "INFURA INFURA PROJECT ID";

// Replace "PRIVATE KEY" with your account private key
// To export your private key from Metamask, open Metamask and go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const PRIVATE_KEY = "PRIVATE KEY";
```

- Deploy and verify:

```sh
npx hardhat run scripts/deploy.js --network wemix_testnet

npx hardhat verify --network wemix_testnet <DEPLOYED_CONTRACT_ADDRESS> https://ipfs.io/ipfs/token.data

```

Adjust the parameters and paths based on your specific setup and deployment requirements.
