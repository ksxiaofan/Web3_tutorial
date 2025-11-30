//import ethers.js
//create main function


//execute main function
// import hre from "hardhat";
// import { verifyContract } from "@nomicfoundation/hardhat-verify/verify";


// const { ethers } = require("hardhat")
// const {verifyContract} = require("@nomicfoundation/hardhat-verify/verify")
async function main() {
    //create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    console.log("contract deploying")
    //deploy contract from factory
    const fundMe = await fundMeFactory.deploy(30)
    await fundMe.waitForDeployment()
    console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`)

    //verify fundMe
    // if(hre.network.config.chainId == 11155111 && process.env.PRIVATE_KEY){
    //     console.log("waiting for 5 confirmations")
    //     await fundMe.deploymentTransaction().wait(5)
    //     await verifyFundMe(fundMe.target,[10])
    // }else{
    //     console.log("verification skipped...")
    // }

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

    const balanceOfFirstAccountBefore = await ethers.provider.getBalance(firstAccount.address)
    console.log(`Balance of the first account before refund is ${balanceOfFirstAccountBefore}`)
    //refund from first account
    const refundTx = await fundMe.refund()
    await refundTx.wait()
    //check balance of contract
    const balanceOfContractAfterFirstRefund = await ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of the contract is ${balanceOfContractAfterFirstRefund}`)
    const balanceOfFirstAccount = await ethers.provider.getBalance(firstAccount.address)
    console.log(`Balance of the first account after refund is ${balanceOfFirstAccount}`)


    const balanceOfSecondAccountBefore = await ethers.provider.getBalance(secondAccount.address)
    console.log(`Balance of the second account before refund is ${balanceOfSecondAccountBefore}`)
    //refund from second account
    const refundTxFromSecondAccount = await fundMe.connect(secondAccount).refund()
    await refundTxFromSecondAccount.wait()
    //check balance of contract
    const balanceOfContractAfterSecondRefund = await ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of the contract is ${balanceOfContractAfterSecondRefund}`)
    const balanceOfSecondAccount = await ethers.provider.getBalance(secondAccount.address)
    console.log(`Balance of the second account after refund is ${balanceOfSecondAccount}`)
    // await verifyContract(
    //     {
    //       address: fundMe.target,
    //       constructorArgs: [10],
    //       provider: "etherscan", // or "blockscout", or "sourcify"
    //     },
    //     hre,
    //   );



}

async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
    });
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


main().then().catch((error) => {
    console.error(error)
    process.exit(1)
})