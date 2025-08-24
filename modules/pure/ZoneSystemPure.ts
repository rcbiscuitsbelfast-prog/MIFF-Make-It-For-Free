export type ZoneRoute = { from: string; to: string; reason?: string };

export function route(current: string, target: string): { op: 'zone.route'; status: 'ok'; route: ZoneRoute }{
	return { op:'zone.route', status:'ok', route: { from: current, to: target } };
}