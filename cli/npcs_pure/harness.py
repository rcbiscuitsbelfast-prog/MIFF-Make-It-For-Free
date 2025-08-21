#!/usr/bin/env python3
import argparse
import json
import random
from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class DialogNode:
    id: str
    text: str
    next_id: str | None = None
    set_flag: str | None = None

@dataclass
class NPC:
    name: str
    dialog: Dict[str, DialogNode]
    start_id: str

@dataclass
class SimulationResult:
    seed: int
    log: List[str] = field(default_factory=list)
    flags: Dict[str, bool] = field(default_factory=dict)

class Simulator:
    def __init__(self, npc: NPC, seed: int):
        self.npc = npc
        self.random = random.Random(seed)
        self.flags: Dict[str, bool] = {}
        self.log: List[str] = []
        self.seed = seed

    def run(self) -> SimulationResult:
        current_id = self.npc.start_id
        visited = set()
        while current_id is not None:
            if current_id in visited:
                self.log.append(f"Loop detected at {current_id}; stopping")
                break
            visited.add(current_id)
            node = self.npc.dialog[current_id]
            self.log.append(f"NPC: {node.text}")
            if node.set_flag:
                self.flags[node.set_flag] = True
                self.log.append(f"FLAG SET: {node.set_flag}=true")
            # Deterministic choice if branching in future
            current_id = node.next_id
        return SimulationResult(seed=self.seed, log=self.log, flags=self.flags)


def load_npc_from_json(path: str) -> NPC:
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    dialog_map: Dict[str, DialogNode] = {}
    for d in data['dialog']:
        dialog_map[d['id']] = DialogNode(
            id=d['id'],
            text=d['text'],
            next_id=d.get('next_id'),
            set_flag=d.get('set_flag'),
        )
    return NPC(name=data['name'], dialog=dialog_map, start_id=data['start_id'])


def main():
    parser = argparse.ArgumentParser(description='NPCsPure CLI Harness')
    parser.add_argument('--npc', required=True, help='Path to NPC JSON spec')
    parser.add_argument('--seed', type=int, default=1234)
    args = parser.parse_args()

    npc = load_npc_from_json(args.npc)
    sim = Simulator(npc, args.seed)
    res = sim.run()

    print(json.dumps({
        'seed': res.seed,
        'log': res.log,
        'flags': res.flags,
    }, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()