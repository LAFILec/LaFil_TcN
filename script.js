class LaFilApp {
    constructor() {
        this.header = document.getElementById('header');
        this.menuToggle = document.getElementById('menuToggle');
        this.navMenu = document.getElementById('navMenu');
        this.mobileOverlay = document.getElementById('mobileOverlay');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.canvas = document.getElementById('particlesCanvas');

        this.particles = [];
        this.animationFrame = null;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isMobile = window.innerWidth < 768;

        this.init();
    }

    init() {
        this.initLoadingScreen();
        this.initNavigation();
        this.initScrollEffects();
        this.initIntersectionObserver();
        
        if (!this.isReducedMotion && this.canvas) {
            this.initParticles();
        }

        window.addEventListener('resize', () => this.handleResize(), { passive: true });
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    }
    initLoadingScreen() {
        const hideLoading = () => {
            if (this.loadingScreen) {
                this.loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    this.loadingScreen.remove();
                }, 500);
            }
        };

        if (document.readyState === 'complete') {
            setTimeout(hideLoading, 1000);
        } else {
            window.addEventListener('load', () => {
                setTimeout(hideLoading, 1000);
            }, { once: true });
        }
    }

    initNavigation() {
        if (!this.menuToggle || !this.navMenu) return;

        this.menuToggle.addEventListener('click', () => {
            this.toggleMenu();
        });
        this.navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMobile) {
                    this.closeMenu();
                }
            });
        });
        document.addEventListener('click', (e) => {
            if (!this.menuToggle.contains(e.target) && 
                !this.navMenu.contains(e.target) &&
                this.navMenu.classList.contains('active')) {
                this.closeMenu();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navMenu.classList.contains('active')) {
                this.closeMenu();
            }
        });
        this.initEmailLinks();
    }

    initEmailLinks() {
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        
        emailLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                setTimeout(() => {
                    window.location.href = href;
                }, 10);
                
                e.preventDefault();
            });
        });
    }

    toggleMenu() {
        const isActive = this.navMenu.classList.toggle('active');
        this.menuToggle.classList.toggle('active', isActive);
        this.menuToggle.setAttribute('aria-expanded', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    }
    closeMenu() {
        this.navMenu.classList.remove('active');
        this.menuToggle.classList.remove('active');
        this.menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    initScrollEffects() {
        this.handleScroll();
    }
    handleScroll() {
        const scrollY = window.scrollY;
        if (this.header) {
            if (scrollY > 50) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
        }
    }

    initIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });
    }
    initParticles() {
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.createParticles();
        this.animateParticles();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const particleCount = this.isMobile ? 50 : 100;
        this.particles = [];

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1.5,
                speedX: (Math.random() - 0.5) * 0.8,
                speedY: (Math.random() - 0.5) * 0.8,
                opacity: Math.random() * 0.6 + 0.4,
                hue: Math.random() * 60 + 250,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }
    }
    animateParticles() {
        if (!this.ctx || !this.canvas || this.isReducedMotion) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const time = Date.now() * 0.001;
        this.particles.forEach(particle => {
            const pulse = Math.sin(time * particle.pulseSpeed + particle.pulseOffset) * 0.3 + 0.7;
            const currentOpacity = particle.opacity * pulse;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 3
            );
            gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 70%, ${currentOpacity})`);
            gradient.addColorStop(0.5, `hsla(${particle.hue}, 80%, 60%, ${currentOpacity * 0.5})`);
            gradient.addColorStop(1, `hsla(${particle.hue}, 80%, 50%, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.speedY *= -1;
            }
        });

        this.drawConnections();

        this.animationFrame = requestAnimationFrame(() => this.animateParticles());
    }

    drawConnections() {
        const maxDistance = this.isMobile ? 120 : 180;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.3;
                    const gradient = this.ctx.createLinearGradient(
                        this.particles[i].x, this.particles[i].y,
                        this.particles[j].x, this.particles[j].y
                    );
                    
                    gradient.addColorStop(0, `hsla(${this.particles[i].hue}, 80%, 65%, ${opacity})`);
                    gradient.addColorStop(1, `hsla(${this.particles[j].hue}, 80%, 65%, ${opacity})`);
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 1.5;
                    this.ctx.stroke();
                }
            }
        }
    }

    handleResize() {
        this.isMobile = window.innerWidth < 768;
        if (this.canvas && !this.isReducedMotion) {
            this.resizeCanvas();
            this.createParticles();
        }
        if (!this.isMobile) {
            this.closeMenu();
        }
    }
    cleanup() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        document.body.style.overflow = '';
    }
}
function initApp() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.laFilApp = new LaFilApp();
        });
    } else {
        window.laFilApp = new LaFilApp();
    }
}
window.addEventListener('beforeunload', () => {
    if (window.laFilApp) {
        window.laFilApp.cleanup();
    }
});
initApp();
