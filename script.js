class OptimizedMagicalEffects {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.stars = [];
        this.animationFrame = null;
        this.time = 0;
        this.isInitialized = false;
        this.deviceConfig = this.getDeviceConfig();
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isVisible = true;
        this.performanceMetrics = {
            fps: 60,
            lastTime: 0,
            frameCount: 0
        };
        
        this.init();
    }
    
    getDeviceConfig() {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        const cores = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 4;
        const hasWebGL = this.hasWebGLSupport();
        const isHighPerformance = hasWebGL && cores >= 4 && memory >= 4;
        
        if (isMobile) {
            return {
                stars: isHighPerformance ? 30 : 20,
                maxSize: 2,
                quality: isHighPerformance ? 'medium' : 'low',
                type: 'mobile'
            };
        } else if (isTablet) {
            return {
                stars: isHighPerformance ? 50 : 35,
                maxSize: 3,
                quality: isHighPerformance ? 'high' : 'medium',
                type: 'tablet'
            };
        } else {
            return {
                stars: isHighPerformance ? 80 : 60,
                maxSize: 4,
                quality: isHighPerformance ? 'high' : 'medium',
                type: 'desktop'
            };
        }
    }
    
    hasWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }
    
    init() {
        if (this.isInitialized) return;
        
        try {
            this.setupEventListeners();
            this.initLoadingScreen();
            this.initNavigation();
            this.initScrollEffects();
            this.initAccessibility();
            this.initPerformanceMonitoring();
            
            if (!this.isReducedMotion) {
                this.initMagicalBackground();
            }
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Error inicializando efectos:', error);
            this.fallbackMode();
        }
    }
    
    fallbackMode() {
        this.isReducedMotion = true;
        this.initNavigation();
        this.initLoadingScreen();
    }
    
    setupEventListeners() {
        const throttle = (func, limit) => {
            let inThrottle;
            return function() {
                if (!inThrottle) {
                    func.apply(this, arguments);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        };
        
        const debounce = (func, wait) => {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        };
        
        window.addEventListener('resize', debounce(() => this.handleResize(), 250), { passive: true });
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 16), { passive: true });
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 100);
        }, { passive: true });
        
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        motionQuery.addListener((query) => {
            this.isReducedMotion = query.matches;
            this.updateMotionSettings();
        });
        
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible) {
                this.resumeAnimations();
            } else {
                this.pauseAnimations();
            }
        }, { passive: true });
        
        window.addEventListener('beforeunload', () => this.cleanup(), { passive: true });
    }
    
    handleResize() {
        const newConfig = this.getDeviceConfig();
        const configChanged = this.deviceConfig.type !== newConfig.type;
        
        this.deviceConfig = newConfig;
        
        if (configChanged && this.canvas) {
            this.resizeCanvas();
            this.createStars();
        } else if (this.canvas) {
            this.resizeCanvas();
        }
        
        if (this.deviceConfig.type === 'desktop') {
            this.closeMobileMenu();
        }
    }
    
    handleScroll() {
        if (this.isReducedMotion) return;
        
        const scrolled = window.pageYOffset;
        const progress = Math.min(scrolled / (document.documentElement.scrollHeight - window.innerHeight), 1);
        
        this.updateScrollProgress(progress);
        this.animateElementsInView();
        
        if (this.deviceConfig.type === 'desktop' && this.deviceConfig.quality === 'high') {
            this.updateParallax(scrolled);
        }
    }
    
    updateScrollProgress(progress) {
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
                will-change: width;
            `;
            document.body.appendChild(progressBar);
        }
        
        progressBar.style.width = `${progress * 100}%`;
    }
    
    updateParallax(scrolled) {
        const rate = scrolled * -0.1;
        const background = document.querySelector('.magical-background');
        if (background) {
            background.style.transform = `translateY(${rate}px)`;
        }
    }
    
    animateElementsInView() {
        const elements = document.querySelectorAll('.magical-card, .benefit-item, .value-item');
        
        elements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
            
            if (isVisible && !element.classList.contains('animated')) {
                element.classList.add('animated');
                if (!this.isReducedMotion) {
                    this.animateElement(element);
                }
            }
        });
    }
    
    animateElement(element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        if (element.classList.contains('hero-card') && this.deviceConfig.quality === 'high') {
            this.createSparkleEffect(element);
        }
    }
    
    createSparkleEffect(element) {
        if (this.isReducedMotion || this.deviceConfig.type === 'mobile') return;
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 4; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, #ffd700, transparent);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${centerX}px;
                top: ${centerY}px;
                opacity: 0.8;
            `;
            
            document.body.appendChild(sparkle);
            
            const angle = (i / 4) * Math.PI * 2;
            const distance = 60;
            const targetX = Math.cos(angle) * distance;
            const targetY = Math.sin(angle) * distance;
            
            const animation = sparkle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 0.8 },
                { transform: `translate(${targetX}px, ${targetY}px) scale(0)`, opacity: 0 }
            ], {
                duration: 800,
                easing: 'ease-out'
            });
            
            animation.onfinish = () => sparkle.remove();
        }
    }
    
    initMagicalBackground() {
        this.canvas = document.getElementById('starsCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = this.deviceConfig.quality !== 'low';
        
        this.resizeCanvas();
        this.createStars();
        this.startAnimation();
    }
    
    resizeCanvas() {
        if (!this.canvas || !this.ctx) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, this.deviceConfig.type === 'mobile' ? 1.5 : 2);
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(dpr, dpr);
        this.canvasWidth = rect.width;
        this.canvasHeight = rect.height;
    }
    
    createStars() {
        if (!this.canvas) return;
        
        const colors = ['#ffd700', '#9b59b6', '#3498db', '#e74c3c', '#2ecc71'];
        this.stars = [];
        
        for (let i = 0; i < this.deviceConfig.stars; i++) {
            this.stars.push({
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight,
                size: Math.random() * this.deviceConfig.maxSize + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 0.02 + 0.005,
                phase: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.05,
                vy: (Math.random() - 0.5) * 0.05
            });
        }
    }
    
    startAnimation() {
        if (this.isReducedMotion || !this.isVisible) return;
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    animate() {
        if (!this.ctx || !this.canvas || this.isReducedMotion || !this.isVisible) {
            this.animationFrame = null;
            return;
        }
        
        const now = performance.now();
        this.updatePerformanceMetrics(now);
        
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.time += 0.008;
        
        this.renderStars();
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    renderStars() {
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
            
            if (star.x < 0) star.x = this.canvasWidth;
            else if (star.x > this.canvasWidth) star.x = 0;
            if (star.y < 0) star.y = this.canvasHeight;
            else if (star.y > this.canvasHeight) star.y = 0;
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    updatePerformanceMetrics(now) {
        if (this.performanceMetrics.lastTime) {
            const delta = now - this.performanceMetrics.lastTime;
            this.performanceMetrics.fps = Math.round(1000 / delta);
        }
        this.performanceMetrics.lastTime = now;
        this.performanceMetrics.frameCount++;
        
        if (this.performanceMetrics.frameCount % 60 === 0) {
            if (this.performanceMetrics.fps < 30 && this.deviceConfig.stars > 20) {
                this.deviceConfig.stars = Math.max(20, this.deviceConfig.stars - 10);
                this.createStars();
            }
        }
    }
    
    initPerformanceMonitoring() {
        if (this.deviceConfig.type === 'mobile') {
            let batteryAPI;
            if ('getBattery' in navigator) {
                navigator.getBattery().then(battery => {
                    batteryAPI = battery;
                    battery.addEventListener('levelchange', () => {
                        if (battery.level < 0.2 && !battery.charging) {
                            this.enablePowerSaveMode();
                        }
                    });
                });
            }
        }
    }
    
    enablePowerSaveMode() {
        this.isReducedMotion = true;
        this.pauseAnimations();
        document.body.classList.add('power-save-mode');
    }
    
    pauseAnimations() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    resumeAnimations() {
        if (!this.isReducedMotion && !this.animationFrame && this.canvas && this.isVisible) {
            this.startAnimation();
        }
    }
    
    initNavigation() {
        const mobileToggle = document.getElementById('mobileToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });
            
            document.addEventListener('click', (e) => {
                if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        }
        
        this.initSmoothScroll();
    }
    
    toggleMobileMenu() {
        const mobileToggle = document.getElementById('mobileToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (!mobileToggle || !navMenu) return;
        
        const isActive = navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active', isActive);
        mobileToggle.setAttribute('aria-expanded', isActive);
        
        document.body.style.overflow = isActive ? 'hidden' : '';
        
        if (!this.isReducedMotion && isActive) {
            this.animateMenuItems();
        }
    }
    
    closeMobileMenu() {
        const mobileToggle = document.getElementById('mobileToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileToggle?.classList.remove('active');
            mobileToggle?.setAttribute('aria-expanded', 'false');
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
            }, index * 50);
        });
    }
    
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: this.isReducedMotion ? 'auto' : 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    initScrollEffects() {
        if (!window.IntersectionObserver) {
            this.initScrollEffectsPolyfill();
            return;
        }
        
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
        
        const elementsToObserve = document.querySelectorAll('.magical-card, .benefit-item, .value-item');
        elementsToObserve.forEach(el => {
            if (!this.isReducedMotion) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            }
            observer.observe(el);
        });
    }
    
    initScrollEffectsPolyfill() {
        const elements = document.querySelectorAll('.magical-card, .benefit-item, .value-item');
        elements.forEach(el => {
            if (!this.isReducedMotion) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            }
        });
        
        setTimeout(() => {
            elements.forEach(el => this.animateElement(el));
        }, 500);
    }
    
    initAccessibility() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
        
        this.addSkipLink();
        this.improveEmailLinks();
    }
    
    addSkipLink() {
        if (document.querySelector('.skip-link')) return;
        
        const skipLink = document.createElement('a');
        skipLink.className = 'skip-link';
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
    }
    
    improveEmailLinks() {
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        emailLinks.forEach(link => {
            link.setAttribute('role', 'button');
            link.setAttribute('aria-label', 'Enviar email de colaboración');
        });
    }
    
    initLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) return;
        
        const minLoadTime = this.deviceConfig.type === 'mobile' ? 1000 : 1500;
        const maxLoadTime = 4000;
        
        const hideLoading = () => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.remove();
                }
            }, 800);
        };
        
        if (document.readyState === 'complete') {
            setTimeout(hideLoading, minLoadTime);
        } else {
            let loadingComplete = false;
            
            const onLoad = () => {
                loadingComplete = true;
                setTimeout(hideLoading, minLoadTime);
            };
            
            window.addEventListener('load', onLoad, { once: true });
            
            setTimeout(() => {
                if (!loadingComplete) {
                    window.removeEventListener('load', onLoad);
                    hideLoading();
                }
            }, maxLoadTime);
        }
    }
    
    updateMotionSettings() {
        if (this.isReducedMotion) {
            document.body.classList.add('reduced-motion');
            this.pauseAnimations();
        } else {
            document.body.classList.remove('reduced-motion');
            if (this.canvas && !this.animationFrame && this.isVisible) {
                this.startAnimation();
            }
        }
    }
    
    cleanup() {
        this.pauseAnimations();
        document.body.style.overflow = '';
        
        const dynamicElements = document.querySelectorAll('.scroll-progress');
        dynamicElements.forEach(el => el.remove());
        
        this.isInitialized = false;
    }
    
    getDebugInfo() {
        return {
            device: this.deviceConfig,
            performance: {
                fps: this.performanceMetrics.fps,
                frameCount: this.performanceMetrics.frameCount,
                starsCount: this.stars?.length || 0
            },
            state: {
                isAnimating: !!this.animationFrame,
                isVisible: this.isVisible,
                reducedMotion: this.isReducedMotion
            }
        };
    }
}

function initializeApp() {
    try {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.magicalEffects = new OptimizedMagicalEffects();
            }, { once: true });
        } else {
            window.magicalEffects = new OptimizedMagicalEffects();
        }
        
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            window.debugMagic = () => window.magicalEffects?.getDebugInfo();
            console.log('🪄 Debug disponible: debugMagic()');
        }
        
    } catch (error) {
        console.error('Error crítico:', error);
        document.body.classList.add('fallback-mode');
    }
}

if (!window.IntersectionObserver) {
    window.IntersectionObserver = class IntersectionObserverPolyfill {
        constructor(callback, options = {}) {
            this.callback = callback;
            this.options = options;
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
        
        disconnect() {
            window.removeEventListener('scroll', this.checkVisibility);
            window.removeEventListener('resize', this.checkVisibility);
        }
    };
}

initializeApp();
