const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SBT contract", function () {
    let sbt;
    let owner;
    let user;

    beforeEach(async function () {
        const SBT = await ethers.getContractFactory("SBT");
        [owner, user] = await ethers.getSigners();
        sbt = await SBT.deploy("https://ipfs.io/ipfs/");
    });

    it("should deploy with the correct base URI", async function () {
        const baseUri = await sbt.uri(1);
        expect(baseUri).to.equal("https://ipfs.io/ipfs/");
    });

    it("should mint a token and update balances", async function () {
        await sbt.claimAndMint(user.address, 1);
        const balance = await sbt.balanceOf(user.address, 1);
        expect(balance).to.equal(1);
    });

    it("should transfer a token and update balances", async function () {
        await sbt.claimAndMint(user.address, 1);

        const beforeBalanceUser = await sbt.balanceOf(user.address, 1);
        const beforeBalanceOwner = await sbt.balanceOf(owner.address, 1);

        await sbt.safeTransferFrom(user.address, owner.address, 1, 1, "0x");

        const afterBalanceUser = await sbt.balanceOf(user.address, 1);
        const afterBalanceOwner = await sbt.balanceOf(owner.address, 1);

        expect(beforeBalanceUser).to.equal(1);
        expect(beforeBalanceOwner).to.equal(0);
        expect(afterBalanceUser).to.equal(0);
        expect(afterBalanceOwner).to.equal(1);
    });
});

describe("SBT contract - claimAndMint function", function () {
    let sbt;
    let owner;
    let user;

    beforeEach(async function () {
        const SBT = await ethers.getContractFactory("SBT");
        [owner, user] = await ethers.getSigners();
        sbt = await SBT.deploy("https://ipfs.io/ipfs/");
    });

    it("should allow the owner to claim and mint a token", async function () {
        // Claim and mint a token for the user
        await sbt.connect(owner).claimAndMint(user.address, 1);

        // Check if the user now owns the claimed token
        const balance = await sbt.balanceOf(user.address, 1);
        expect(balance).to.equal(1);
    });

    it("should not allow a non-owner to claim and mint a token", async function () {
        // Attempt to claim and mint a token by a non-owner
        await expect(sbt.connect(user).claimAndMint(user.address, 1)).to.be.revertedWith(
            "EIP5516: Unauthorized"
        );

        // Check if the user does not own the claimed token
        const balance = await sbt.balanceOf(user.address, 1);
        expect(balance).to.equal(0);
    });

    it("should emit TokenMinted event upon successful claim and mint", async function () {
        // Claim and mint a token for the user
        const claimAndMintTx = await sbt.connect(owner).claimAndMint(user.address, 1);

        // Check if the TokenMinted event was emitted
        const tokenMintedEvent = await expect(claimAndMintTx).to.emit(sbt, "TokenMinted");

        // Check the emitted event parameters
        const { operator, account, ids } = tokenMintedEvent.args;
        expect(operator).to.equal(owner.address);
        expect(account).to.equal(user.address);
        expect(ids).to.eql([1]);
    });
});

describe("SBT contract - balanceOf function", function () {
    let sbt;
    let owner;
    let user;

    beforeEach(async function () {
        const SBT = await ethers.getContractFactory("SBT");
        [owner, user] = await ethers.getSigners();
        sbt = await SBT.deploy("https://ipfs.io/ipfs/");
    });

    it("should return 0 for an account that doesn't own the token", async function () {
        // Check balance for the user for a token they don't own
        const balance = await sbt.balanceOf(user.address, 1);
        expect(balance).to.equal(0);
    });

    it("should return 1 for an account that owns the token", async function () {
        // Mint a token for the user
        await sbt.connect(owner).claimAndMint(user.address, 1);

        // Check balance for the user for the minted token
        const balance = await sbt.balanceOf(user.address, 1);
        expect(balance).to.equal(1);
    });

    it("should revert for an account with address(0)", async function () {
        // Attempt to check balance for address(0)
        await expect(sbt.balanceOf(ethers.constants.AddressZero, 1)).to.be.revertedWith(
            "EIP5516: Address zero error"
        );
    });

    it("should revert for an invalid token ID", async function () {
        // Attempt to check balance for an invalid token ID
        await expect(sbt.balanceOf(user.address, 0)).to.be.revertedWith(
            "EIP5516: Address zero error"
        );
    });
});

