// AudioBridgePure - abstract audio commands

export type AudioCmd = { op:'play'|'stop'|'setVolume'; id?: string; volume?: number };
export function process(cmds: AudioCmd[]): { op:'audio'; status:'ok'; applied: AudioCmd[] }{ return { op:'audio', status:'ok', applied: cmds } }

