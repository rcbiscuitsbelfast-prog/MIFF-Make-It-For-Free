// AssetManifestPure - validate asset definitions and licensing tags

export type AssetEntry = { id: string; path: string; type: 'sprite' | 'audio' | 'font' | 'shader' | 'bundle'; license?: 'cc0' | 'cc-by' | 'agpl' | 'custom'; platform?: 'web' | 'unity' | 'godot' | 'all'; children?: AssetEntry[] };
export type ManifestInput = AssetEntry[] | { assets: AssetEntry[] };
export type NormalizedManifest = { assets: AssetEntry[] };

export function normalizeManifest(input: ManifestInput): NormalizedManifest {
  const assets = Array.isArray(input)? input : (input.assets || []);
  return { assets: normalizeList(assets) };
}

export function validateManifest(m: NormalizedManifest): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  function walk(list: AssetEntry[], prefix=''){
    for(const a of list){
      if(!a.id) issues.push('Asset missing id');
      if(a.id && seen.has(a.id)) issues.push(`Duplicate id: ${a.id}`); else if(a.id) seen.add(a.id);
      if(!a.path) issues.push(`Asset ${a.id}: missing path`);
      if(!a.type) issues.push(`Asset ${a.id}: missing type`);
      if(a.license && !['cc0','cc-by','agpl','custom'].includes(a.license)) issues.push(`Asset ${a.id}: invalid license`);
      if(a.children) walk(a.children, a.id+'/');
    }
  }
  walk(m.assets);
  return issues;
}

export function remixAudit(m: NormalizedManifest): { op:'audit'; status:'ok'|'warn'; issues: string[] }{
  const issues = validateManifest(m).filter(x=>x.includes('license'));
  const status = issues.length? 'warn':'ok';
  return { op:'audit', status, issues };
}

function normalizeList(list: AssetEntry[]): AssetEntry[]{
  return list.map(a=>({ id:a.id, path:a.path, type:a.type, license:a.license ?? 'cc0', platform: a.platform ?? 'all', ...(a.children? { children: normalizeList(a.children) }: {}) }));
}

