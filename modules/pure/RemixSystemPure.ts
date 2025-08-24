export type RemixState = { remixMode: boolean; debugOverlay: boolean };

export function toggle(remixMode: boolean): { op: 'remix.toggle'; status: 'ok'; state: RemixState }{
	return { op:'remix.toggle', status:'ok', state: { remixMode, debugOverlay: !!remixMode } };
}

export function getState(remixMode: boolean): RemixState {
	return { remixMode, debugOverlay: !!remixMode };
}