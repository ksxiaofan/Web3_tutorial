const { DECIMAL, INITIAL_ANSWER, developmentChains} = require("../helper-hardhat-config")

module.exports= async({getNamedAccounts,deployments})=>{

    if(developmentChains.includes(network.name)){
        const {firstAccount} = await getNamedAccounts()
        const {deploy} = await deployments
        await deploy("MockV3Aggregator",{
            from: firstAccount,
            args: [DECIMAL, INITIAL_ANSWER],
            log: true
        })
    }else {
        console.log("env is not local,skip mock contract")
    }

}

module.exports.tags = ["all","mock"]