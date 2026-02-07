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

    // Flare FDC Trigger (Called by the FDC when a verified Bitcoin transaction matches our risk criteria)
    function triggerRiskAlert(
        IPayment.Proof calldata proof
    ) external {
        bool isValid = ContractRegistry.getFdcVerification().verifyPayment(proof);
        require(isValid, "FDC: Invalid Bitcoin Transaction Proof");

        isRiskDetected = true;
        riskReason = "Whale Movement Verified on Bitcoin";
        emit RiskDetected(riskReason, block.timestamp);
    }

    // Admin Override (For Demo Purposes)
    function triggerArtificialAlert() external {
        require(msg.sender == owner, "Only owner can force alert");
        isRiskDetected = true;
        riskReason = "Manual Override: Zero-Day Exploit Detected";
        emit RiskDetected(riskReason, block.timestamp);
    }

    function resetSystem() external {
        require(msg.sender == owner, "Only owner can reset system");
        isRiskDetected = false;
        riskReason = "";
        emit SystemReset();
    }
}