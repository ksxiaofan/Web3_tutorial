//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FundMe {
    mapping(address => uint256) public fundersToAmount;
    AggregatorV3Interface internal dataFeed;
    uint256 constant MINIMUM_VALUE = 4 * 10 ** 18;//USD
    uint256 constant TARGET = 20 * 10 ** 18;
    address public owner;
    uint256 deploymentTimestamp;
    uint256 lockTime;
    address erc20Addr; 
    bool public getFundSuccess = false;

    constructor(uint256 _lockTime) {
        dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        owner = msg.sender;
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund() external payable {
        require(converEthToUsd(msg.value) >= MINIMUM_VALUE, "Send more ETH!!!");
        require(block.timestamp < deploymentTimestamp+lockTime,"time is end,can't fund any more");
        fundersToAmount[msg.sender] = msg.value; 
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
        // prettier-ignore
        (
      /* uint80 roundId */
      ,
      int256 answer,
      /*uint256 startedAt*/
      ,
      /*uint256 updatedAt*/
      ,
      /*uint80 answeredInRound*/
    ) = dataFeed.latestRoundData();
        return answer;
    }

    function converEthToUsd(uint256 ethAmount) internal view returns (uint256) {
        uint256 ethPrice = uint(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice/(10**8);
    }

    function transferOwnership(address newOwner) public onlyOwner{
        // require(msg.sender == owner, "this function can only be called by owner");
        owner = newOwner;
    }

    function getFund() external windowClose onlyOwner{
        require(converEthToUsd(address(this).balance) >= TARGET, "Target is not reached");
        // require(msg.sender == owner, "this function can only be called by owner");
        // require(block.timestamp >= deploymentTimestamp+lockTime,"time isn't end,can't getFund");
        // payable(msg.sender).transfer(address(this).balance);
        
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "tx failed");

        bool success;
        (success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "transfer tx failed");
        fundersToAmount[msg.sender]=0;
        getFundSuccess = true;
    }

    function refund() external windowClose{
        require(converEthToUsd(address(this).balance) < TARGET, "Target is reached"); 
        require(fundersToAmount[msg.sender]!=0, "there is no fund for you");
        // require(block.timestamp >= deploymentTimestamp+lockTime,"time isn't end,can't refund");
        bool success;
        (success, ) = payable(msg.sender).call{value: fundersToAmount[msg.sender]}("");
        require(success, "transfer tx failed");
        fundersToAmount[msg.sender]=0;

    }

    function setFunderToAmount(address funder, uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr, "you do not have permission to call the function");
        fundersToAmount[funder] = amountToUpdate;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner{
        erc20Addr = _erc20Addr;
    }

    modifier windowClose(){
        require(block.timestamp >= deploymentTimestamp+lockTime,"time isn't end,can't refund");
        _;
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "this function can only be called by owner");
        _;
    }
}
