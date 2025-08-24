export type UIButton = { id: string; type: 'button'; label: string; layout?: 'full'; image?: string };
export type UIToggle = { id: string; type: 'toggle'; label: string; value: boolean };
export type UIElement = UIButton | UIToggle;

export type UIRender = { op: 'ui.render'; status: 'ok'; elements: UIElement[]; remixMode?: boolean; debugOverlay?: boolean };

export function createButton(id: string, label: string, layout: 'full' = 'full', image?: string): UIButton {
	return { id, type: 'button', label, layout, image };
}

export function createToggle(id: string, label: string, value = false): UIToggle {
	return { id, type: 'toggle', label, value };
}

export function renderUI(elements: UIElement[], remixMode = false): UIRender {
	return { op: 'ui.render', status: 'ok', elements: elements.slice(), remixMode, debugOverlay: !!remixMode };
}

export function handleTap(elements: UIElement[], targetId: string): { kind: 'button'|'toggle'|'none'; id?: string; value?: boolean } {
	const el = elements.find(e => e.id === targetId);
	if(!el) return { kind: 'none' };
	if(el.type === 'button') return { kind: 'button', id: el.id };
	if(el.type === 'toggle') return { kind: 'toggle', id: el.id, value: !el.value };
	return { kind: 'none' };
}