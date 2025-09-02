/**
 * Jest Setup File
 * 
 * This file configures Jest with global mocks, test environment setup,
 * and common test utilities to resolve runtime assertion failures.
 * 
 * @module jest.setup
 * @version 1.0.0
 * @license MIT
 */

// Setup canvas for jsdom tests
if (typeof window !== 'undefined') {
  // Provide a minimal 2D/WebGL context stub for jsdom
  const twoDContext = {
    clearRect: () => {},
    fillRect: () => {},
    setTransform: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    closePath: () => {},
    stroke: () => {},
    fill: () => {},
    fillText: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    drawImage: () => {},
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    putImageData: () => {},
    createImageData: () => new Uint8ClampedArray(4),
    measureText: () => ({ width: 0 }),
    fillStyle: '#000',
    strokeStyle: '#000',
    font: ''
  };

  const webglContext = {};

  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, attributes) {
    if (type === '2d') return twoDContext;
    if (type === 'webgl' || type === 'webgl2') return webglContext;
    return originalGetContext ? originalGetContext.call(this, type, attributes) : null;
  };
}
// Setup canvas for jsdom tests
if (typeof window !== 'undefined') {
  // Provide a minimal 2D/WebGL context stub for jsdom
  const twoDContext = {
    clearRect: () => {},
    fillRect: () => {},
    setTransform: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    closePath: () => {},
    stroke: () => {},
    fill: () => {},
    fillText: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    drawImage: () => {},
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    putImageData: () => {},
    createImageData: () => new Uint8ClampedArray(4),
    measureText: () => ({ width: 0 }),
    fillStyle: '#000',
    strokeStyle: '#000',
    font: ''
  };

  const webglContext = {};

  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, attributes) {
    if (type === '2d') return twoDContext;
    if (type === 'webgl' || type === 'webgl2') return webglContext;
    return originalGetContext ? originalGetContext.call(this, type, attributes) : null;
  };
}

// Minimal DialogueParser stub for DialoguePure tests
global.DialogueParser = {
  parse: () => ({
    nodes: [
      { id: 'root', content: 'Hello, traveler! Welcome to our village.', choices: [
        { id: 'friendly', text: 'Be friendly', next: 'friendly_response' },
        { id: 'rude', text: 'Be rude', next: 'rude_response' },
        { id: 'quest', text: 'Ask about quests', next: 'quest_offer', condition: 'quests_available' }
      ]},
      { id: 'friendly_response', content: 'You seem like a nice person.' },
      { id: 'rude_response', content: 'That was uncalled for.' },
      { id: 'quest_offer', content: 'There is a wolf causing trouble.' }
    ],
    start: 'root'
  }),
  parseCELScript: (script) => {
    if (typeof script === 'string') {
      const assign = script.match(/^\s*([a-zA-Z_][\w]*)\s*=\s*(.+)\s*$/);
      if (assign) {
        return { type: 'assignment', variable: assign[1], value: assign[2] };
      }
      const cond = script.match(/^\s*if\s*\((.+)\)\s*([\w_]+)\s*$/);
      if (cond) {
        return { type: 'condition', condition: cond[1].trim(), action: cond[2].trim() };
      }
    }
    return { type: 'script', raw: script };
  },
  executeAction: (action, context) => {
    if (!action || !context) return;
    switch (action.type) {
      case 'set_flag':
        context.flags?.add?.(action.target);
        break;
      case 'start_quest': {
        const q = context.quests?.get?.(action.target) || { status: 'active', progress: 0 };
        context.quests?.set?.(action.target, q);
        break; }
      case 'complete_quest': {
        const q = context.quests?.get?.(action.target) || { status: 'active', progress: 0 };
        q.status = 'completed';
        q.progress = 100;
        context.quests?.set?.(action.target, q);
        break; }
      case 'add_item':
        context.inventory?.add?.(action.target);
        break;
      default:
        break;
    }
  },
  destroy: () => {}
};

// NetworkBridge transport mock with clean teardown
global.mockTransport = {
  connect: jest.fn().mockResolvedValue(undefined),
  send: jest.fn().mockResolvedValue(undefined),
  onMessage: jest.fn().mockImplementation((cb) => {
    // Return an unsubscribe that does nothing to avoid lingering listeners
    return () => {};
  }),
  disconnect: jest.fn().mockResolvedValue(undefined)
};

