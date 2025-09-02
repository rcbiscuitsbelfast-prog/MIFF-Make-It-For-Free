#!/usr/bin/env node
/*
  MIFF validate-bridge
  - Validates zone-router logic and bridge compatibility across Unity, Godot, Web
  - Checks fixtures and orchestration wiring for viewer compatibility
*/

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../../..');

function exists(p) { try { return fs.existsSync(p); } catch { return false; } }

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function validateSpiritTamer() {
  const base = path.join(WORKSPACE_ROOT, 'SpiritTamerDemoPure');
  const orchestration = path.join(base, 'orchestration.json');
  const manifest = path.join(base, 'release_manifest.json');
  const starter = path.join(base, 'start_grove.js');

  const issues = [];
  if (!exists(orchestration)) issues.push('Missing SpiritTamerDemoPure/orchestration.json');
  if (!exists(manifest)) issues.push('Missing SpiritTamerDemoPure/release_manifest.json');
  if (!exists(starter)) issues.push('Missing SpiritTamerDemoPure/start_grove.js');

  let orchestrationObj = null;
  let manifestObj = null;
  if (exists(orchestration)) {
    try { orchestrationObj = readJSON(orchestration); }
    catch (e) { issues.push(`Invalid orchestration.json: ${e.message}`); }
  }
  if (exists(manifest)) {
    try { manifestObj = readJSON(manifest); }
    catch (e) { issues.push(`Invalid release_manifest.json: ${e.message}`); }
  }

  // Minimal integrity checks
  if (orchestrationObj) {
    if (!Array.isArray(orchestrationObj.routes)) issues.push('orchestration.routes must be an array');
    if (!orchestrationObj.viewer || !orchestrationObj.viewer.type) issues.push('orchestration.viewer missing or invalid');
  }

  if (manifestObj) {
    if (!Array.isArray(manifestObj.assets)) issues.push('release_manifest.assets must be an array');
    const nonRemixSafe = (manifestObj.assets || []).filter(a => a.license && !/^(CC0|GPL|AGPL|Public Domain)$/i.test(a.license));
    if (nonRemixSafe.length) issues.push(`Non remix-safe assets detected: ${nonRemixSafe.map(a => a.id || a.path).join(', ')}`);
  }

  // Zone-router check in start_grove.js
  let routerOk = false;
  if (exists(starter)) {
    const src = fs.readFileSync(starter, 'utf8');
    routerOk = /function\s+startGrove\s*\(|const\s+startGrove\s*=/.test(src) && /module\.exports\s*=\s*{?\s*startGrove\s*:?/.test(src);
    if (!routerOk) issues.push('start_grove.js must export startGrove for zone-router');
  }

  const status = issues.length ? 'error' : 'ok';
  return { module: 'SpiritTamerDemoPure', status, issues };
}

function main() {
  const checks = [ validateSpiritTamer() ];
  const overall = checks.some(c => c.status === 'error') ? 'error' : 'ok';
  const report = { op: 'validate-bridge', status: overall, modules: checks, timestamp: new Date().toISOString() };
  console.log(JSON.stringify(report, null, 2));
  process.exit(overall === 'ok' ? 0 : 1);
}

if (require.main === module) {
  try { main(); } catch (e) {
    console.error(JSON.stringify({ op: 'validate-bridge', status: 'error', error: e.message }));
    process.exit(1);
  }
}

