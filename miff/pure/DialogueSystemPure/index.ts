// DialogueSystemPure - branching dialogue nodes

export type Node = { id:string; text:string; choices?: Array<{ text:string; next:string }> };
export type Dialogue = { start:string; nodes: Record<string,Node> };

export function nextNode(d: Dialogue, current: string, choiceIndex=0): { op:'dialogue.next'; status:'ok'|'error'; id?:string; issue?:string }{
  const n = d.nodes[current];
  if(!n) return { op:'dialogue.next', status:'error', issue:'missing node' };
  if(!n.choices || !n.choices[choiceIndex]) return { op:'dialogue.next', status:'error', issue:'invalid choice' };
  return { op:'dialogue.next', status:'ok', id: n.choices[choiceIndex].next };
}