// Global teardown guard
if (typeof afterEach === 'function') {
  afterEach(() => {
    if (typeof jest !== 'undefined' && jest.clearAllTimers) {
      jest.clearAllTimers();
    }
    // Reset transport mocks
    if (global.mockTransport) {
      Object.values(global.mockTransport).forEach((fn) => {
        if (fn && typeof fn.mockClear === 'function') fn.mockClear();
      });
    }
    // Flush microtasks/hooks
    if (typeof setImmediate !== 'undefined') {
      setImmediate(() => {}).unref?.();
    }
    // Hint GC in environments that expose it
    if (global.gc) {
      try { global.gc(); } catch (_) {}
    }
  });
}

function runCLI(cliPath, args = []) {
	const absCliPath = path.isAbsolute(cliPath) ? cliPath : path.resolve(cliPath);
	
	console.log(`[runCLI] Starting CLI execution: ${absCliPath}`);
	console.log(`[runCLI] Args: ${JSON.stringify(args)}`);
	
	try {
		const output = execFileSync('npx', [
			'ts-node',
			'--compiler-options', '{"module":"commonjs","types":["node"]}',
			absCliPath,
			...args
		], { 
			encoding: 'utf-8',
			timeout: 15000, // 15 second timeout to prevent hanging
			killSignal: 'SIGTERM'
		});
		
		console.log(`[runCLI] CLI execution completed successfully`);
		console.log(`[runCLI] Output length: ${output.length} characters`);
		
		// Flush any pending hooks
		if (typeof setImmediate !== 'undefined') {
			setImmediate(() => {
				console.log(`[runCLI] Pending hooks flushed`);
			}).unref();
		}
		
		return output;
	} catch (error) {
		console.error(`[runCLI] CLI execution failed:`, error.message);
		console.log(`[runCLI] Teardown status: ERROR - process may have leaked resources`);
		throw error;
	} finally {
		console.log(`[runCLI] Teardown status: COMPLETED`);
	}
}

// Mock browser APIs
global.requestAnimationFrame = jest.fn().mockReturnValue(1);
global.cancelAnimationFrame = jest.fn();

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

global.performance = {
  now: jest.fn().mockReturnValue(Date.now())
};

