// MIFF Landing Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    const themeToggle = document.getElementById('theme-toggle');

    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('miff-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Update theme toggle icon
    updateThemeIcon(savedTheme);

    // Theme toggle handler
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('miff-theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    // Show splash screen for 2-3 seconds, then fade to main content
    setTimeout(() => {
        if (splashScreen && mainContent) {
            splashScreen.style.opacity = '0';
            splashScreen.style.transition = 'opacity 1s ease-out';

            setTimeout(() => {
                splashScreen.style.display = 'none';
                mainContent.style.display = 'block';
                mainContent.style.opacity = '0';
                mainContent.style.transition = 'opacity 1s ease-in';

                setTimeout(() => {
                    mainContent.style.opacity = '1';
                }, 100);
            }, 1000);
        }
    }, 2000);

    // Add click effects to experience cards
    document.querySelectorAll('.experience-card').forEach(card => {
        card.addEventListener('click', function() {
            // Add ripple effect
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(0, 255, 136, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.width = '100px';
            ripple.style.height = '100px';
            ripple.style.marginLeft = '-50px';
            ripple.style.marginTop = '-50px';

            this.style.position = 'relative';
            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add entrance animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.experience-card, .stat-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('.nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Update theme toggle icon
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const svgPath = themeToggle.querySelector('svg path');
        if (theme === 'dark') {
            svgPath.setAttribute('d', 'M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z');
        } else {
            svgPath.setAttribute('d', 'M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z');
        }
    }
}

// Navigation function with error handling
function navigateTo(path) {
    try {
        // Ensure path starts with ./
        const normalizedPath = path.startsWith('./') ? path : `./${path}`;
        console.log(`Navigating to: ${normalizedPath}`);
        window.location.href = normalizedPath;
    } catch (error) {
        console.error('Navigation failed:', error);
        // Fallback: try direct navigation
        window.location.href = path;
    }
}

// Add CSS for splash screen and animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .splash-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--bg-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 1s ease-out;
    }

    .splash-content {
        text-align: center;
        color: var(--text-primary);
    }

    .splash-logo {
        margin-bottom: 2rem;
        animation: fadeInUp 1s ease-out;
    }

    .splash-title {
        font-size: clamp(2rem, 5vw, 4rem);
        font-weight: 700;
        color: var(--accent-primary);
        margin-bottom: 0.5rem;
        animation: fadeInUp 1s ease-out 0.3s both;
    }

    .splash-tagline {
        font-size: clamp(1rem, 2vw, 1.5rem);
        color: var(--text-secondary);
        font-weight: 600;
        margin-bottom: 0.5rem;
        animation: fadeInUp 1s ease-out 0.6s both;
    }

    .splash-subtitle {
        font-size: clamp(0.9rem, 1.5vw, 1.2rem);
        color: var(--text-muted);
        margin-bottom: 2rem;
        animation: fadeInUp 1s ease-out 0.9s both;
    }

    .splash-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border-color);
        border-top: 3px solid var(--accent-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .experience-card {
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .experience-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-hover);
    }

    /* Ensure proper button styles */
    .theme-toggle {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        color: var(--text-secondary);
    }

    .theme-toggle:hover {
        transform: scale(1.1);
        background: var(--accent-primary);
        color: var(--bg-primary);
    }
`;
document.head.appendChild(style);