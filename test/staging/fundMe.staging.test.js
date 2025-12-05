const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { time,mine } = require("@nomicfoundation/hardhat-network-helpers")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
? describe.skip 
: describe("test fundme contract", async function(){

    let fundMe
    let firstAccount
    this.beforeEach(async function(){
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        const fundMeDeployment = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
    })

   //test fund and getFund successfully
//    it("fund and getFund successfully",
//     async function() {
//         await fundMe.fund({value: ethers.parseEther("0.008")})
//         await new Promise(resolve => setTimeout(resolve, 181 *1000))
//         //make sure we can get receipt
//         const getFundTx = await fundMe.getFund()
//         const getFundReceipt = await getFundTx.wait()
//         await expect(getFundReceipt).to.emit(fundMe,"FundWithdrawByOwner").withArgs(ethers.parseEther("0.008"))
//     }
//    )
   //test fund and not reached target then refund successfully
   it("fund and refund successfully",
    async function() {
        await fundMe.fund({value: ethers.parseEther("0.002")})
        await new Promise(resolve => setTimeout(resolve, 181 *1000))
        //make sure we can get receipt
        const refundTx = await fundMe.refund()
        const refundTxReceipt = await refundTx.wait()
        await expect(refundTxReceipt).to.emit(fundMe,"RefundByFunder").withArgs(firstAccount, ethers.parseEther("0.002"))
    }
   )
    
})