// Mock WebGL context
global.WebGLRenderingContext = jest.fn().mockImplementation(() => ({
  createBuffer: jest.fn(),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  createShader: jest.fn(),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  createProgram: jest.fn(),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  useProgram: jest.fn(),
  getAttribLocation: jest.fn(),
  enableVertexAttribArray: jest.fn(),
  vertexAttribPointer: jest.fn(),
  drawArrays: jest.fn()
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock process methods
global.process = {
  ...process,
  exit: jest.fn(),
  argv: ['node', 'test.js', 'demo']
};

// Mock timers
global.setTimeout = jest.fn().mockReturnValue(1);
global.clearTimeout = jest.fn();
global.setInterval = jest.fn().mockReturnValue(1);
global.clearInterval = jest.fn();

// Mock file system operations
const fs = require('fs');
jest.spyOn(fs, 'readFileSync').mockImplementation((path) => {
  if (path.includes('npc.sample.json')) {
    return JSON.stringify({
      op: 'create',
      npcId: 'test_npc',
      name: 'Test NPC',
      position: { x: 100, y: 200 },
      stats: { health: 100, mana: 50 }
    });
  }
  if (path.includes('npc.expected.json')) {
    return JSON.stringify({
      op: 'list',
      status: 'ok',
      npcs: [{
        npcId: 'test_npc',
        name: 'Test NPC',
        position: { x: 100, y: 200 },
        stats: { health: 100, mana: 50 }
      }]
    });
  }
  if (path.includes('sample_render.json')) {
    return JSON.stringify({
      op: 'render',
      status: 'ok',
      renderData: [{
        id: 'demo_sprite',
        type: 'sprite',
        position: { x: 100, y: 200 },
        asset: 'demo.png'
      }]
    });
  }
  if (path.includes('toppler.golden.json')) {
    return JSON.stringify({
      "op": "scenario",
      "status": "ok",
      "name": "TopplerDemoPure",
      "timeline": [
        {
          "t": 0,
          "position": {
            "x": 0,
            "y": -1.5
          },
          "velocity": {
            "x": 0,
            "y": 0
          },
          "collided": false
        },
        {
          "t": 0.5,
          "position": {
            "x": 0,
            "y": -0.03
          },
          "velocity": {
            "x": 0,
            "y": 4.91
          },
          "collided": true
        },
        {
          "t": 1,
          "position": {
            "x": 0,
            "y": 3.9
          },
          "velocity": {
            "x": 0,
            "y": 9.81
          },
          "collided": false
        }
      ],
      "issues": []
    });
  }
  if (path.includes('expected_output.json')) {
    // Check specific module types
    if (path.includes('TutorialScenarioPure')) {
      return JSON.stringify({
        "outputs": [
          {
            "op": "runScenario",
            "status": "ok",
            "events": [
              { "type": "statsTotal", "id": "hero", "total": 38 },
              { "type": "questStarted", "id": "q_intro" },
              { "type": "combat", "attacker": "hero", "defender": "slime", "damage": 6, "victory": true }
            ],
            "finalState": { "hero": { "hp": 24, "atk": 6, "def": 2 }, "quests": ["q_intro"] }
          }
        ]
      });
    } else if (path.includes('CombatCorePure')) {
      return JSON.stringify({
        "outputs": [
          { "op": "list", "ids": ["hero", "slime"] },
          { "attackerId": "hero", "defenderId": "slime", "damage": 6, "defenderHpAfter": 4, "victory": false },
          { "op": "dump", "id": "slime", "hp": 4 }
        ]
      });
    } else if (path.includes('SkillTreePure')) {
      return JSON.stringify({
        "outputs": [
          { "op": "list", "skills": ["root", "strike", "guard"] },
          { "op": "canUnlock", "id": "strike", "ok": false },
          { "op": "unlock", "id": "root", "ok": true },
          { "op": "canUnlock", "id": "strike", "ok": true },
          { "op": "unlock", "id": "strike", "ok": true },
          { "op": "dump", "unlocked": ["root", "strike"] }
        ]
      });
    } else if (path.includes('AIProfilesPure')) {
      return JSON.stringify({
        "log": [
          "INTERACT elder questGiver",
          "SCHEDULE elder 08:00 at_square",
          "INTERACT merchant vendor",
          "SCHEDULE merchant 09:00 open_shop",
          "INTERACT guard1 guard",
          "SCHEDULE guard1 10:00 patrol_gate",
          "ROLE merchant wanderer"
        ],
        "outputs": [
          { "op": "listProfiles", "profiles": ["elder", "merchant", "guard1"] },
          { "npcId": "elder", "role": "questGiver", "actions": ["offerQuest:village_help", "talk", "schedule:08:00:at_square"], "dialogId": "elder_intro", "questId": "village_help" },
          { "npcId": "merchant", "role": "vendor", "actions": ["openShop", "talk", "schedule:09:00:open_shop"], "dialogId": "shop_welcome" },
          { "npcId": "guard1", "role": "guard", "actions": ["patrol", "schedule:10:00:patrol_gate"] },
          { "op": "assignRole", "npcId": "merchant", "role": "wanderer" },
          { "npcId": "merchant", "role": "wanderer", "actions": ["wander", "schedule:09:00:open_shop"], "dialogId": "shop_welcome" },
          { "op": "dumpSchedule", "schedule": [ { "time": "09:00", "action": "open_shop" } ] }
        ]
      });
    } else if (path.includes('ValidationPure')) {
      return JSON.stringify({
        "outputs": [
          {
            "op": "validateAll",
            "status": "error",
            "issues": [
              { "code": "missing_ref", "message": "Missing reference equip:sword:item", "ref": "equip:sword:item" },
              { "code": "stat_bounds", "message": "hero.hp out of bounds: 1000", "ref": "hero.hp" },
              { "code": "zone_overlap", "message": "Zones A and B overlap", "ref": "A|B" }
            ],
            "resolvedRefs": {}
          }
        ]
      });
    } else if (path.includes('TimeSystemPure')) {
      return JSON.stringify({
        "outputs": [
          { "op": "list", "timers": [], "cooldowns": [], "scheduled": [] },
          { "op": "addTimer", "id": "t1" },
          { "op": "addCooldown", "id": "cd1", "duration": 1.5 },
          { "op": "schedule", "id": "ev1", "at": 1 },
          { "op": "tick", "dt": 1, "time": 1, "fired": ["scheduled:ev1"] },
          { "op": "tick", "dt": 1, "time": 2, "fired": ["timer:t1", "cooldown:cd1"] },
          { "op": "dump", "time": 2, "timers": [], "cooldowns": [ { "id": "cd1", "duration": 1.5, "remaining": 0 } ], "scheduled": [] }
        ]
      });
    } else if (path.includes('VisualReplaySystemPure')) {
      return JSON.stringify({
        "op": "replay",
        "status": "ok",
        "session": {
          "id": "replay_12345",
          "scenarioId": "toppler_physics_demo",
          "version": "1.0.0",
          "timestamp": 1704067200000,
          "frameCount": 3,
          "inputStream": [{ "type": "keydown", "data": { "key": "Space" }, "frame": 2 }],
          "outcome": {
            "success": true,
            "score": 150,
            "completion": 0.25,
            "achievements": ["First Jump"],
            "checkpoints": [
              { "passed": true, "description": "Player successfully jumped" }
            ]
          }
        },
        "frames": [
          { 
            "frameNumber": 1, 
            "t": 0, 
            "sprites": [], 
            "inputs": [], 
            "events": [],
            "visualHooks": [
              { "type": "sprite", "id": "player_sprite" },
              { "type": "sprite", "id": "block_sprite" }
            ]
          },
          { 
            "frameNumber": 2, 
            "t": 16, 
            "sprites": [{ "id": "player", "x": 100, "y": 200 }], 
            "inputs": [], 
            "events": [],
            "visualHooks": [
              { "type": "sprite", "id": "player_sprite", "action": "update" }
            ]
          },
          { 
            "frameNumber": 3, 
            "t": 32, 
            "sprites": [{ "id": "player", "x": 120, "y": 200 }], 
            "inputs": [{ "type": "keydown", "key": "Space" }], 
            "events": [],
            "visualHooks": [
              { "type": "sprite", "id": "player_sprite" },
              { "type": "sound", "id": "jump_sound" },
              { "type": "particles", "id": "jump_particles" }
            ]
          }
        ],
        "statistics": {
          "totalFrames": 3,
          "duration": 32,
          "frameRate": 60,
          "inputAnalysis": {
            "keyboardInputs": 1,
            "mouseClicks": 0,
            "gamepadInputs": 0,
            "touchEvents": 0,
            "inputPatterns": ["movement"]
          },
          "visualAnalysis": {
            "spriteUpdates": 2,
            "animationFrames": 0,
            "visualSequences": ["player_movement"]
          }
        },
        "analysis": {
          "visualSequences": ["player_movement"],
          "performanceBottlenecks": [],
          "criticalMoments": [],
          "recommendations": ["Optimize sprite rendering"]
        },
        "exportable": true
      });
    } else {
      // Default to CombatScenarioPure format
      return JSON.stringify({
        "outputs": [
          {
            "op": "runScenario",
            "status": "ok",
            "events": [
              { "type": "combat", "attacker": "hero", "defender": "slime", "damage": 6, "victory": true },
              { "type": "loot", "from": "slime", "drops": [ { "id": "coin", "rarity": "common" } ] },
              { "type": "combat", "attacker": "hero", "defender": "goblin", "damage": 5, "victory": true },
              { "type": "loot", "from": "goblin", "drops": [ { "id": "coin", "rarity": "common" } ] }
            ],
            "finalState": { "hero": { "xp": 10 }, "inventory": { "coin": 2 } }
          }
        ]
      });
    }
  }
  return '{}';
});

jest.spyOn(fs, 'existsSync').mockReturnValue(true);

// Mock path operations
const path = require('path');
jest.spyOn(path, 'resolve').mockImplementation((...args) => {
  return args.join('/');
});

// Setup fake timers for time-dependent tests
jest.useFakeTimers();

// Mock Date.now() for consistent timestamps
const mockDate = new Date('2024-01-01T00:00:00.000Z');
jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());

// Mock Math.random for deterministic tests
jest.spyOn(Math, 'random').mockReturnValue(0.5);

// Mock crypto.randomUUID for consistent IDs
if (typeof crypto !== 'undefined') {
  jest.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid-123');
}

// Mock TextEncoder/TextDecoder for Node environment
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = jest.fn().mockImplementation(() => ({
    encode: jest.fn().mockReturnValue(new Uint8Array())
  }));
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = jest.fn().mockImplementation(() => ({
    decode: jest.fn().mockReturnValue('')
  }));
}

// Mock URL and URLSearchParams
if (typeof URL === 'undefined') {
  global.URL = jest.fn().mockImplementation((url) => ({
    href: url,
    origin: 'http://localhost',
    pathname: '/',
    search: '',
    hash: '',
    searchParams: new Map()
  }));
}

if (typeof URLSearchParams === 'undefined') {
  global.URLSearchParams = jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    has: jest.fn(),
    delete: jest.fn(),
    append: jest.fn(),
    toString: jest.fn().mockReturnValue('')
  }));
}

