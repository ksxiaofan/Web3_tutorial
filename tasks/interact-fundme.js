
// const { ethers } = require("hardhat")
const { task } = require("hardhat/config")

task("interact-fundme","interact with fundMe contract")
    .addParam("addr", "fundme contract address")
    .setAction(async (taskArgs, hre) => {
        const fundMeFactory = await ethers.getContractFactory("FundMe")
        const fundMe = fundMeFactory.attach(taskArgs.addr)

        //init 2 accounts
        const [firstAccount, secondAccount] = await ethers.getSigners()
        //fund contract with first account
        const fundTx = await fundMe.fund({ value: ethers.parseEther("0.002") })
        await fundTx.wait()

        //check balance of contract
        const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
        console.log(`Balance of the contract is ${balanceOfContract}`)

        //fund contract with second account
        const fundTxSecondAccount = await fundMe.connect(secondAccount).fund({ value: ethers.parseEther("0.003") })
        await fundTxSecondAccount.wait()

        //check balance of contract
        const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target)
        console.log(`Balance of the contract is ${balanceOfContractAfterSecondFund}`)

        //check mapping fundersToAmount 
        const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address)
        const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address)
        console.log(`Balance of first account ${firstAccount.address} is ${firstAccountBalanceInFundMe}`)
        console.log(`Balance of second account ${secondAccount.address} is ${secondAccountBalanceInFundMe}`)

        //wait 120s until window end
        console.log("wait 120 seconds")
        await delay(120000)
        //refund from accounts
        const refundTx = await fundMe.refund()
        await refundTx.wait()
        //check balance of contract
        const balanceOfContractAfterFirstRefund = await ethers.provider.getBalance(fundMe.target)
        console.log(`Balance of the contract is ${balanceOfContractAfterFirstRefund}`)

    })

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports = {}