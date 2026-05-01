import json
import requests
import time
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), "../data/architecture_dataset_40.json")
# We'll use the .NET Core API endpoint for both, but configure the flags.
# Use_Rag = true, Use_Hybrid = false for Baseline B
# Use_Rag = true, Use_Hybrid = true for Baseline C
API_URL = "http://localhost:5220/api/SystemDesign/generate"

def load_dataset():
    with open(DATASET_PATH, 'r') as f:
        return json.load(f)

def save_dataset(data):
    with open(DATASET_PATH, 'w') as f:
        json.dump(data, f, indent=2)
        
def format_requirements(scenario):
    return {
        "title": scenario.get("title", ""),
        "description": scenario.get("description", ""),
        "context": {
            "users": scenario.get("context", {}).get("users", 1000),
            "trafficPattern": scenario.get("context", {}).get("traffic_pattern", "steady"),
            "latencyRequirementMs": scenario.get("context", {}).get("latency_requirement_ms", 200),
            "availabilitySlo": scenario.get("context", {}).get("availability_slo", "99.9%"),
            "consistencyModel": scenario.get("context", {}).get("consistency_model", "eventual"),
            "budget": scenario.get("context", {}).get("budget", "medium"),
            "compliance": scenario.get("context", {}).get("compliance", []),
            "cloudProvider": scenario.get("context", {}).get("cloud_provider", "AWS"),
            "regionStrategy": scenario.get("context", {}).get("region_strategy", "single")
        },
        "nonFunctionalRequirements": scenario.get("non_functional_requirements", [])
    }

def generate_baseline(scenario, use_hybrid):
    req_payload = {
        "problemStatement": f"Design a {scenario['title']}. {scenario['description']}",
        "useRag": True,
        "useHybrid": use_hybrid,
        "requirements": format_requirements(scenario)
    }
    
    try:
        response = requests.post(API_URL, json=req_payload, timeout=60)
        if response.status_code == 200:
            data = response.json()
            arch = data.get("architectureDesign", {})
            # Format to match baseline_A
            return {
                k: {"choice": v.get("choice", ""), "justification": v.get("justification", "")}
                for k, v in arch.items()
            }
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")
    return None

def main():
    print(f"Loading dataset from {DATASET_PATH}")
    scenarios = load_dataset()
    
    # We will only process a subset or those missing to avoid massive API bills/timeouts
    # Let's process the first 5 scenarios as a proof of concept for the dissertation to avoid rate limits
    limit = 5
    processed = 0
    
    for i, scenario in enumerate(scenarios):
        if processed >= limit:
            break
            
        gt = scenario.get("ground_truth_architecture", {})
        
        needs_update = False
        print(f"\nProcessing [{i+1}/{len(scenarios)}] {scenario['title']}")
        
        if "baseline_B_automated" not in gt:
            print("  Generating Baseline B (RAG only)...")
            res_b = generate_baseline(scenario, use_hybrid=False)
            if res_b:
                gt["baseline_B_automated"] = res_b
                needs_update = True
                
        if "baseline_C_hybrid" not in gt:
            print("  Generating Baseline C (Hybrid)...")
            res_c = generate_baseline(scenario, use_hybrid=True)
            if res_c:
                gt["baseline_C_hybrid"] = res_c
                needs_update = True
                
        if needs_update:
            scenario["ground_truth_architecture"] = gt
            save_dataset(scenarios)
            print("  Saved updates.")
            time.sleep(2) # rate limit backoff
            processed += 1
        else:
            print("  Baselines already exist.")

if __name__ == "__main__":
    main()
