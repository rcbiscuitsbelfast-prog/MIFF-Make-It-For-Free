// Global type declarations for MIFF Sampler
// This file extends the global Window interface with custom properties

declare global {
  interface Window {
    overlinkZone: {
      activateTheme: (theme: string) => void;
      getAudioPlaybackState: () => { isPlaying: boolean; currentTheme: string | null };
      getBadgePreview: () => string;
    };
  }
}

// This export is required for TypeScript to treat this as a module
export {};