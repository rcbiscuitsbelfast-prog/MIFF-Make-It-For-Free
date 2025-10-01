/**
 * WeatherSystemPure - Weather Management System
 * 
 * Advanced weather simulation with dynamic patterns, effects,
 * and integration with game systems.
 */

// Re-export all types and classes from Manager
export * from './Manager';
export { WeatherManagerPure as default, WeatherManagerPure as WeatherSystemManager } from './Manager';

// Export core weather types for direct access
export type { WeatherType, WeatherIntensity, WeatherEffect, WeatherState, WeatherPattern } from './Manager';
