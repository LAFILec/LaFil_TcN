class MagicalEffects {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.stars = [];
        this.animationFrame = null;
        this.time = 0;
        this.isInitialized = false;
        this.isMobile = window.innerWidth < 768;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.config = {
            stars: {
                count: this.isMobile ? 50 : 100,
                colors: ['#8bc34a', '#50c878', '#9caf88', '#b8e6b8'],
                minSize: 1,
                maxSize: this.isMobile ? 2 : 3
            }
        };
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        try {
            this.setupEvents();
            if (!this.isReducedMotion) {
                this.initStarField();
                this.initLoadingAnimation();
            }
            this.initScrollEffects();
            this.initFormEffects();
            this.addParticleStyles();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Error al inicializar efectos:', error);
        }
    }
    
    setupEvents() {
        this.throttle = (func, limit) => {
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
        
        window.addEventListener('resize', this.throttle(() => this.handleResize(), 250));
        window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 16), { passive: true });
        
        if (!this.isMobile) {
            document.addEventListener('mousemove', this.throttle((e) => this.handleMouseMove(e), 16), { passive: true });
            document.addEventListener('click', (e) => this.handleClick(e), { passive: true });
        }
    }
    
    initStarField() {
        this.canvas = document.getElementById('starsCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.createStars();
        this.animateStars();
    }
    
    resizeCanvas() {
        if (!this.canvas || !this.ctx) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(dpr, dpr);
        this.createStars();
    }
    
    createStars() {
        if (!this.canvas) return;
        
        this.stars = [];
        const { count, colors, minSize, maxSize } = this.config.stars;
        const rect = this.canvas.getBoundingClientRect();
        
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * rect.width,
                y: Math.random() * rect.height,
                size: Math.random() * (maxSize - minSize) + minSize,
                opacity: Math.random() * 0.8 + 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 0.02 + 0.01,
                phase: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2
            });
        }
    }
    
    animateStars() {
        if (!this.ctx || !this.canvas || this.isReducedMotion) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        this.time += 0.01;
        
        this.stars.forEach((star) => {
            const twinkle = Math.sin(this.time * star.speed + star.phase) * 0.5 + 0.5;
            const alpha = star.opacity * twinkle;
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.fill();
            
            star.x += star.vx;
            star.y += star.vy;
            
            if (star.x < 0) star.x = rect.width;
            if (star.x > rect.width) star.x = 0;
            if (star.y < 0) star.y = rect.height;
            if (star.y > rect.height) star.y = 0;
        });
        
        this.ctx.globalAlpha = 1;
        this.animationFrame = requestAnimationFrame(() => this.animateStars());
    }
    
    initScrollEffects() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
        );
        
        const cards = document.querySelectorAll('.magical-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            card.style.transition = 'all 1s ease-out';
            observer.observe(card);
        });
        
        this.handleScroll();
    }
    
    handleScroll() {
        if (this.isReducedMotion) return;
        
        const scrolled = window.pageYOffset;
        const floatingElements = document.querySelectorAll('.floating-leaf, .magical-sparkle');
        
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.15;
            element.style.transform = `translateY(${scrolled * speed * -1}px)`;
        });
    }
    
    handleMouseMove(e) {
        if (this.isMobile) return;
        
        const cards = document.querySelectorAll('.magical-card');
        const maxTilt = 10;
        
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = Math.max(-maxTilt, Math.min(maxTilt, (y - centerY) / 20));
                const rotateY = Math.max(-maxTilt, Math.min(maxTilt, (centerX - x) / 20));
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            } else {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            }
        });
    }
    
    handleClick(e) {
        if (this.isMobile || this.isReducedMotion) return;
        this.createClickEffect(e.clientX, e.clientY);
    }
    
    createClickEffect(x, y) {
        const colors = ['#8bc34a', '#50c878', '#9caf88'];
        const particleCount = this.isMobile ? 3 : 6;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 20 + Math.random() * 15;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                --dx: ${dx}px;
                --dy: ${dy}px;
                animation: particleExplode 0.8s ease-out forwards;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 800);
        }
    }
    
    initFormEffects() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        
        const inputs = form.querySelectorAll('.magical-input, .magical-select, .magical-textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.borderColor = '#8bc34a';
                input.style.boxShadow = '0 0 10px rgba(139, 195, 74, 0.3)';
            });
            
            input.addEventListener('blur', () => {
                input.style.borderColor = '';
                input.style.boxShadow = '';
            });
            
            input.addEventListener('input', () => {
                this.validateField(input);
            });
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm(form)) {
                this.handleFormSubmit(form);
            }
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }
        
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
        }
        
        if (isValid) {
            field.style.borderColor = '#50c878';
            field.classList.remove('error');
        } else {
            field.style.borderColor = '#ff6b6b';
            field.classList.add('error');
        }
        
        return isValid;
    }
    
    validateForm(form) {
        const inputs = form.querySelectorAll('.magical-input, .magical-select, .magical-textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    handleFormSubmit(form) {
        const submitBtn = form.querySelector('.magical-submit-btn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<span>Enviando... ✨</span>';
        submitBtn.disabled = true;
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        setTimeout(() => {
            submitBtn.innerHTML = '<span>¡Enviado! 🌟</span>';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                form.reset();
                this.showNotification('¡Propuesta enviada con éxito! Te contactaremos pronto.');
                
                const inputs = form.querySelectorAll('.magical-input, .magical-select, .magical-textarea');
                inputs.forEach(input => {
                    input.style.borderColor = '';
                    input.classList.remove('error');
                });
            }, 2000);
        }, 1500);
    }
    
    showNotification(message) {
        const existingNotification = document.querySelector('.magical-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'magical-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #50c878, #8bc34a);
            color: #0d1b0f;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.5s ease;
            max-width: 300px;
            word-wrap: break-word;
            box-shadow: 0 10px 25px rgba(139, 195, 74, 0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 4000);
    }
    
    initLoadingAnimation() {
        if (this.isReducedMotion) {
            const elements = document.querySelectorAll('.magical-card');
            elements.forEach(element => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
            return;
        }
        
        const elements = document.querySelectorAll('.magical-card');
        
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.8s ease-out';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 200 + (index * 150));
        });
    }
    
    addParticleStyles() {
        if (document.getElementById('particle-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'particle-styles';
        style.textContent = `
            @keyframes particleExplode {
                0% {
                    transform: translate(0, 0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(var(--dx), var(--dy)) scale(0);
                    opacity: 0;
                }
            }
            
            .magical-input.error,
            .magical-select.error,
            .magical-textarea.error {
                animation: shake 0.5s ease-in-out;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            @media (max-width: 768px) {
                .magical-notification {
                    top: 10px !important;
                    right: 10px !important;
                    left: 10px !important;
                    max-width: none !important;
                    transform: translateY(-100%) !important;
                }
                
                .magical-notification.show {
                    transform: translateY(0) !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    handleResize() {
        const oldIsMobile = this.isMobile;
        this.isMobile = window.innerWidth < 768;
        
        if (oldIsMobile !== this.isMobile) {
            this.config.stars.count = this.isMobile ? 50 : 100;
            this.config.stars.maxSize = this.isMobile ? 2 : 3;
        }
        
        if (this.canvas) {
            this.resizeCanvas();
        }
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        const style = document.getElementById('particle-styles');
        if (style) {
            style.remove();
        }
        
        this.isInitialized = false;
    }
}

function initMagicalEffects() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.magicalEffects = new MagicalEffects();
        });
    } else {
        window.magicalEffects = new MagicalEffects();
    }
}

function addAccessibilityFeatures() {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    reducedMotionQuery.addListener((query) => {
        if (query.matches) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
    });
    
    if (reducedMotionQuery.matches) {
        document.body.classList.add('reduced-motion');
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
}

function optimizePerformance() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length && 'IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

function handleErrors() {
    window.addEventListener('error', (e) => {
        console.error('Error detectado:', e.message, e.filename, e.lineno);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Promise rechazada:', e.reason);
    });
}

initMagicalEffects();
addAccessibilityFeatures();
optimizePerformance();
handleErrors();

window.addEventListener('beforeunload', () => {
    if (window.magicalEffects) {
        window.magicalEffects.destroy();
    }
});