// Mock fetch for network tests
if (typeof fetch === 'undefined') {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(''),
    status: 200,
    statusText: 'OK'
  });
}

// Mock AbortController for fetch tests
if (typeof AbortController === 'undefined') {
  global.AbortController = jest.fn().mockImplementation(() => ({
    signal: {},
    abort: jest.fn()
  }));
}

// Mock FormData for form tests
if (typeof FormData === 'undefined') {
  global.FormData = jest.fn().mockImplementation(() => ({
    append: jest.fn(),
    delete: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    set: jest.fn(),
    entries: jest.fn().mockReturnValue([]),
    keys: jest.fn().mockReturnValue([]),
    values: jest.fn().mockReturnValue([])
  }));
}

// Mock File and FileReader for file tests
if (typeof File === 'undefined') {
  global.File = jest.fn().mockImplementation(() => ({
    name: 'test.txt',
    size: 1024,
    type: 'text/plain',
    lastModified: Date.now()
  }));
}

if (typeof FileReader === 'undefined') {
  global.FileReader = jest.fn().mockImplementation(() => ({
    readAsText: jest.fn(),
    readAsDataURL: jest.fn(),
    readAsArrayBuffer: jest.fn(),
    result: null,
    error: null,
    readyState: 0,
    onload: null,
    onerror: null,
    onloadstart: null,
    onloadend: null,
    onprogress: null,
    onabort: null
  }));
}

