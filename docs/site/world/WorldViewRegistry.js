// MIFF World View Registry — genre coverage for camera/movement/map types

const worldViews = {
  topdown: { camera: 'follow', movement: 'free', mapType: 'grid' },
  sidescroll: { camera: 'horizontal', movement: 'platform', mapType: 'layered' },
  runner: { camera: 'auto-scroll', movement: 'forward-only', mapType: 'segments' },
  isometric: { camera: 'angled', movement: 'grid-diagonal', mapType: 'iso-grid' },
  firstperson: { camera: 'fps', movement: 'free', mapType: 'raycast' },
  thirdperson: { camera: 'chase', movement: '3D', mapType: 'navmesh' },
  pointclick: { camera: 'static', movement: 'hotspot', mapType: 'scene' },
  overworld: { camera: 'zoomed', movement: 'node-jump', mapType: 'graph' }
};

function getWorldView(type){ return worldViews[type] || worldViews.topdown; }

try { window.miffWorldView = { get: getWorldView }; } catch {}

export { getWorldView };

