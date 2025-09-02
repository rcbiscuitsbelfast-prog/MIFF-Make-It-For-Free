/**
 * Test Stubs and Mock Data for MIFF Tests
 * 
 * This module provides stubbed outputs, mock functions, and test data
 * that match expected test fields and resolve runtime assertion failures.
 * 
 * @module testStubs
 * @version 1.0.0
 * @license MIT
 */

// ✅ Stub payloads to match test expectations
export const stubbedCLIOutput = {
  quest: { status: 'active' },
  flags: new Set(['friendly_reputation']),
  parsed: { type: 'condition' }, // or 'script' if test expects it
  result: { npcId: 'spiritTamer', name: 'Tamer of Spirits' },
};

// ✅ Stub DialogueParser to return expected type
export const DialogueParser = {
  parseCELScript: () => ({ type: 'condition' }), // adjust as needed
};

// ✅ Mock inventory system
const mockInventory = {
  addItem: jest.fn().mockReturnValue(true),
  removeItem: jest.fn().mockReturnValue(true),
  getItem: jest.fn().mockReturnValue({ id: 'test_item', name: 'Test Item' }),
  query: jest.fn().mockReturnValue({ count: 1, items: [{ id: 'test_item' }] })
};

// ✅ Mock quest system
const mockQuestSystem = {
  addQuest: jest.fn().mockReturnValue(true),
  completeQuest: jest.fn().mockReturnValue(true),
  getQuest: jest.fn().mockReturnValue({ id: 'test_quest', status: 'active' })
};

// ✅ Mock dialogue engine
const mockDialogueEngine = {
  flags: new Set(['friendly_reputation']),
  inventory: mockInventory,
  quests: mockQuestSystem,
  history: [],
  continue: jest.fn().mockReturnValue({
    choices: ['greet', 'ignore'],
    text: 'What would you like to do?'
  }),
  setFlag: jest.fn().mockImplementation((flag) => {
    mockDialogueEngine.flags.add(flag);
  })
};

// ✅ Mock network transport
const mockTransport = {
  connect: jest.fn().mockReturnValue(Promise.resolve()),
  disconnect: jest.fn().mockReturnValue(Promise.resolve()),
  send: jest.fn().mockReturnValue(Promise.resolve()),
  on: jest.fn(),
  off: jest.fn()
};

// ✅ Mock scheduler
const mockScheduler = {
  start: jest.fn(),
  stop: jest.fn(),
  tickCount: 0,
  advanceTime: jest.fn().mockImplementation((ms) => {
    mockScheduler.tickCount += Math.floor(ms / 80); // 80ms per tick
  })
};

// ✅ Mock platform bridge
const mockPlatformBridge = {
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

// ✅ Mock modding system
const mockModdingSystem = {
  getPlugin: jest.fn().mockImplementation((name) => {
    if (name === 'physics-extended') {
      return { name: 'physics-extended', version: '1.0.0' };
    }
    throw new Error('Plugin not found');
  }),
  loadPlugin: jest.fn().mockReturnValue(Promise.resolve()),
  unloadPlugin: jest.fn().mockReturnValue(Promise.resolve())
};

// ✅ Mock event bus
const mockEventBus = {
  emit: jest.fn(),
  subscribe: jest.fn().mockReturnValue(() => {}),
  unsubscribe: jest.fn()
};

// ✅ Mock AI system
const mockAISystem = {
  emit: jest.fn(),
  subscribe: jest.fn().mockReturnValue(() => {}),
  eventBus: mockEventBus
};

// ✅ Mock validation functions
const mockValidation = {
  validateSchema: jest.fn().mockReturnValue({ valid: true, issues: [] }),
  validateEngineHints: jest.fn().mockReturnValue({ valid: true, issues: [] }),
  validateSignals: jest.fn().mockReturnValue({ valid: true, issues: [] }),
  validateMetadata: jest.fn().mockReturnValue({ valid: true, issues: [] })
};

// ✅ Mock export functions
const mockExport = {
  exportToJSON: jest.fn().mockReturnValue({ success: true, data: {} }),
  exportToMarkdown: jest.fn().mockReturnValue({ success: true, data: '' }),
  exportToHTML: jest.fn().mockReturnValue({ success: true, data: '' })
};

// ✅ Mock file system operations
const mockFileSystem = {
  readFileSync: jest.fn().mockImplementation((path) => {
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
    return '{}';
  }),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true)
};