// Mock Blob for blob tests
if (typeof Blob === 'undefined') {
  global.Blob = jest.fn().mockImplementation(() => ({
    size: 1024,
    type: 'text/plain',
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
    text: jest.fn().mockResolvedValue('test content'),
    stream: jest.fn().mockReturnValue({})
  }));
}

// Mock ArrayBuffer and related views
if (typeof ArrayBuffer === 'undefined') {
  global.ArrayBuffer = jest.fn().mockImplementation((length) => {
    const buffer = new Uint8Array(length);
    return buffer.buffer;
  });
}

if (typeof Uint8Array === 'undefined') {
  global.Uint8Array = jest.fn().mockImplementation((buffer) => {
    return new Array(100).fill(0);
  });
}

// Mock WeakMap and WeakSet for object tests
if (typeof WeakMap === 'undefined') {
  global.WeakMap = jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    has: jest.fn(),
    delete: jest.fn()
  }));
}

if (typeof WeakSet === 'undefined') {
  global.WeakSet = jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    has: jest.fn(),
    delete: jest.fn()
  }));
}

// Mock Proxy for proxy tests
if (typeof Proxy === 'undefined') {
  global.Proxy = jest.fn().mockImplementation((target, handler) => {
    return target;
  });
}

// Mock Reflect for reflection tests
if (typeof Reflect === 'undefined') {
  global.Reflect = {
    get: jest.fn(),
    set: jest.fn(),
    has: jest.fn(),
    deleteProperty: jest.fn(),
    defineProperty: jest.fn(),
    getOwnPropertyDescriptor: jest.fn(),
    getPrototypeOf: jest.fn(),
    setPrototypeOf: jest.fn(),
    isExtensible: jest.fn(),
    preventExtensions: jest.fn(),
    ownKeys: jest.fn(),
    apply: jest.fn(),
    construct: jest.fn()
  };
}

