// DebugOverlayPure - Real-time debug overlay for MIFF engine bridges
// Re-export everything from Manager for backward compatibility

export { DebugOverlayManager } from './Manager';
export * from './Manager';

// Default export for compatibility
export { DebugOverlayManager as default } from './Manager';