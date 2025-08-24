/**
 * TopplerUI - User interface component for MIFF Toppler demo
 * 
 * Features:
 * - Retry button and progress meter
 * - Remixable styling and layout
 * - Theme-aware UI elements
 * - Mobile-first responsive design
 * - Remix-safe architecture with no hardcoded dependencies
 */

import React, { useState, useEffect } from 'react';

export interface UITheme {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
}

export interface UIState {
    isPlaying: boolean;
    isWon: boolean;
    isFailed: boolean;
    currentHeight: number;
    maxHeight: number;
    attempts: number;
    timeElapsed: number;
    theme: string;
}

export interface UIProps {
    state: UIState;
    onRetry: () => void;
    onThemeChange: (theme: string) => void;
    onRemixModeToggle: () => void;
    remixMode: boolean;
    className?: string;
}

export const TopplerUI: React.FC<UIProps> = ({
    state,
    onRetry,
    onThemeChange,
    onRemixModeToggle,
    remixMode,
    className = ''
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const [localTheme, setLocalTheme] = useState(state.theme);

    const themes: Record<string, UITheme> = {
        classic: {
            primary: '#4ECDC4',
            secondary: '#45B7D1',
            accent: '#FFEAA7',
            background: 'rgba(255, 255, 255, 0.1)',
            text: '#ffffff',
            border: '#4ECDC4'
        },
        forest: {
            primary: '#228B22',
            secondary: '#32CD32',
            accent: '#8B4513',
            background: 'rgba(34, 139, 34, 0.2)',
            text: '#ffffff',
            border: '#228B22'
        },
        ruins: {
            primary: '#A0522D',
            secondary: '#CD853F',
            accent: '#696969',
            background: 'rgba(160, 82, 45, 0.2)',
            text: '#ffffff',
            border: '#A0522D'
        },
        neon: {
            primary: '#FF00FF',
            secondary: '#00FFFF',
            accent: '#FFFF00',
            background: 'rgba(255, 0, 255, 0.2)',
            text: '#ffffff',
            border: '#FF00FF'
        }
    };

    const currentTheme = themes[localTheme] || themes.classic;

    useEffect(() => {
        setLocalTheme(state.theme);
    }, [state.theme]);

    const handleThemeChange = (theme: string) => {
        setLocalTheme(theme);
        onThemeChange(theme);
    };

    const formatTime = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = (): number => {
        const targetHeight = 800; // Win height
        return Math.min((state.currentHeight / targetHeight) * 100, 100);
    };

    const getStatusMessage = (): string => {
        if (state.isWon) return '🎉 You reached the top!';
        if (state.isFailed) return '💥 Try again!';
        return '🧱 Climb to the top!';
    };

    const getStatusColor = (): string => {
        if (state.isWon) return '#00ff00';
        if (state.isFailed) return '#ff0000';
        return currentTheme.accent;
    };

    return (
        <div className={`toppler-ui ${className}`} style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            pointerEvents: 'none'
        }}>
            {/* Main UI Container */}
            <div style={{
                padding: '20px',
                pointerEvents: 'auto'
            }}>
                {/* Top Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    {/* Game Title */}
                    <div style={{
                        color: currentTheme.text,
                        fontSize: '24px',
                        fontWeight: 'bold'
                    }}>
                        🧱 Toppler
                    </div>

                    {/* Settings Button */}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        style={{
                            background: currentTheme.background,
                            border: `2px solid ${currentTheme.border}`,
                            color: currentTheme.text,
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        ⚙️ Settings
                    </button>
                </div>

                {/* Progress Section */}
                <div style={{
                    background: currentTheme.background,
                    border: `2px solid ${currentTheme.border}`,
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px'
                }}>
                    {/* Progress Bar */}
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                        }}>
                            <span style={{ color: currentTheme.text, fontSize: '14px' }}>Progress</span>
                            <span style={{ color: currentTheme.text, fontSize: '14px' }}>
                                {Math.round(getProgressPercentage())}%
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '20px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '10px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${getProgressPercentage()}%`,
                                height: '100%',
                                background: currentTheme.primary,
                                borderRadius: '10px',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '15px'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: currentTheme.text, fontSize: '12px', marginBottom: '4px' }}>
                                Current Height
                            </div>
                            <div style={{ color: currentTheme.accent, fontSize: '18px', fontWeight: 'bold' }}>
                                {Math.round(state.currentHeight)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: currentTheme.text, fontSize: '12px', marginBottom: '4px' }}>
                                Max Height
                            </div>
                            <div style={{ color: currentTheme.accent, fontSize: '18px', fontWeight: 'bold' }}>
                                {Math.round(state.maxHeight)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: currentTheme.text, fontSize: '12px', marginBottom: '4px' }}>
                                Attempts
                            </div>
                            <div style={{ color: currentTheme.accent, fontSize: '18px', fontWeight: 'bold' }}>
                                {state.attempts}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: currentTheme.text, fontSize: '12px', marginBottom: '4px' }}>
                                Time
                            </div>
                            <div style={{ color: currentTheme.accent, fontSize: '18px', fontWeight: 'bold' }}>
                                {formatTime(state.timeElapsed)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Message */}
                <div style={{
                    background: currentTheme.background,
                    border: `2px solid ${getStatusColor()}`,
                    borderRadius: '12px',
                    padding: '15px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        color: getStatusColor(),
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }}>
                        {getStatusMessage()}
                    </div>
                </div>

                {/* Action Buttons */}
                {(state.isWon || state.isFailed) && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '15px'
                    }}>
                        <button
                            onClick={onRetry}
                            style={{
                                background: currentTheme.primary,
                                border: 'none',
                                color: '#ffffff',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            {state.isWon ? '🎮 Play Again' : '🔄 Retry'}
                        </button>
                    </div>
                )}

                {/* Settings Panel */}
                {showSettings && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: '20px',
                        background: currentTheme.background,
                        border: `2px solid ${currentTheme.border}`,
                        borderRadius: '12px',
                        padding: '20px',
                        minWidth: '250px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}>
                        <h3 style={{
                            color: currentTheme.text,
                            margin: '0 0 15px 0',
                            fontSize: '16px'
                        }}>
                            Settings
                        </h3>

                        {/* Theme Selector */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{
                                color: currentTheme.text,
                                fontSize: '14px',
                                marginBottom: '8px',
                                display: 'block'
                            }}>
                                Theme:
                            </label>
                            <select
                                value={localTheme}
                                onChange={(e) => handleThemeChange(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: `1px solid ${currentTheme.border}`,
                                    borderRadius: '4px',
                                    color: currentTheme.text
                                }}
                            >
                                <option value="classic">Classic</option>
                                <option value="forest">Forest</option>
                                <option value="ruins">Ruins</option>
                                <option value="neon">Neon</option>
                            </select>
                        </div>

                        {/* Remix Mode Toggle */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{
                                color: currentTheme.text,
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={remixMode}
                                    onChange={onRemixModeToggle}
                                    style={{ marginRight: '8px' }}
                                />
                                Remix Mode
                            </label>
                        </div>

                        {/* Remix Info */}
                        {remixMode && (
                            <div style={{
                                background: 'rgba(255, 255, 0, 0.1)',
                                border: `1px solid ${currentTheme.accent}`,
                                borderRadius: '8px',
                                padding: '10px',
                                fontSize: '12px',
                                color: currentTheme.accent
                            }}>
                                🔧 Remix mode enabled! Debug overlays and developer tools are now active.
                            </div>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={() => setShowSettings(false)}
                            style={{
                                background: 'transparent',
                                border: `1px solid ${currentTheme.border}`,
                                color: currentTheme.text,
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                width: '100%',
                                marginTop: '10px'
                            }}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>

            {/* Remix Mode Overlay */}
            {remixMode && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '2px solid #ffff00',
                    borderRadius: '8px',
                    padding: '15px',
                    color: '#ffff00',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    pointerEvents: 'auto'
                }}>
                    <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                        🔧 Remix Mode Active
                    </div>
                    <div>Theme: {localTheme}</div>
                    <div>Height: {Math.round(state.currentHeight)}</div>
                    <div>Attempts: {state.attempts}</div>
                    <div>Time: {formatTime(state.timeElapsed)}</div>
                </div>
            )}
        </div>
    );
};

export default TopplerUI;