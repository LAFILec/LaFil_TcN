class MagicalEffects {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.stars = [];
        this.animationFrame = null;
        this.time = 0;
        this.isInitialized = false;
        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        this.isDesktop = window.innerWidth >= 1024;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isHighPerformanceDevice = this.checkPerformance();
        this.config = this.getDeviceConfig();
        
        this.init();
    }
    
    checkPerformance() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const hasWebGL = !!gl;
        const cores = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 4;
        
        return hasWebGL && cores >= 4 && memory >= 4;
    }
    
    getDeviceConfig() {
        if (this.isMobile) {
            return {
                stars: this.isHighPerformanceDevice ? 40 : 25,
                maxSize: 2,
                animationQuality: 'low'
            };
        } else if (this.isTablet) {
            return {
                stars: this.isHighPerformanceDevice ? 70 : 50,
                maxSize: 3,
                animationQuality: 'medium'
            };
        } else {
            return {
                stars: this.isHighPerformanceDevice ? 120 : 80,
                maxSize: 4,
                animationQuality: 'high'
            };
        }
    }
    
    init() {
        if (this.isInitialized) return;
        
        try {
            this.setupEvents();
            this.initLoadingScreen();
            
            if (!this.isReducedMotion && this.config.animationQuality !== 'disabled') {
                this.initMagicalBackground();
            }
            
            this.initNavigationMagic();
            this.initScrollEffects();
            this.initAccessibilityFeatures();
            
            this.isInitialized = true;
            console.log('Magia inicializada para dispositivo:', {
                type: this.isMobile ? 'mobile' : this.isTablet ? 'tablet' : 'desktop',
                performance: this.isHighPerformanceDevice ? 'high' : 'standard',
                stars: this.config.stars
            });
        } catch (error) {
            console.error('Error al inicializar la magia:', error);
            this.fallbackMode();
        }
    }
    
    fallbackMode() {
        this.isReducedMotion = true;
        this.initNavigationMagic();
        this.initLoadingScreen();
    }
    
    setupEvents() {
        const throttle = (func, limit) => {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        };
        
        const debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };
        const resizeHandler = debounce(() => this.handleResize(), 250);
        const scrollHandler = throttle(() => this.handleScroll(), 16);
        
        window.addEventListener('resize', resizeHandler, { passive: true });
        window.addEventListener('scroll', scrollHandler, { passive: true });
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 100);
        }, { passive: true });
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const contrastQuery = window.matchMedia('(prefers-contrast: high)');
        
        motionQuery.addListener((query) => {
            this.isReducedMotion = query.matches;
            this.updateMotionPreferences();
        });
        
        contrastQuery.addListener((query) => {
            document.body.classList.toggle('high-contrast', query.matches);
        });
        window.addEventListener('beforeunload', () => this.destroy(), { passive: true });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        }, { passive: true });
    }
    
    handleResize() {
        const oldIsMobile = this.isMobile;
        const oldIsTablet = this.isTablet;
        
        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        this.isDesktop = window.innerWidth >= 1024;
        if (oldIsMobile !== this.isMobile || oldIsTablet !== this.isTablet) {
            this.config = this.getDeviceConfig();
            
            if (this.canvas) {
                this.resizeCanvas();
                this.createStars();
            }
        } else if (this.canvas) {
            this.resizeCanvas();
        }

        if (this.isDesktop) {
            this.closeMenuMobile();
        }
    }
    
    handleScroll() {
        if (this.isReducedMotion || !this.isHighPerformanceDevice) return;
        
        const scrolled = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        if (this.isDesktop) {
            const rate = scrolled * -0.2;
            const background = document.querySelector('.magical-background');
            if (background) {
                background.style.transform = `translateY(${rate}px)`;
            }
        }
        this.animateElementsInView();
    }
    
    animateElementsInView() {
        const cards = document.querySelectorAll('.magical-card, .benefit-item');
        
        cards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
            
            if (isVisible && !card.classList.contains('animated')) {
                card.classList.add('animated');
                if (!this.isReducedMotion) {
                    card.style.transform = 'translateY(0)';
                    card.style.opacity = '1';
                }
            }
        });
    }
    
    initMagicalBackground() {
        this.canvas = document.getElementById('starsCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = this.config.animationQuality === 'high';
        
        this.resizeCanvas();
        this.createStars();
        this.animateMagicalBackground();
    }
    
    resizeCanvas() {
        if (!this.canvas || !this.ctx) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.5 : 2);
        const width = Math.min(rect.width, window.innerWidth);
        const height = Math.min(rect.height, window.innerHeight);
        
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        this.ctx.scale(dpr, dpr);
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
    
    createStars() {
        if (!this.canvas) return;
        
        const colors = ['#f1c40f', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71'];
        this.stars = [];
        for (let i = 0; i < this.config.stars; i++) {
            this.stars.push({
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight,
                size: Math.random() * this.config.maxSize + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 0.02 + 0.005,
                phase: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1
            });
        }
    }
    
    animateMagicalBackground() {
        if (!this.ctx || !this.canvas || this.isReducedMotion || document.hidden) {
            if (!document.hidden) {
                this.animationFrame = requestAnimationFrame(() => this.animateMagicalBackground());
            }
            return;
        }
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.time += 0.008;
        this.renderStars();
        
        this.animationFrame = requestAnimationFrame(() => this.animateMagicalBackground());
    }
    
    renderStars() {
        this.ctx.globalCompositeOperation = 'source-over';
        
        this.stars.forEach((star) => {
            const twinkle = Math.sin(this.time * star.speed + star.phase) * 0.3 + 0.7;
            const alpha = star.opacity * twinkle;
            if (alpha < 0.1) return;
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.fill();
            star.x += star.vx;
            star.y += star.vy;
            if (star.x < -5) star.x = this.canvasWidth + 5;
            else if (star.x > this.canvasWidth + 5) star.x = -5;
            if (star.y < -5) star.y = this.canvasHeight + 5;
            else if (star.y > this.canvasHeight + 5) star.y = -5;
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    pauseAnimations() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    resumeAnimations() {
        if (!this.isReducedMotion && !this.animationFrame && this.canvas) {
            this.animateMagicalBackground();
        }
    }
    
    initNavigationMagic() {
        const mobileToggle = document.getElementById('mobileToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            }, { passive: false });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                    this.closeMenuMobile();
                }
            }, { passive: true });
            document.addEventListener('click', (e) => {
                if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    this.closeMenuMobile();
                }
            }, { passive: true });
        }
        this.initSmoothScroll();
    }
    
    toggleMobileMenu() {
        const mobileToggle = document.getElementById('mobileToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (!mobileToggle || !navMenu) return;
        
        const isActive = navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
        if (!this.isReducedMotion && isActive) {
            this.animateMenuItems();
        }
    }
    
    closeMenuMobile() {
        const mobileToggle = document.getElementById('mobileToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileToggle?.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    animateMenuItems() {
        const menuItems = document.querySelectorAll('.nav-menu li');
        menuItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, { passive: false });
        });
    }
    
    initScrollEffects() {
        const observerOptions = {
            threshold: [0.1, 0.5],
            rootMargin: '0px 0px -10% 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                    this.animateElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        const elementsToAnimate = document.querySelectorAll('.magical-card, .benefit-item');
        elementsToAnimate.forEach(el => {
            if (!this.isReducedMotion) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            }
            observer.observe(el);
        });

        this.initScrollProgress();
    }
    
    animateElement(element) {
        if (this.isReducedMotion) return;
        
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';

        if (element.classList.contains('hero-card') && this.isHighPerformanceDevice) {
            this.createElementEntrance(element);
        }
    }
    
    createElementEntrance(element) {
        if (this.isReducedMotion || this.isMobile) return;
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 3px;
                height: 3px;
                background: #ffd700;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${centerX}px;
                top: ${centerY}px;
                opacity: 0.8;
            `;
            
            document.body.appendChild(particle);
            
            const angle = (i / 6) * Math.PI * 2;
            const distance = 80;
            const targetX = Math.cos(angle) * distance;
            const targetY = Math.sin(angle) * distance;
            
            const animation = particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 0.8 },
                { transform: `translate(${targetX}px, ${targetY}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1200,
                easing: 'ease-out'
            });
            
            animation.onfinish = () => particle.remove();
        }
    }
    
    initScrollProgress() {
        let progressBar = document.querySelector('.scroll-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 0%;
                height: 3px;
                background: linear-gradient(90deg, #ffd700, #9b59b6, #3498db);
                z-index: 10001;
                transition: width 0.1s ease;
            `;
            document.body.appendChild(progressBar);
        }
        
        const updateProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = Math.min((scrollTop / docHeight) * 100, 100);
            
            progressBar.style.width = `${progress}%`;
        };
        let ticking = false;
        const scrollListener = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateProgress();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', scrollListener, { passive: true });
    }
    
    initAccessibilityFeatures() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        }, { passive: true });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        }, { passive: true });
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
        this.addSkipLink();
    }
    
    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Saltar al contenido principal';
        skipLink.style.cssText = `
            position: absolute;
            left: -9999px;
            z-index: 10002;
            padding: 8px 16px;
            background: #0a0e1a;
            color: #ffd700;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
            border: 2px solid #ffd700;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.left = '16px';
            skipLink.style.top = '16px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.left = '-9999px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        const mainContent = document.querySelector('main');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
    }
    
    initLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) return;
        const loadingTime = this.isMobile ? 800 : 1200;
        
        const hideLoading = () => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.remove();
                }
            }, 800);
        };
        if (document.readyState === 'complete') {
            setTimeout(hideLoading, loadingTime);
        } else {
            window.addEventListener('load', () => {
                setTimeout(hideLoading, loadingTime);
            }, { once: true, passive: true });
        }
        setTimeout(hideLoading, 5000);
    }
    
    updateMotionPreferences() {
        if (this.isReducedMotion) {
            document.body.classList.add('reduced-motion');
            this.pauseAnimations();
        } else {
            document.body.classList.remove('reduced-motion');
            if (this.canvas && !this.animationFrame) {
                this.resumeAnimations();
            }
        }
    }
    
    destroy() {
        this.pauseAnimations();
        document.body.style.overflow = '';
        const dynamicElements = document.querySelectorAll('.scroll-progress');
        dynamicElements.forEach(el => el.remove());
        this.isInitialized = false;
        
        console.log('Efectos mágicos destruidos correctamente');
    }
    getStats() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return {
                device: this.isMobile ? 'mobile' : this.isTablet ? 'tablet' : 'desktop',
                performance: this.isHighPerformanceDevice ? 'high' : 'standard',
                starsCount: this.stars?.length || 0,
                isAnimating: !!this.animationFrame,
                reducedMotion: this.isReducedMotion,
                config: this.config
            };
        }
        return null;
    }
}

