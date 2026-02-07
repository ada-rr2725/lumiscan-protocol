import time
import subprocess
import random

def calculate_market_risk():
    """
    Simulates the ACSE Z-Score calculation.
    In Sprint 3, replace this with real Binance data.
    """
    print("[SONAR QUANT] Fetching market data (Binance)...")
    time.sleep(1) # Fake latency
    
    # Simulate a "Normal" market (Z-Score < 3)
    volatility = random.uniform(0.5, 1.5)
    print(f"[SONAR QUANT] Volatility Z-Score: {volatility:.2f} (SAFE)")
    
    return volatility

def trigger_circuit_breaker():
    """
    Calls the TypeScript bridge to talk to Flare.
    """
    print("\n[SONAR AGENT] 🚨 3-SIGMA EVENT DETECTED! TRIGGERING CHAIN...")
    try:
        # Calls the hardhat script using yarn
        result = subprocess.run(
            ["yarn", "hardhat", "run", "scripts/bridge.ts", "--network", "coston2"],
            capture_output=True,
            text=True
        )
        print(result.stdout)
        if result.stderr:
            print("[CHAIN LOG] " + result.stderr)
            
    except Exception as e:
        print(f"Error bridging to chain: {e}")

if __name__ == "__main__":
    print("---------------------------------------")
    print("   SONAR: OFF-CHAIN RISK ENGINE v0.1   ")
    print("---------------------------------------")
    
    while True:
        z_score = calculate_market_risk()
        
        # In a real implementation, we would use the actual Z-Score from Binance data.
        if z_score > 3.0: 
            trigger_circuit_breaker()
            break
            
        # For demo purposes, we allow manual triggering of the circuit breaker.
        user_input = input(">> Simulate Whale Crash? (y/n): ")
        if user_input.lower() == 'y':
            trigger_circuit_breaker()
            break
            
        time.sleep(2)