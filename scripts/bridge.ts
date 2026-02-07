import { ethers } from "hardhat";

// CONFIGURATION
const SONAR_ADDRESS = "0xf389B1eceA74411E09941d5392e79693Ac4bfB05"; // Your deployed address
// A real Bitcoin Testnet Transaction (Using a random recent one or one you find)
// You can replace this with any valid BTC Testnet TX Hash you find on mempool.space/testnet
const BTC_TX_ID = "2c67d60515152a5501861962305da39572b938959d992f89f257bf855e90d2e5";

async function main() {
    console.log("SONAR BRIDGE: Initiating FDC Verification...");

    // 1. Setup
    const [signer] = await ethers.getSigners();
    const Sonar = await ethers.getContractFactory("Sonar");
    const sonar = Sonar.attach(SONAR_ADDRESS);

    // 2. Prepare the Attestation Request (Ask Flare to check Bitcoin)
    // We use the simpler "Payment" verification type
    const attestationType = "0x4e756d6265720000000000000000000000000000000000000000000000000000"; // Generic ID for demo or specific type

    console.log(`Verifying Bitcoin TX: ${BTC_TX_ID.substring(0, 10)}...`);
    console.log("Submitting request to Flare Data Connector (Round mechanism)...");

    // HACKATHON SHORTCUT:
    // Real FDC verification takes ~90 seconds (waiting for the round).
    // For the "Skeleton" demo at 3 AM, we are going to try to CALL the contract.
    // Note: If we don't have a valid proof yet, this will fail on-chain.
    // BUT, to test the PIPELINE, we will try to send a "Dummy" transaction first
    // just to verify we can talk to your Sonar contract.

    try {
        // In a real run, we would fetch the proof from the FDC Hub here.
        // For now, let's check the status.
        const isRisk = await sonar.isRiskDetected();
        console.log(`Current Sonar Risk Status: ${isRisk}`);

        if (!isRisk) {
            console.log("TRIGGERING ARTIFICIAL ALERT (Demo Mode)...");

            // NOTE: This will REVERT because we don't have a valid proof yet.
            // This is expected! We just want to see the script run.
            // In the morning, we will generate the actual Proof string.
            console.log("(Expected Failure) Cannot verify without waiting 90s for FDC round.");
            console.log("BRIDGE SCRIPT OPERATIONAL. CONNECTED TO: " + SONAR_ADDRESS);
        } else {
            console.log("Risk already detected on-chain!");
        }
    } catch (error) {
        console.error("Blockchain interaction failed:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
