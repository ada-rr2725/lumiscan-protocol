// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {IFdcVerification} from "@flarenetwork/flare-periphery-contracts/coston2/IFdcVerification.sol";
import {IPayment} from "@flarenetwork/flare-periphery-contracts/coston2/IPayment.sol";

contract Sonar {
    bool public isRiskDetected;
    string public riskReason;
    address public owner;

    event RiskDetected(string reason, uint256 timestamp);
    event SystemReset();

    constructor() {
        owner = msg.sender;
        isRiskDetected = false;
    }

    // This function is called by the Flare Data Connector when a relevant Bitcoin transaction is detected
    function triggerRiskAlert(
        IPayment.Proof calldata proof
    ) external {
        // Verify the Bitcoin Transaction exists
        // This checks if the proof is valid according to the Flare Data Connector
        bool isValid = ContractRegistry.getFdcVerification().verifyPayment(proof);
        
        require(isValid, "FDC: Invalid Bitcoin Transaction Proof");

        // Trigger the Circuit Breaker
        isRiskDetected = true;
        riskReason = "Whale Movement Verified on Bitcoin";
        
        emit RiskDetected(riskReason, block.timestamp);
    }

    function resetSystem() external {
        require(msg.sender == owner, "Only owner");
        isRiskDetected = false;
        riskReason = "";
        emit SystemReset();
    }
}