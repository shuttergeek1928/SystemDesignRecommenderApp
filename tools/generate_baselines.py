"""
Baseline Generation Script for Dissertation Evaluation
========================================================
Generates 4 baselines for each scenario in the architecture dataset:
  - Baseline A (Expert):  Already present in the dataset as ground truth
  - Baseline B (LLM-only): Uses the .NET API with useRag=false, useHybrid=false
  - Baseline C (RAG+LLM):  Uses the .NET API with useRag=true, useHybrid=false
  - Baseline D (Hybrid):   Uses the .NET API with useRag=true, useHybrid=true

All generated results are stored into a consolidated output file for
downstream metric calculation.

Usage:
    python generate_baselines.py [--limit N] [--baselines B,C,D] [--retry-failures]
"""

import json
import requests
import time
import os
import argparse
import sys
from datetime import datetime

# ──────────────────────────────────────────────────────────────
# Paths
# ──────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(SCRIPT_DIR, "../data/architecture_dataset_40.json")
OUTPUT_PATH  = os.path.join(SCRIPT_DIR, "../data/consolidated_baselines.json")
FAILURE_LOG  = os.path.join(SCRIPT_DIR, "../data/baseline_generation_failures.json")

# ──────────────────────────────────────────────────────────────
# API Configuration
# ──────────────────────────────────────────────────────────────
CORE_API_URL = "http://localhost:5220/api/SystemDesign/generate"
RAG_API_URL  = "http://localhost:8001/generate/rag"

# Timeout per request (seconds) – LLM calls can be slow
REQUEST_TIMEOUT = 120
# Rate limit backoff between requests (seconds)
BACKOFF_SECONDS = 3

DECISION_NODES = ["database", "cache", "messaging", "deployment", "observability", "security"]


