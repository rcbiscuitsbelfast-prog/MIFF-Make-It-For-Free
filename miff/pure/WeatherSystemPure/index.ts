/**
 * WeatherSystemPure - Weather Management System
 * 
 * Advanced weather simulation with dynamic patterns, effects,
 * and integration with game systems.
 */

// Re-export all types and classes from Manager
export * from './Manager';
export { WeatherSystemManager as default } from './Manager';

// Export core weather types for direct access
export type { WeatherType, WeatherIntensity, WeatherEffect, WeatherState, WeatherPattern } from './Manager';
