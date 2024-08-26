// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CoinFlip {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function flipCoin(string memory side) public payable {
        require(msg.value > 0, "Bet amount must be greater than 0");

        // Simple coin flip logic
        uint random = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        bool win = (random % 2 == 0);

        if ((win && keccak256(abi.encodePacked(side)) == keccak256(abi.encodePacked("heads"))) ||
            (!win && keccak256(abi.encodePacked(side)) == keccak256(abi.encodePacked("tails")))) {
            payable(msg.sender).transfer(msg.value * 2);
        }
    }
}