describe("SBT contract - balanceOfBatch function", function () {
    let sbt;
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        const SBT = await ethers.getContractFactory("SBT");
        [owner, user1, user2] = await ethers.getSigners();
        sbt = await SBT.deploy("https://ipfs.io/ipfs/");
    });

    it("should return an array of balances for a batch of tokens", async function () {
        // Mint tokens for users
        await sbt.connect(owner).claimAndMint(user1.address, 1);
        await sbt.connect(owner).claimAndMint(user2.address, 2);

        // Check balances for a batch of tokens for multiple users
        const balances = await sbt.balanceOfBatch(
            [user1.address, user2.address],
            [1, 2]
        );

        // Check if the balances array is as expected
        expect(balances[0]).to.equal(1);
        expect(balances[1]).to.equal(1);
    });

    it("should revert for mismatched array lengths", async function () {
        // Attempt to check balances with mismatched array lengths
        await expect(
            sbt.balanceOfBatch([user1.address], [1, 2])
        ).to.be.revertedWith("EIP5516: Array lengths mismatch");
    });

    it("should revert for an account with address(0)", async function () {
        // Attempt to check balances for address(0)
        await expect(
            sbt.balanceOfBatch([user1.address, ethers.constants.AddressZero], [1, 2])
        ).to.be.revertedWith("EIP5516: Address zero error");
    });

    it("should revert for an invalid token ID", async function () {
        // Attempt to check balances for an invalid token ID
        await expect(
            sbt.balanceOfBatch([user1.address, user2.address], [1, 0])
        ).to.be.revertedWith("EIP5516: Array lengths mismatch");
    });
});

describe("SBT contract - tokensFrom function", function () {
    let sbt;
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        const SBT = await ethers.getContractFactory("SBT");
        [owner, user1, user2] = await ethers.getSigners();
        sbt = await SBT.deploy("https://ipfs.io/ipfs/");
    });

    it("should return an array of tokens owned by an address", async function () {
        // Mint tokens for users
        await sbt.connect(owner).claimAndMint(user1.address, 1);
        await sbt.connect(owner).claimAndMint(user1.address, 2);
        await sbt.connect(owner).claimAndMint(user2.address, 3);

        // Check tokens owned by user1
        const tokensUser1 = await sbt.tokensFrom(user1.address);
        expect(tokensUser1).to.have.members([1, 2]);

        // Check tokens owned by user2
        const tokensUser2 = await sbt.tokensFrom(user2.address);
        expect(tokensUser2).to.have.members([3]);
    });

    it("should revert for address(0)", async function () {
        // Attempt to check tokens owned by address(0)
        await expect(sbt.tokensFrom(ethers.constants.AddressZero)).to.be.revertedWith(
            "EIP5516: Address zero error"
        );
    });

    it("should return an empty array for an address with no tokens", async function () {
        // Check tokens owned by an address with no tokens
        const tokensEmpty = await sbt.tokensFrom(user1.address);
        expect(tokensEmpty).to.be.empty;
    });

    it("should handle multiple users and token types", async function () {
        // Mint tokens for users
        await sbt.connect(owner).claimAndMint(user1.address, 1);
        await sbt.connect(owner).claimAndMint(user1.address, 2);
        await sbt.connect(owner).claimAndMint(user2.address, 3);

        // Check tokens owned by user1 and user2
        const tokensUser1 = await sbt.tokensFrom(user1.address);
        const tokensUser2 = await sbt.tokensFrom(user2.address);

        expect(tokensUser1).to.have.members([1, 2]);
        expect(tokensUser2).to.have.members([3]);
    });
});

