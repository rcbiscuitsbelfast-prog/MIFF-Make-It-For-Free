type DialogueLine = string;

export interface DialogueSequence {
  id: string;
  lines: DialogueLine[];
  currentIndex: number;
}

const dialogues = new Map<string, DialogueSequence>();

export function registerDialogue(id: string, lines: DialogueLine[]): void {
  dialogues.set(id, { id, lines, currentIndex: 0 });
}

export function getNextLine(id: string): string | null {
  const seq = dialogues.get(id);
  if (!seq) return null;
  const line = seq.lines[seq.currentIndex] ?? null;
  seq.currentIndex = Math.min(seq.currentIndex + 1, seq.lines.length);
  return line;
}

export function resetDialogue(id: string): void {
  const seq = dialogues.get(id);
  if (seq) seq.currentIndex = 0;
}
