const { ethers, deployments, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { time,mine } = require("@nomicfoundation/hardhat-network-helpers")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
? describe.skip 
: describe("test fundme contract", async function(){

    let fundMe
    let fundMeSecondAccount
    let firstAccount
    let secondAccount
    let mockV3Aggregator
    this.beforeEach(async function(){
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        secondAccount = (await getNamedAccounts()).secondAccount
        const fundMeDeployment = await deployments.get("FundMe")
        mockV3Aggregator = await deployments.get("MockV3Aggregator")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
        fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount)
    })

    it("test if the owner is msg.sender", async function(){
        // const fundMeFactory = await ethers.getContractFactory("FundMe")
        // const fundMe = await fundMeFactory.deploy(180)
        // const [firstAccount] = await ethers.getSigners()
        await fundMe.waitForDeployment()
        assert.equal((await fundMe.owner()),firstAccount)
    })
    it("test if the dataFeed is setup correctly", async function(){
        // const fundMeFactory = await ethers.getContractFactory("FundMe")
        // const fundMe = await fundMeFactory.deploy(180)
        await fundMe.waitForDeployment()
        // assert.equal((await fundMe.dataFeed()),0x694AA1769357215DE4FAC081bf1f309aDC325306)
        assert.equal((await fundMe.dataFeed()),mockV3Aggregator.address)
    })

    //unit test for fund
    //window open, value greater than minimum value, funder balance
    it("window closed, value greater than minimum, fun failed",
        async function(){
            await time.increase(200)
            await mine()
            // value is greater than minimum value
            await expect(fundMe.fund({value: ethers.parseEther("0.002")}))
            .to.be.revertedWith("time is end,can't fund any more")
        }
    )
    it("window open, value is greater than minimum, fun success",
        async function(){
            await fundMe.fund({value: ethers.parseEther("0.002")})
            const balance = await fundMe.fundersToAmount(firstAccount)
            expect(balance).equals(ethers.parseEther("0.002"))
        }
    )

    //test getFund
    //onlyOwner,window close, target reached, fund failed
    it("not owner, window closed, target reached",
        async function(){
            await fundMe.fund({value: ethers.parseEther("0.002")})
            await time.increase(200)
            await mine()
            expect(fundMeSecondAccount.getFund())
            .to.be.revertedWith("this function can only be called by owner")
        }
    )

    //window open, target reached
    it("owner, window open, target reached",
        async function(){
            await fundMe.fund({value: ethers.parseEther("0.002")})
            await time.increase(10)
            await mine()
            await expect(fundMe.getFund())
            .to.be.revertedWith("window is not closed")
        }
    )

    //window closed, target is not reached
    it("owner, window closed, target is not reached",
        async function(){
            await fundMe.fund({value: ethers.parseEther("0.002")})
            await time.increase(200)
            await mine()
            await expect(fundMe.getFund())
            .to.be.revertedWith("Target is not reached")
        }
    )

    //window closed, target is reached, getFund success
    // it("owner, window closed, target reached, getFund success",
    //     async function(){
    //         await fundMe.fund({value: ethers.parseEther("0.008")})
    //         await time.increase(200)
    //         await mine()
    //         // await fundMe.getFund()
    //         // expect(await fundMe.getFundSuccess())
    //         // .equals(true)
    //         await expect(fundMe.getFund()).to.be.emit(fundMe,"FundWithdrawByOwner").withArgs(ethers.parseEther("0.008"))
    //     }
    // )

    //reFund
    //window closed, target is not reached, funder has balance
    it("window open, target is not reached, funder has balance",
        async function(){
            await fundMe.fund({value: ethers.parseEther("0.002")})
            await expect(fundMe.refund()).to.be.revertedWith("window is not closed")
        }
    )
    it("window closed, target is reached, funder has balance",
        async function(){
            await fundMe.fund({value: ethers.parseEther("0.008")})
            await time.increase(200)
            await mine()
            await expect(fundMe.refund()).to.be.revertedWith("Target is reached")
        }
    )
    it("window closed, target is not reached, funder has no balance",
        async function(){
            await fundMe.fund({value: ethers.parseEther("0.002")})
            await time.increase(200)
            await mine()
            await expect(fundMeSecondAccount.refund()).to.be.revertedWith("there is no fund for you")
        }
    )
    it("window closed, target is not reached, funder has balance, refund success",
        async function(){
            await fundMe.fund({value: ethers.parseEther("0.002")})
            await time.increase(200)
            await mine()
            await expect(fundMe.refund()).to.emit(fundMe,"RefundByFunder").withArgs(firstAccount,ethers.parseEther("0.002"))
        }
    )
    
})

