import json
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_CONNECTION_STRING", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("MONGO_DATABASE_NAME", "SystemDesignMongoDb")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASELINES_PATH = os.path.join(SCRIPT_DIR, "../data/consolidated_baselines.json")
DATASET_PATH = os.path.join(SCRIPT_DIR, "../data/architecture_dataset_40.json")

def sync():
    print(f"Connecting to MongoDB at {MONGO_URI}...")
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db["ReferenceBlueprints"]

    if not os.path.exists(BASELINES_PATH):
        print(f"Error: Baselines file not found at {BASELINES_PATH}")
        return

    with open(BASELINES_PATH, "r", encoding="utf-8") as f:
        baselines = json.load(f)
    
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        dataset = json.load(f)
    
    # Create a map for acceptable alternatives from the original dataset
    alternatives_map = {s["scenario_id"]: s.get("acceptable_alternatives", {}) for s in dataset}

    print(f"Syncing {len(baselines)} baselines to MongoDB...")
    
    # Clear existing records to avoid duplicates from casing mismatches (ScenarioId vs scenario_id)
    print("Clearing existing reference blueprints to ensure a clean sync...")
    collection.delete_many({})
    
    success_count = 0
    for record in baselines:
        sid = record["scenario_id"]
        
        # Prepare the blueprint document
        blueprint = {
            "scenario_id": sid,
            "title": record.get("title", ""),
            "description": record.get("description", ""),
            "context": record.get("context", {}),
            "ground_truth_architecture": {
                "baseline_A_expert": { "nodes": record.get("baseline_A_expert", {}) },
                "baseline_B_llm": { "nodes": record.get("baseline_B_llm", {}) },
                "baseline_C_rag": { "nodes": record.get("baseline_C_rag", {}) },
                "baseline_D_hybrid": { "nodes": record.get("baseline_D_hybrid", {}) }
            },
            "acceptable_alternatives": alternatives_map.get(sid, {}),
            "last_updated": record.get("generated_at")
        }

        # Upsert into MongoDB
        result = collection.replace_one(
            {"scenario_id": sid},
            blueprint,
            upsert=True
        )
        success_count += 1

    print(f"Successfully synced {success_count} baselines to 'ReferenceBlueprints' collection.")

if __name__ == "__main__":
    sync()
