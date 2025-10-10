/**
 * MIFF Unified Navigation System
 * Provides consistent navigation across all MIFF pages
 */

class MIFFNavigation {
    constructor() {
        this.navItems = [
            { name: 'Home', url: './', icon: '🏠' },
            { name: 'MIFF Sampler', url: 'sampler/', icon: '🎮' },
            { name: 'MIFF Studio', url: 'studio/', icon: '🛠️' },
            { name: 'RenderWorld Hub', url: 'renderworld/', icon: '🌍' },
            { name: 'Documentation', url: 'docs-site/', icon: '📚' },
            { name: 'Blog', url: 'blog/', icon: '📝' },
            { name: 'GitHub', url: 'https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free', icon: '🧬', external: true }
        ];
        
        this.init();
    }
    
    init() {
        this.createNavigation();
        this.setupEventListeners();
        this.setupThemeToggle();
    }
    
    createNavigation() {
        // Create header navigation
        const header = document.querySelector('.header .nav') || this.createHeader();
        if (header) {
            header.innerHTML = this.navItems
                .filter(item => !item.external)
                .map(item => `<a href="${item.url}">${item.name}</a>`)
                .join('');
        }
        
        // Create mobile menu
        const menuPanel = document.getElementById('menu-panel') || this.createMenuPanel();
        if (menuPanel) {
            menuPanel.innerHTML = this.navItems
                .map(item => `<a href="${item.url}" ${item.external ? 'target="_blank"' : ''}>${item.icon} ${item.name}</a>`)
                .join('');
        }
    }
    
    createHeader() {
        const header = document.querySelector('.header');
        if (!header) return null;
        
        const nav = document.createElement('nav');
        nav.className = 'nav miff-nav';
        header.appendChild(nav);
        return nav;
    }
    
    createMenuPanel() {
        const header = document.querySelector('.header');
        if (!header) return null;
        
        const menuPanel = document.createElement('div');
        menuPanel.id = 'menu-panel';
        menuPanel.className = 'menu-panel';
        menuPanel.setAttribute('aria-hidden', 'true');
        header.appendChild(menuPanel);
        return menuPanel;
    }
    
    setupEventListeners() {
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const menuPanel = document.getElementById('menu-panel');
        
        if (menuToggle && menuPanel) {
            menuToggle.addEventListener('click', () => {
                const isHidden = menuPanel.getAttribute('aria-hidden') === 'true';
                menuPanel.setAttribute('aria-hidden', !isHidden);
                menuPanel.classList.toggle('active');
            });
        }
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (menuPanel && !menuPanel.contains(e.target) && !menuToggle.contains(e.target)) {
                menuPanel.setAttribute('aria-hidden', 'true');
                menuPanel.classList.remove('active');
            }
        });
    }
    
    setupThemeToggle() {
        // Create theme toggle button
        const header = document.querySelector('.header .container');
        if (!header) return;
        
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle miff-button';
        themeToggle.innerHTML = '🌙';
        themeToggle.setAttribute('aria-label', 'Toggle theme');
        themeToggle.title = 'Toggle dark/light theme';
        
        // Add theme toggle functionality
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('miff-theme', newTheme);
            
            themeToggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('miff-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
        
        header.appendChild(themeToggle);
    }
    
    // Utility method to add new navigation items
    addNavItem(item) {
        this.navItems.push(item);
        this.createNavigation();
    }
    
    // Utility method to get current page
    getCurrentPage() {
        const path = window.location.pathname;
        return this.navItems.find(item => path.includes(item.url)) || this.navItems[0];
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.miffNavigation = new MIFFNavigation();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MIFFNavigation;
}