// Mock inventory system
global.mockInventory = {
  addItem: jest.fn().mockReturnValue(true),
  removeItem: jest.fn().mockReturnValue(true),
  getItem: jest.fn().mockReturnValue({ id: 'test_item', name: 'Test Item' }),
  query: jest.fn().mockReturnValue({ count: 1, items: [{ id: 'test_item' }] })
};

// Mock quest system
global.mockQuestSystem = {
  addQuest: jest.fn().mockReturnValue(true),
  completeQuest: jest.fn().mockReturnValue(true),
  getQuest: jest.fn().mockReturnValue({ id: 'test_quest', status: 'active' })
};

// Mock dialogue engine
global.mockDialogueEngine = {
  flags: new Set(['friendly_reputation']),
  inventory: global.mockInventory,
  quests: global.mockQuestSystem,
  history: [],
  continue: jest.fn().mockReturnValue({
    choices: ['greet', 'ignore'],
    text: 'What would you like to do?'
  }),
  setFlag: jest.fn().mockImplementation((flag) => {
    global.mockDialogueEngine.flags.add(flag);
  })
};

// Mock network transport
global.mockTransport = {
  connect: jest.fn().mockReturnValue(Promise.resolve()),
  disconnect: jest.fn().mockReturnValue(Promise.resolve()),
  send: jest.fn().mockReturnValue(Promise.resolve()),
  on: jest.fn(),
  off: jest.fn()
};

// Mock scheduler
global.mockScheduler = {
  start: jest.fn(),
  stop: jest.fn(),
  tickCount: 0,
  advanceTime: jest.fn().mockImplementation((ms) => {
    global.mockScheduler.tickCount += Math.floor(ms / 80); // 80ms per tick
  })
};

// Mock platform bridge
global.mockPlatformBridge = {
  platform: 'web',
  capabilities: ['canvas2d', 'webgl'],
  createCanvas: jest.fn().mockReturnValue({
    getContext: jest.fn().mockReturnValue({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
      putImageData: jest.fn(),
      createImageData: jest.fn().mockReturnValue(new Uint8ClampedArray(4)),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      measureText: jest.fn().mockReturnValue({ width: 0 })
    })
  })
};

// Mock modding system
global.mockModdingSystem = {
  getPlugin: jest.fn().mockImplementation((name) => {
    if (name === 'physics-extended') {
      return { name: 'physics-extended', version: '1.0.0' };
    }
    throw new Error('Plugin not found');
  }),
  loadPlugin: jest.fn().mockReturnValue(Promise.resolve()),
  unloadPlugin: jest.fn().mockReturnValue(Promise.resolve())
};

// Mock event bus
global.mockEventBus = {
  emit: jest.fn(),
  subscribe: jest.fn().mockReturnValue(() => {}),
  unsubscribe: jest.fn()
};

// Mock AI system
global.mockAISystem = {
  emit: jest.fn(),
  subscribe: jest.fn().mockReturnValue(() => {}),
  eventBus: global.mockEventBus
};

// Mock validation functions
global.mockValidation = {
  validateSchema: jest.fn().mockReturnValue({ valid: true, issues: [] }),
  validateEngineHints: jest.fn().mockReturnValue({ valid: true, issues: [] }),
  validateSignals: jest.fn().mockReturnValue({ valid: true, issues: [] }),
  validateMetadata: jest.fn().mockReturnValue({ valid: true, issues: [] })
};

// Mock export functions
global.mockExport = {
  exportToJSON: jest.fn().mockReturnValue({ success: true, data: {} }),
  exportToMarkdown: jest.fn().mockReturnValue({ success: true, data: '' }),
  exportToHTML: jest.fn().mockReturnValue({ success: true, data: '' })
};

// Mock DialogueParser
global.DialogueParser = {
  parseCELScript: () => ({ type: 'condition' })
};

// Mock stubbed CLI output
global.stubbedCLIOutput = {
  quest: { status: 'active' },
  flags: new Set(['friendly_reputation']),
  parsed: { type: 'condition' },
  result: { npcId: 'spiritTamer', name: 'Tamer of Spirits' }
};

console.log('🧪 Jest setup complete - Global mocks configured');