describe("SBT contract - setApprovalForAll function", function () {
    let sbt;
    let owner;
    let operator;
    let user;

    beforeEach(async function () {
        const SBT = await ethers.getContractFactory("SBT");
        [owner, operator, user] = await ethers.getSigners();
        sbt = await SBT.deploy("https://ipfs.io/ipfs/");
    });

    it("should set operator approval to true", async function () {
        // Set operator approval to true
        await sbt.connect(owner).setApprovalForAll(operator.address, true);

        // Check operator approval status
        const isApproved = await sbt.isApprovedForAll(owner.address, operator.address);
        expect(isApproved).to.be.true;
    });

    it("should set operator approval to false", async function () {
        // Set operator approval to true
        await sbt.connect(owner).setApprovalForAll(operator.address, true);

        // Set operator approval to false
        await sbt.connect(owner).setApprovalForAll(operator.address, false);

        // Check operator approval status
        const isApproved = await sbt.isApprovedForAll(owner.address, operator.address);
        expect(isApproved).to.be.false;
    });

    it("should revert if setting approval for self", async function () {
        // Attempt to set approval for self
        await expect(
            sbt.connect(owner).setApprovalForAll(owner.address, true)
        ).to.be.revertedWith("ERC1155: setting approval status for self");
    });

    it("should emit ApprovalForAll event", async function () {
        // Set operator approval to true and expect ApprovalForAll event
        await expect(sbt.connect(owner).setApprovalForAll(operator.address, true))
            .to.emit(sbt, "ApprovalForAll")
            .withArgs(owner.address, operator.address, true);
    });

    it("should allow approved operator to transfer tokens", async function () {
        // Mint tokens for owner
        await sbt.connect(owner).claimAndMint(owner.address, 1);

        // Set operator approval to true
        await sbt.connect(owner).setApprovalForAll(operator.address, true);

        // Operator transfers token from owner to user
        await expect(
            sbt.connect(operator).safeTransferFrom(owner.address, user.address, 1, 1, "0x")
        ).to.not.be.reverted;
    });

    it("should revert if unapproved operator attempts to transfer tokens", async function () {
        // Mint tokens for owner
        await sbt.connect(owner).claimAndMint(owner.address, 1);

        // Operator attempts to transfer token without approval
        await expect(
            sbt.connect(operator).safeTransferFrom(owner.address, user.address, 1, 1, "0x")
        ).to.be.revertedWith("EIP5516: Unauthorized");
    });
});

describe("SBT contract - isApprovedForAll function", function () {
    let sbt;
    let owner;
    let operator;
    let user;

    beforeEach(async function () {
        const SBT = await ethers.getContractFactory("SBT");
        [owner, operator, user] = await ethers.getSigners();
        sbt = await SBT.deploy("https://ipfs.io/ipfs/");
    });

    it("should return false if operator is not approved", async function () {
        // Check operator approval status before approval
        const isApprovedBefore = await sbt.isApprovedForAll(owner.address, operator.address);
        expect(isApprovedBefore).to.be.false;
    });

    it("should return true after operator approval", async function () {
        // Set operator approval to true
        await sbt.connect(owner).setApprovalForAll(operator.address, true);

        // Check operator approval status after approval
        const isApprovedAfter = await sbt.isApprovedForAll(owner.address, operator.address);
        expect(isApprovedAfter).to.be.true;
    });

    it("should return false after revoking operator approval", async function () {
        // Set operator approval to true
        await sbt.connect(owner).setApprovalForAll(operator.address, true);

        // Revoke operator approval
        await sbt.connect(owner).setApprovalForAll(operator.address, false);

        // Check operator approval status after revocation
        const isApprovedAfterRevocation = await sbt.isApprovedForAll(owner.address, operator.address);
        expect(isApprovedAfterRevocation).to.be.false;
    });

    it("should return false for unapproved operator", async function () {
        // Mint tokens for owner
        await sbt.connect(owner).claimAndMint(owner.address, 1);

        // Check operator approval status for unapproved operator
        const isApproved = await sbt.isApprovedForAll(owner.address, operator.address);
        expect(isApproved).to.be.false;
    });

    it("should return true for approved operator", async function () {
        // Mint tokens for owner
        await sbt.connect(owner).claimAndMint(owner.address, 1);

        // Set operator approval to true
        await sbt.connect(owner).setApprovalForAll(operator.address, true);

        // Check operator approval status for approved operator
        const isApproved = await sbt.isApprovedForAll(owner.address, operator.address);
        expect(isApproved).to.be.true;
    });
});


