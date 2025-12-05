// function deployFunction(){
//     console.log("this is a deploy function")
// }

const { network } = require("hardhat")
const { developmentChains, networkConfig, LOCK_TIME } = require("../helper-hardhat-config")

// module.exports.default=deployFunction

module.exports= async({getNamedAccounts,deployments})=>{
    // const firstAccount = (await getNamedAccounts()).firstAccount
    // console.log(`first account is ${firstAccount}`)
    // console.log("this is a deploy function")

    const {firstAccount} = await getNamedAccounts()
    const {deploy} = await deployments
    // const firstAccount = (await getNamedAccounts()).firstAccount
    // const deploy = await deployments.deploy
    let dataFeedAddr
    if(developmentChains.includes(network.name)){
        const mockDataFeed = await deployments.get("MockV3Aggregator")
        dataFeedAddr = mockDataFeed.address
    }else{
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed
    }
    const fundMe = await deploy("FundMe",{
        from: firstAccount,
        args: [LOCK_TIME, dataFeedAddr],
        log: true
    })
    console.log("contract address:",fundMe.address)

    if(hre.network.config.chainId == 11155111 && process.env.PRIVATE_KEY){
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCK_TIME, dataFeedAddr],
        });
    }else{
        console.log("Network is not sepolia, verification skipped...")
    }
}

module.exports.tags = ["all","fundme"]