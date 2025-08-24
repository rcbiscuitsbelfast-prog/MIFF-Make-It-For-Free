export type ZoneRoute = { from: string; to: string; reason?: string };

export function route(current: string, target: string): { op: 'zone.route'; status: 'ok'; route: ZoneRoute }{
	return { op:'zone.route', status:'ok', route: { from: current, to: target } };
}

export function load(zoneId: string): { op:'zone.load'; status:'ok'; current: string }{
	return { op:'zone.load', status:'ok', current: zoneId };
}