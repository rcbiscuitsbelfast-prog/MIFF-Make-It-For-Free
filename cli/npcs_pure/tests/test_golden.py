import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HARNESS = ROOT / "cli" / "npcs_pure" / "harness.py"
NPC = ROOT / "cli" / "npcs_pure" / "sample_npc.json"

EXPECTED = {
    "seed": 1234,
    "log": [
        "NPC: Hello trainer!",
        "NPC: Could you fetch a potion?",
        "FLAG SET: quest_started=true",
        "NPC: Good luck!"
    ],
    "flags": {"quest_started": True}
}

def test_golden():
    proc = subprocess.run([sys.executable, str(HARNESS), "--npc", str(NPC), "--seed", "1234"],
                          check=True, capture_output=True, text=True)
    out = json.loads(proc.stdout)
    assert out == EXPECTED