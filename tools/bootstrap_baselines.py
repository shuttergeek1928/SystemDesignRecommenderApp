"""
Bootstrap Consolidated Baselines
==================================
Merges existing Baseline A (from dataset) and Baseline B (from baseline_b_results.json)
into the consolidated_baselines.json format so we don't re-generate already-computed data.

Run this BEFORE running generate_baselines.py to seed the consolidated file.

Usage:
    python bootstrap_baselines.py
"""

import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(SCRIPT_DIR, "../data/architecture_dataset_40.json")
BASELINE_B_PATH = os.path.join(SCRIPT_DIR, "../data/baseline_b_results.json")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "../data/consolidated_baselines.json")

DECISION_NODES = ["database", "cache", "messaging", "deployment", "observability", "security"]


def main():
    print("Loading dataset...")
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    print("Loading existing Baseline B results...")
    baseline_b_data = []
    if os.path.exists(BASELINE_B_PATH):
        with open(BASELINE_B_PATH, "r", encoding="utf-8") as f:
            baseline_b_data = json.load(f)
    else:
        print("  ⚠ No existing Baseline B file found, skipping.")

    # Build Baseline B lookup
    b_map = {entry["scenario_id"]: entry.get("baseline_B_llm", {}) for entry in baseline_b_data}

    # Load existing consolidated output if present
    output = []
    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            output = json.load(f)
        print(f"  Found existing consolidated file with {len(output)} records.")

    existing_ids = {r["scenario_id"] for r in output}

    # Merge
    added = 0
    updated = 0
    for scenario in dataset:
        sid = scenario["scenario_id"]

        # Find or create record
        record = None
        for r in output:
            if r["scenario_id"] == sid:
                record = r
                break

        if record is None:
            record = {
                "scenario_id": sid,
                "title": scenario.get("title", ""),
                "description": scenario.get("description", ""),
                "context": scenario.get("context", {}),
            }
            output.append(record)
            added += 1
        else:
            updated += 1

        # Baseline A (Expert) from dataset
        gt = scenario.get("ground_truth_architecture", {})
        expert = gt.get("baseline_A_expert", {})
        if expert and "baseline_A_expert" not in record:
            record["baseline_A_expert"] = {}
            for node in DECISION_NODES:
                node_data = expert.get(node)
                if node_data and isinstance(node_data, dict):
                    record["baseline_A_expert"][node] = {
                        "choice": node_data.get("choice", ""),
                        "justification": node_data.get("justification", ""),
                    }

        # Baseline B (LLM) from existing results
        if sid in b_map and b_map[sid] and "baseline_B_llm" not in record:
            record["baseline_B_llm"] = {}
            for node in DECISION_NODES:
                node_data = b_map[sid].get(node)
                if node_data and isinstance(node_data, dict):
                    record["baseline_B_llm"][node] = {
                        "choice": node_data.get("choice", ""),
                        "justification": node_data.get("justification", ""),
                    }

    # Sort by scenario_id
    output.sort(key=lambda x: x["scenario_id"])

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # Summary
    total_a = sum(1 for r in output if r.get("baseline_A_expert"))
    total_b = sum(1 for r in output if r.get("baseline_B_llm"))
    total_c = sum(1 for r in output if r.get("baseline_C_rag"))
    total_d = sum(1 for r in output if r.get("baseline_D_hybrid"))

    print(f"\n{'='*50}")
    print(f"  Bootstrap Complete")
    print(f"{'='*50}")
    print(f"  Total scenarios: {len(output)}")
    print(f"  New records: {added}, Updated: {updated}")
    print(f"  Coverage:")
    print(f"    Baseline A (Expert):  {total_a}/{len(output)}")
    print(f"    Baseline B (LLM):     {total_b}/{len(output)}")
    print(f"    Baseline C (RAG):     {total_c}/{len(output)}")
    print(f"    Baseline D (Hybrid):  {total_d}/{len(output)}")
    print(f"  Output: {os.path.abspath(OUTPUT_PATH)}")
    print()


if __name__ == "__main__":
    main()
