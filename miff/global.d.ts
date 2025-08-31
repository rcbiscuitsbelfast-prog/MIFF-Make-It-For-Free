// Global type declarations for MIFF Sampler
// This file extends the global Window interface with custom properties

declare global {
  interface Window {
    overlinkZone: {
      // Core identification
      id: string;
      
      // Core functionality
      mount: (container: HTMLElement) => void;
      unmount: () => void;
      
      // Theme management
      activateTheme: (theme: string) => void;
      getCurrentTheme: () => string;
      
      // Audio management
      getAudioPlaybackState: () => { isPlaying: boolean; currentTheme: string | null };
      setAudioVolume: (volume: number) => void;
      
      // Badge system
      getBadgePreview: () => string;
      getContributorBadges: (contributorId: string) => any[];
      
      // Remix safety
      isRemixSafe: () => boolean;
      getRemixMetadata: () => any;
      
      // Zone management
      getCurrentZone: () => string;
      switchZone: (zoneId: string) => boolean;
      
      // Debug and development
      enableDebugMode: () => void;
      disableDebugMode: () => void;
      getDebugState: () => any;
    };
  }
}

// This export is required for TypeScript to treat this as a module
export {};