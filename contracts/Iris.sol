// SPDX-License-Identifier: MIT
// The Iris acts as a protective layer that consults the Lumiscan (Sonar) for any detected risks before allowing withdrawals.
// If the Lumiscan signals a risk (like high volatility or a whale movement), the Iris engages its "shutter" to prevent any outflows, effectively securing the assets until the risk is mitigated.
pragma solidity >=0.8.0 <0.9.0;

interface ILumiscan {
    function isRiskDetected() external view returns (bool);
}

contract Iris {
    ILumiscan public opticNerve; // The "Optic Nerve" that connects to Lumiscan for risk detection
    mapping(address => uint256) public balances;
    
    // The "Shutter" state (True = Closed/Frozen)
    bool public shutterClosed = false;

    event Inflow(address indexed user, uint256 amount);
    event Outflow(address indexed user, uint256 amount);
    event ShutterEngaged(string reason);

    constructor(address _lumiscanAddress) {
        opticNerve = ILumiscan(_lumiscanAddress);
    }

    // Deposit (Always allowed, like light entering)
    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Inflow(msg.sender, msg.value);
    }

    // Withdraw (Controlled by the Iris Shutter)
    function withdraw(uint256 amount) external {
        // 1. CONSULT LUMISCAN (The "Optic Nerve")
        if (opticNerve.isRiskDetected()) {
            shutterClosed = true;
            emit ShutterEngaged("Lumiscan Signal: High Volatility Detected");
            revert("IRIS: SHUTTER CLOSED // ASSETS SECURED");
        }

        require(balances[msg.sender] >= amount, "Insufficient reserves");
        balances[msg.sender] -= amount;
        
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Transfer failed");
        
        emit Outflow(msg.sender, amount);
    }
}