function initMagicalWorld() {
    try {
        if (!window.requestAnimationFrame || !window.matchMedia) {
            console.warn('Navegador no compatible con todas las características');
            return;
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.magicalEffects = new MagicalEffects();
            }, { once: true, passive: true });
        } else {
            window.magicalEffects = new MagicalEffects();
        }
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.magicalDebug = {
                getStats: () => window.magicalEffects?.getStats(),
                destroy: () => window.magicalEffects?.destroy(),
                toggle: () => {
                    if (window.magicalEffects) {
                        window.magicalEffects.isReducedMotion = !window.magicalEffects.isReducedMotion;
                        window.magicalEffects.updateMotionPreferences();
                    }
                }
            };
            console.log('🪄 Debug mode enabled. Use magicalDebug object for controls.');
        }
        
    } catch (error) {
        console.error('Error crítico al inicializar:', error);
        document.body.classList.add('fallback-mode');
    }
}

function checkSupport() {
    if (!window.IntersectionObserver) {
        window.IntersectionObserver = class {
            constructor(callback) {
                this.callback = callback;
                this.elements = new Set();
                this.checkVisibility = this.checkVisibility.bind(this);
                window.addEventListener('scroll', this.checkVisibility, { passive: true });
                window.addEventListener('resize', this.checkVisibility, { passive: true });
            }
            
            observe(element) {
                this.elements.add(element);
                this.checkVisibility();
            }
            
            unobserve(element) {
                this.elements.delete(element);
            }
            
            checkVisibility() {
                this.elements.forEach(element => {
                    const rect = element.getBoundingClientRect();
                    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                    
                    if (isVisible) {
                        this.callback([{
                            target: element,
                            isIntersecting: true,
                            intersectionRatio: 0.5
                        }]);
                    }
                });
            }
        };
    }
}

checkSupport();
initMagicalWorld();
