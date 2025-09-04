/**
 * MIFF Zone Router - Remix-safe iframe-based zone loader
 * 
 * Features:
 * - Hash-based routing for zones and tools
 * - Fallback handling for missing zones
 * - Remix mode support with debug overlays
 * - Contributor dashboard integration
 * - Animated transitions and loading states
 * - Global hook for remix extensions
 */

(function() {
    'use strict';

    // Zone configuration - remix-safe paths
    const ZONES = {
        // Gameplay zones (load from main zones directory)
        toppler: {
            title: '🧱 Toppler Puzzle',
            description: 'Physics puzzle with modular ramps and remixable rules',
            src: './zones/toppler/index.html',
            type: 'game',
            remixSafe: true
        },
        spirit_tamer: {
            title: '🐉 Spirit Tamer Combat',
            description: 'Dialogue + interaction sampler for taming spirits',
            src: './zones/spirit_tamer/index.html',
            type: 'game',
            remixSafe: true
        },
        witcher_grove: {
            title: '🧙 Witcher Grove Narrative',
            description: 'Quiet clearing with a mysterious NPC near a campfire',
            src: './zones/witcher_grove/index.html',
            type: 'game',
            remixSafe: true
        },
        remix_lab: {
            title: '🧪 Remix Lab',
            description: 'Contributor-facing debug zone and CLI triggers',
            src: './zones/remix_lab/index.html',
            type: 'tool',
            remixSafe: true
        },
        // Contributor tools (load from site directory)
        dashboard: {
            title: '📊 Contributor Dashboard',
            description: 'Zone management, onboarding, and remix tools',
            src: './dashboard/index.html',
            type: 'tool',
            remixSafe: true
        },
        onboarding: {
            title: '📚 Onboarding Guide',
            description: 'Getting started with MIFF development',
            src: './onboarding.html',
            type: 'tool',
            remixSafe: true
        }
    };

    // Default splash screen content
    const SPLASH_HTML = `
        <div class="splash-screen">
            <div class="splash-content">
                <h1>🎮 MIFF Sampler</h1>
                <p class="tagline">Made with MIFF in mind</p>
                <p class="description">
                    A modular, remixable framework for building engine-agnostic gameplay 
                    with Pure systems. Choose a zone above to get started.
                </p>
                <div class="splash-actions">
                    <a href="#toppler" class="btn btn-primary">🧱 Try Toppler</a>
                    <a href="#dashboard" class="btn btn-secondary">📊 Dashboard</a>
                </div>
                <div class="splash-features">
                    <div class="feature">
                        <span class="icon">🔧</span>
                        <span>Remix-safe</span>
                    </div>
                    <div class="feature">
                        <span class="icon">📱</span>
                        <span>Mobile-first</span>
                    </div>
                    <div class="feature">
                        <span class="icon">🎯</span>
                        <span>Pure modules</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Error fallback content
    const ERROR_HTML = `
        <div class="error-fallback">
            <div class="error-content">
                <h2>⚠️ Zone Unavailable</h2>
                <p>This zone couldn't be loaded. It may be:</p>
                <ul>
                    <li>Still under development</li>
                    <li>Missing required dependencies</li>
                    <li>Incompatible with your browser</li>
                </ul>
                <p class="error-actions">
                    <a href="#" class="btn btn-primary" onclick="window.history.back()">Go Back</a>
                    <a href="#dashboard" class="btn btn-secondary">Open Dashboard</a>
                </div>
            </div>
        </div>
    `;

    class MIFFRouter {
        constructor() {
            this.currentZone = null;
            this.remixMode = false;
            this.loading = false;
            this.container = null;
            this.debugOverlay = null;
            
            this.init();
        }

        init() {
            // Find the preview container
            this.container = document.getElementById('zone-preview');
            if (!this.container) {
                console.error('[MIFF Router] Preview container not found');
                return;
            }

            // Create debug overlay
            this.createDebugOverlay();

            // Set up event listeners
            this.setupEventListeners();

            // Handle initial route
            this.handleRoute();

            // Expose global hook for remix extensions
            window.MIFFRouter = this;
        }

        createDebugOverlay() {
            this.debugOverlay = document.createElement('div');
            this.debugOverlay.className = 'debug-overlay';
            this.debugOverlay.innerHTML = `
                <div class="debug-header">
                    <span class="debug-title">🔧 MIFF Router Debug</span>
                    <button class="debug-toggle" onclick="this.parentElement.parentElement.classList.toggle('collapsed')">−</button>
                </div>
                <div class="debug-content">
                    <div class="debug-item">
                        <span class="label">Route:</span>
                        <span class="value" id="debug-route">-</span>
                    </div>
                    <div class="debug-item">
                        <span class="label">Status:</span>
                        <span class="value" id="debug-status">-</span>
                    </div>
                    <div class="debug-item">
                        <span class="label">Remix:</span>
                        <span class="value" id="debug-remix">-</span>
                    </div>
                </div>
            `;
            document.body.appendChild(this.debugOverlay);
        }

        setupEventListeners() {
            // Handle hash changes
            window.addEventListener('hashchange', () => this.handleRoute());
            
            // Handle iframe load events
            window.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'MIFF_ZONE_READY') {
                    this.onZoneReady(event.data.zone);
                }
            });

            // Handle remix toggle
            const remixToggle = document.getElementById('remixToggle');
            if (remixToggle) {
                remixToggle.addEventListener('change', (e) => {
                    this.setRemixMode(!!e.target.checked);
                });
            }
        }

        handleRoute() {
            const hash = location.hash.replace('#', '');
            const zone = hash ? ZONES[hash] : null;

            if (zone) {
                this.loadZone(zone);
            } else {
                this.showSplash();
            }

            this.updateDebugInfo();
        }

        async loadZone(zone) {
            if (this.loading) return;
            
            this.loading = true;
            this.currentZone = zone;
            this.updateDebugInfo();

            // Show loading state
            this.container.innerHTML = `
                <div class="zone-loading">
                    <div class="loading-spinner"></div>
                    <h3>Loading ${zone.title}</h3>
                    <p>${zone.description}</p>
                </div>
            `;

            try {
                // Create iframe with proper error handling
                const iframe = document.createElement('iframe');
                iframe.src = this.buildZoneUrl(zone);
                iframe.className = 'zone-iframe';
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('loading', 'lazy');
                
                // Handle iframe load events
                iframe.onload = () => {
                    this.onZoneLoaded(zone, iframe);
                };

                iframe.onerror = () => {
                    this.onZoneError(zone);
                };

                // Set timeout for loading
                const loadTimeout = setTimeout(() => {
                    if (this.loading) {
                        this.onZoneError(zone, 'Load timeout');
                    }
                }, 10000);

                // Replace loading content with iframe
                this.container.innerHTML = '';
                this.container.appendChild(iframe);

                // Store timeout reference for cleanup
                iframe._loadTimeout = loadTimeout;

            } catch (error) {
                console.error('[MIFF Router] Failed to load zone:', error);
                this.onZoneError(zone, error.message);
            }
        }

        buildZoneUrl(zone) {
            let url = zone.src;
            
            // Add remix mode parameter if enabled
            if (this.remixMode) {
                url += (url.includes('?') ? '&' : '?') + 'remix=1';
            }

            // Add router context
            url += (url.includes('?') ? '&' : '?') + 'router=1';

            return url;
        }

        onZoneLoaded(zone, iframe) {
            this.loading = false;
            if (iframe._loadTimeout) {
                clearTimeout(iframe._loadTimeout);
                delete iframe._loadTimeout;
            }

            // Add zone metadata
            iframe.setAttribute('data-zone', zone.type);
            iframe.setAttribute('data-title', zone.title);
            iframe.setAttribute('data-remix-safe', zone.remixSafe);

            // Send zone info to iframe
            try {
                iframe.contentWindow.postMessage({
                    type: 'MIFF_ROUTER_INFO',
                    zone: zone,
                    remixMode: this.remixMode
                }, '*');
            } catch (e) {
                // Cross-origin restrictions may prevent this
                console.log('[MIFF Router] Could not send message to iframe');
            }

            this.updateDebugInfo();
        }

        onZoneError(zone, error = 'Unknown error') {
            this.loading = false;
            this.currentZone = null;
            
            console.error(`[MIFF Router] Failed to load zone ${zone.title}:`, error);
            
            this.container.innerHTML = ERROR_HTML;
            this.updateDebugInfo();
        }

        onZoneReady(zoneName) {
            console.log(`[MIFF Router] Zone ${zoneName} is ready`);
            this.updateDebugInfo();
        }

        showSplash() {
            this.currentZone = null;
            this.container.innerHTML = SPLASH_HTML;
            this.updateDebugInfo();
        }

        updateDebugInfo() {
            if (!this.debugOverlay) return;

            const routeEl = this.debugOverlay.querySelector('#debug-route');
            const statusEl = this.debugOverlay.querySelector('#debug-status');
            const remixEl = this.debugOverlay.querySelector('#debug-remix');

            if (routeEl) {
                routeEl.textContent = this.currentZone ? this.currentZone.title : 'Splash';
            }
            if (statusEl) {
                statusEl.textContent = this.loading ? 'Loading...' : 'Ready';
            }
            if (remixEl) {
                remixEl.textContent = this.remixMode ? 'ON' : 'OFF';
            }
        }

        // Public API methods
        setRemixMode(enabled) {
            this.remixMode = !!enabled;
            document.body.classList.toggle('remix-on', this.remixMode);
            
            // Reload current zone if one is active
            if (this.currentZone) {
                this.loadZone(this.currentZone);
            }
            
            this.updateDebugInfo();
        }

        navigateTo(zoneName) {
            if (ZONES[zoneName]) {
                location.hash = zoneName;
            } else {
                console.error(`[MIFF Router] Unknown zone: ${zoneName}`);
            }
        }

        getCurrentZone() {
            return this.currentZone;
        }

        getZoneList() {
            return Object.keys(ZONES);
        }
    }

    // Initialize router when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new MIFFRouter());
    } else {
        new MIFFRouter();
    }

})();