def load_dataset():
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_existing_output():
    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_output(data):
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def save_failures(data):
    with open(FAILURE_LOG, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def format_api_requirements(scenario):
    """Convert dataset scenario format to the .NET API DesignRequirements JSON shape."""
    ctx = scenario.get("context", {})
    return {
        "scenario_id": scenario.get("scenario_id", 0),
        "title": scenario.get("title", ""),
        "description": scenario.get("description", ""),
        "context": {
            "users": ctx.get("users", 1000),
            "traffic_pattern": ctx.get("traffic_pattern", "steady"),
            "latency_requirement_ms": ctx.get("latency_requirement_ms", 200),
            "availability_slo": ctx.get("availability_slo", "99.9%"),
            "consistency_model": ctx.get("consistency_model", "eventual"),
            "budget": ctx.get("budget", "medium"),
            "compliance": ctx.get("compliance", []),
            "cloud_provider": ctx.get("cloud_provider", "AWS"),
            "region_strategy": ctx.get("region_strategy", "single"),
            "read_write_ratio": ctx.get("read_write_ratio", "balanced"),
            "data_retention": ctx.get("data_retention", "years"),
            "security_sensitivity": ctx.get("security_sensitivity", "internal"),
        },
        "non_functional_requirements": scenario.get("non_functional_requirements", []),
        "provider": "ollama",
        "model": "qwen2.5-coder:7b"
    }


def extract_architecture(api_response):
    """Extract the architecture dict from the .NET API response.
    Returns a dict of { node_key: { choice, justification } }."""
    arch = api_response.get("architectureDesign", {})
    result = {}
    for key in DECISION_NODES:
        node = arch.get(key)
        if node and isinstance(node, dict):
            result[key] = {
                "choice": node.get("choice", ""),
                "justification": node.get("justification", ""),
            }
        else:
            # Check case-insensitive
            for k, v in arch.items():
                if k.lower() == key.lower() and isinstance(v, dict):
                    result[key] = {
                        "choice": v.get("choice", ""),
                        "justification": v.get("justification", ""),
                    }
                    break
    return result


def generate_via_core_api(scenario, use_rag: bool, use_hybrid: bool):
    """Call the .NET Core API endpoint to generate an architecture."""
    problem = f"Design a {scenario['title']}. {scenario['description']}"
    payload = {
        "problem_statement": problem,
        "use_rag": use_rag,
        "use_hybrid": use_hybrid,
        "requirements": format_api_requirements(scenario),
    }

    try:
        resp = requests.post(CORE_API_URL, json=payload, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            return extract_architecture(data)
        else:
            print(f"    [FAIL] HTTP {resp.status_code}: {resp.text[:200]}")
    except requests.exceptions.Timeout:
        print(f"    [FAIL] Timeout after {REQUEST_TIMEOUT}s")
    except requests.exceptions.ConnectionError:
        print(f"    [FAIL] Connection refused - is the .NET API running on {CORE_API_URL}?")
    except Exception as e:
        print(f"    [FAIL] Exception: {e}")
    return None


def extract_expert_baseline(scenario):
    """Extract the already-present expert baseline (Baseline A)."""
    gt = scenario.get("ground_truth_architecture", {})
    expert = gt.get("baseline_A_expert", {})
    result = {}
    for key in DECISION_NODES:
        node = expert.get(key)
        if node and isinstance(node, dict):
            result[key] = {
                "choice": node.get("choice", ""),
                "justification": node.get("justification", ""),
            }
    return result if result else None


def find_existing_record(output, scenario_id):
    """Find existing record in output by scenario_id."""
    for rec in output:
        if rec.get("scenario_id") == scenario_id:
            return rec
    return None


def main():
    parser = argparse.ArgumentParser(description="Generate baselines for dissertation evaluation")
    parser.add_argument("--limit", type=int, default=0, help="Max scenarios to process (0 = all)")
    parser.add_argument("--baselines", type=str, default="B,C,D",
                        help="Comma-separated baselines to generate (B, C, D)")
    parser.add_argument("--retry-failures", action="store_true",
                        help="Retry previously failed scenarios only")
    parser.add_argument("--start-from", type=int, default=1,
                        help="Start from this scenario_id (inclusive)")
    args = parser.parse_args()

    requested = set(b.strip().upper() for b in args.baselines.split(","))
    print(f"{'='*60}")
    print(f"  Dissertation Baseline Generator")
    print(f"  Baselines: {', '.join(sorted(requested))}")
    print(f"  Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    # Load data
    scenarios = load_dataset()
    output = load_existing_output()
    failures = []

    # Determine which scenarios to process
    failed_ids = set()
    if args.retry_failures and os.path.exists(FAILURE_LOG):
        with open(FAILURE_LOG, "r") as f:
            prev_failures = json.load(f)
        failed_ids = {f["scenario_id"] for f in prev_failures}
        print(f"Retrying {len(failed_ids)} previously failed scenarios.\n")

    processed = 0
    total = len(scenarios)

    for scenario in scenarios:
        sid = scenario["scenario_id"]

        if sid < args.start_from:
            continue

        if args.retry_failures and sid not in failed_ids:
            continue

        if 0 < args.limit <= processed:
            break

        print(f"[{sid:02d}/{total}] {scenario['title']}")

        # Find or create output record
        record = find_existing_record(output, sid)
        if record is None:
            record = {
                "scenario_id": sid,
                "title": scenario["title"],
                "description": scenario["description"],
                "context": scenario.get("context", {}),
            }
            output.append(record)

        # ── Baseline A (Expert) ──────────────────────────────────
        if "baseline_A_expert" not in record or not record["baseline_A_expert"]:
            expert = extract_expert_baseline(scenario)
            if expert:
                record["baseline_A_expert"] = expert
                print(f"  [OK] Baseline A (Expert) extracted from dataset")
            else:
                print(f"  [WARN] Baseline A (Expert) missing from dataset!")

        # ── Baseline B (LLM-only) ───────────────────────────────
        if "B" in requested:
            if "baseline_B_llm" not in record or not record["baseline_B_llm"]:
                print(f"  --> Generating Baseline B (LLM-only)...")
                result = generate_via_core_api(scenario, use_rag=False, use_hybrid=False)
                if result:
                    record["baseline_B_llm"] = result
                    print(f"  [OK] Baseline B generated ({len(result)} nodes)")
                else:
                    failures.append({"scenario_id": sid, "baseline": "B", "status": "failed"})
                    print(f"  [FAIL] Baseline B failed")
                time.sleep(BACKOFF_SECONDS)
            else:
                print(f"  [-] Baseline B already exists, skipping")

        # ── Baseline C (RAG+LLM) ───────────────────────────────
        if "C" in requested:
            if "baseline_C_rag" not in record or not record["baseline_C_rag"]:
                print(f"  --> Generating Baseline C (RAG+LLM)...")
                result = generate_via_core_api(scenario, use_rag=True, use_hybrid=False)
                if result:
                    record["baseline_C_rag"] = result
                    print(f"  [OK] Baseline C generated ({len(result)} nodes)")
                else:
                    failures.append({"scenario_id": sid, "baseline": "C", "status": "failed"})
                    print(f"  [FAIL] Baseline C failed")
                time.sleep(BACKOFF_SECONDS)
            else:
                print(f"  [-] Baseline C already exists, skipping")

        # ── Baseline D (Hybrid: Rules + RAG + LLM) ─────────────
        if "D" in requested:
            if "baseline_D_hybrid" not in record or not record["baseline_D_hybrid"]:
                print(f"  --> Generating Baseline D (Hybrid: Rules+RAG+LLM)...")
                result = generate_via_core_api(scenario, use_rag=True, use_hybrid=True)
                if result:
                    record["baseline_D_hybrid"] = result
                    print(f"  [OK] Baseline D generated ({len(result)} nodes)")
                else:
                    failures.append({"scenario_id": sid, "baseline": "D", "status": "failed"})
                    print(f"  [FAIL] Baseline D failed")
                time.sleep(BACKOFF_SECONDS)
            else:
                print(f"  [-] Baseline D already exists, skipping")

        # Save after each scenario (incremental persistence)
        save_output(output)
        processed += 1
        print()

    # Save failure log
    save_failures(failures)

    # ── Summary ─────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"  Generation Complete")
    print(f"  Processed:  {processed} scenarios")
    print(f"  Failures:   {len(failures)}")
    print(f"  Output:     {os.path.abspath(OUTPUT_PATH)}")
    print(f"  Failures:   {os.path.abspath(FAILURE_LOG)}")
    print(f"{'='*60}\n")

    # Quick coverage report
    total_a = sum(1 for r in output if r.get("baseline_A_expert"))
    total_b = sum(1 for r in output if r.get("baseline_B_llm"))
    total_c = sum(1 for r in output if r.get("baseline_C_rag"))
    total_d = sum(1 for r in output if r.get("baseline_D_hybrid"))
    print(f"  Coverage Report:")
    print(f"    Baseline A (Expert):  {total_a}/{len(output)}")
    print(f"    Baseline B (LLM):     {total_b}/{len(output)}")
    print(f"    Baseline C (RAG):     {total_c}/{len(output)}")
    print(f"    Baseline D (Hybrid):  {total_d}/{len(output)}")


if __name__ == "__main__":
    main()