describe("SBT contract - reward function", function () {
    let sbt;
    let owner;
    let operator;
    let user;

    beforeEach(async function () {
        const SBT = await ethers.getContractFactory("SBT");
        [owner, operator, user] = await ethers.getSigners();
        sbt = await SBT.deploy("https://ipfs.io/ipfs/");
    });

    it("should increase the token count and emit TransferSingle event", async function () {
        const tokenId = 1;
        const data = "Token Data";

        // Reward tokens to the owner
        await expect(sbt.connect(owner).reward(operator.address, data))
            .to.emit(sbt, "TransferSingle")
            .withArgs(operator.address, ethers.constants.AddressZero, operator.address, tokenId, 1);

        // Check the balance of the operator after rewarding
        const balance = await sbt.balanceOf(operator.address, tokenId);
        expect(balance).to.equal(1);
    });

    it("should set the correct token URI", async function () {
        const tokenId = 1;
        const data = "Token Data";

        // Reward tokens to the owner
        await sbt.connect(owner).reward(operator.address, data);

        // Check the URI of the token
        const uri = await sbt.uri(tokenId);
        const expectedUri = "https://ipfs.io/ipfs/" + data;
        expect(uri).to.equal(expectedUri);
    });

    it("should increment the nonce for each reward", async function () {
        const tokenId1 = 1;
        const tokenId2 = 2;
        const data1 = "Token Data 1";
        const data2 = "Token Data 2";

        // Reward tokens to the owner twice
        await sbt.connect(owner).reward(operator.address, data1);
        await sbt.connect(owner).reward(operator.address, data2);

        // Check the balance and URI of the tokens
        const balance1 = await sbt.balanceOf(operator.address, tokenId1);
        const uri1 = await sbt.uri(tokenId1);

        const balance2 = await sbt.balanceOf(operator.address, tokenId2);
        const uri2 = await sbt.uri(tokenId2);

        // Check the balance and URI after rewarding
        expect(balance1).to.equal(1);
        expect(uri1).to.equal("https://ipfs.io/ipfs/" + data1);

        expect(balance2).to.equal(1);
        expect(uri2).to.equal("https://ipfs.io/ipfs/" + data2);
    });
});