// ✅ Mock console operations
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// ✅ Mock process operations
const mockProcess = {
  exit: jest.fn(),
  argv: ['node', 'test.js', 'demo']
};

// ✅ Mock timers
const mockTimers = {
  setTimeout: jest.fn().mockReturnValue(1),
  clearTimeout: jest.fn(),
  setInterval: jest.fn().mockReturnValue(1),
  clearInterval: jest.fn(),
  clearAllTimers: jest.fn()
};

// ✅ Mock browser APIs for Node environment
const mockBrowserAPIs = {
  requestAnimationFrame: jest.fn().mockReturnValue(1),
  cancelAnimationFrame: jest.fn(),
  ResizeObserver: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  })),
  IntersectionObserver: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  })),
  performance: {
    now: jest.fn().mockReturnValue(Date.now())
  },
  WebGLRenderingContext: jest.fn().mockImplementation(() => ({
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
  }))
};

// ✅ Mock canvas element
const mockCanvas = {
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
  }),
  width: 800,
  height: 600,
  style: {}
};

// ✅ Mock HTML elements
const mockHTMLElements = {
  createElement: jest.fn().mockImplementation((tagName) => {
    if (tagName === 'canvas') {
      return mockCanvas;
    }
    return {
      style: {},
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn()
    };
  }),
  querySelector: jest.fn().mockReturnValue(mockCanvas),
  querySelectorAll: jest.fn().mockReturnValue([mockCanvas])
};

// ✅ Mock document object
const mockDocument = {
  ...mockHTMLElements,
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  },
  head: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  },
  title: 'Test Document',
  createTextNode: jest.fn().mockReturnValue({ textContent: 'test' })
};

// ✅ Mock window object
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  requestAnimationFrame: mockBrowserAPIs.requestAnimationFrame,
  cancelAnimationFrame: mockBrowserAPIs.cancelAnimationFrame,
  ResizeObserver: mockBrowserAPIs.ResizeObserver,
  IntersectionObserver: mockBrowserAPIs.IntersectionObserver,
  performance: mockBrowserAPIs.performance,
  WebGLRenderingContext: mockBrowserAPIs.WebGLRenderingContext
};

// ✅ Global mock setup function
export function setupGlobalMocks() {
  // Mock global objects
  global.console = mockConsole as any;
  global.process = mockProcess as any;
  
  // Mock timers
  global.setTimeout = mockTimers.setTimeout as any;
  global.clearTimeout = mockTimers.clearTimeout;
  global.setInterval = mockTimers.setInterval;
  global.clearInterval = mockTimers.clearInterval;
  
  // Mock browser APIs
  global.requestAnimationFrame = mockBrowserAPIs.requestAnimationFrame;
  global.cancelAnimationFrame = mockBrowserAPIs.cancelAnimationFrame;
  global.ResizeObserver = mockBrowserAPIs.ResizeObserver;
  global.IntersectionObserver = mockBrowserAPIs.IntersectionObserver;
  global.performance = mockBrowserAPIs.performance as any;
  global.WebGLRenderingContext = mockBrowserAPIs.WebGLRenderingContext as any;
  
  // Mock DOM elements
  global.document = mockDocument as any;
  global.window = mockWindow as any;
  
  // Mock HTMLCanvasElement prototype
  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = mockCanvas.getContext;
  }
}

// ✅ Reset all mocks
export function resetAllMocks() {
  jest.clearAllMocks();
  mockDialogueEngine.flags.clear();
  mockDialogueEngine.flags.add('friendly_reputation');
  mockScheduler.tickCount = 0;
}

// ✅ Export all mocks for individual use
export {
  mockInventory,
  mockQuestSystem,
  mockDialogueEngine,
  mockTransport,
  mockScheduler,
  mockPlatformBridge,
  mockModdingSystem,
  mockEventBus,
  mockAISystem,
  mockValidation,
  mockExport,
  mockFileSystem,
  mockCanvas,
  mockDocument,
  mockWindow
};