describe("SBT contract - safeTransferFrom function", function () {
    let sbt;
    let owner;
    let operator;
    let user;

    beforeEach(async function () {
        const SBT = await ethers.getContractFactory("SBT");
        [owner, operator, user] = await ethers.getSigners();
        sbt = await SBT.deploy("https://ipfs.io/ipfs/");
    });

    it("should transfer a token from owner to user", async function () {
        const tokenId = 1;
        const data = "Token Data";

        // Reward tokens to the owner
        await sbt.connect(owner).reward(operator.address, data);

        // Check the balance of the operator before transfer
        let balance = await sbt.balanceOf(operator.address, tokenId);
        expect(balance).to.equal(1);

        // Operator transfers the token to the user
        await expect(sbt.connect(operator).safeTransferFrom(operator.address, user.address, tokenId, 1, ""))
            .to.emit(sbt, "TransferSingle")
            .withArgs(operator.address, operator.address, user.address, tokenId, 1);

        // Check the balance of the operator and user after transfer
        balance = await sbt.balanceOf(operator.address, tokenId);
        expect(balance).to.equal(0);

        const userBalance = await sbt.balanceOf(user.address, tokenId);
        expect(userBalance).to.equal(1);
    });

    it("should revert when transferring a non-existent token", async function () {
        const tokenId = 1;

        // Attempt to transfer a non-existent token from operator to user
        await expect(sbt.connect(operator).safeTransferFrom(operator.address, user.address, tokenId, 1, ""))
            .to.be.revertedWith("EIP5516: Unauthorized");
    });

    it("should revert when transferring more than one token", async function () {
        const tokenId = 1;
        const data = "Token Data";

        // Reward tokens to the owner
        await sbt.connect(owner).reward(operator.address, data);

        // Attempt to transfer more than one token from operator to user
        await expect(sbt.connect(operator).safeTransferFrom(operator.address, user.address, tokenId, 2, ""))
            .to.be.revertedWith("EIP5516: Can only transfer one token");
    });

    it("should revert when unauthorized user attempts transfer", async function () {
        const tokenId = 1;
        const data = "Token Data";

        // Reward tokens to the owner
        await sbt.connect(owner).reward(operator.address, data);

        // Attempt to transfer from user to another address (unauthorized)
        await expect(sbt.connect(user).safeTransferFrom(user.address, operator.address, tokenId, 1, ""))
            .to.be.revertedWith("EIP5516: Unauthorized");
    });
});

describe("SBT contract - batchTransfer function", function () {
    let sbt;
    let owner;
    let operator;
    let user1;
    let user2;

    beforeEach(async function () {
        const SBT = await ethers.getContractFactory("SBT");
        [owner, operator, user1, user2] = await ethers.getSigners();
        sbt = await SBT.deploy("https://ipfs.io/ipfs/");
    });

    it("should batch transfer a token from owner to multiple users", async function () {
        const tokenId = 1;
        const data = "Token Data";

        // Reward tokens to the owner
        await sbt.connect(owner).reward(operator.address, data);

        // Check the balance of the operator before transfer
        let balance = await sbt.balanceOf(operator.address, tokenId);
        expect(balance).to.equal(1);

        // Operator batch transfers the token to multiple users
        await expect(sbt.connect(operator).batchTransfer(operator.address, [user1.address, user2.address], tokenId, 1, ""))
            .to.emit(sbt, "TransferMulti")
            .withArgs(operator.address, operator.address, [user1.address, user2.address], 1, tokenId);

        // Check the balance of the operator and users after batch transfer
        balance = await sbt.balanceOf(operator.address, tokenId);
        expect(balance).to.equal(0);

        const user1Balance = await sbt.balanceOf(user1.address, tokenId);
        expect(user1Balance).to.equal(1);

        const user2Balance = await sbt.balanceOf(user2.address, tokenId);
        expect(user2Balance).to.equal(1);
    });

    it("should revert when batch transferring a non-existent token", async function () {
        const tokenId = 1;

        // Attempt to batch transfer a non-existent token from operator to multiple users
        await expect(sbt.connect(operator).batchTransfer(operator.address, [user1.address, user2.address], tokenId, 1, ""))
            .to.be.revertedWith("EIP5516: Unauthorized");
    });

    it("should revert when batch transferring more than one token", async function () {
        const tokenId = 1;
        const data = "Token Data";

        // Reward tokens to the owner
        await sbt.connect(owner).reward(operator.address, data);

        // Attempt to batch transfer more than one token from operator to multiple users
        await expect(sbt.connect(operator).batchTransfer(operator.address, [user1.address, user2.address], tokenId, 2, ""))
            .to.be.revertedWith("EIP5516: Can only transfer one token");
    });

    it("should revert when unauthorized user attempts batch transfer", async function () {
        const tokenId = 1;
        const data = "Token Data";

        // Reward tokens to the owner
        await sbt.connect(owner).reward(operator.address, data);

        // Attempt to batch transfer from user to multiple addresses (unauthorized)
        await expect(sbt.connect(user1).batchTransfer(user1.address, [user2.address, operator.address], tokenId, 1, ""))
            .to.be.revertedWith("EIP5516: Unauthorized");
    });
});