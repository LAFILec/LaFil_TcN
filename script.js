/**
 * Script Principal - Efectos Mágicos de La Fil
 * Versión simplificada y optimizada
 */

class MagicalEffects {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.stars = [];
        this.animationFrame = null;
        this.time = 0;
        this.isInitialized = false;
        
        // Configuración
        this.config = {
            stars: {
                count: 100,
                colors: ['#8bc34a', '#50c878', '#9caf88', '#b8e6b8'],
                minSize: 1,
                maxSize: 3
            }
        };
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        try {
            this.setupEvents();
            this.initStarField();
            this.initScrollEffects();
            this.initFormEffects();
            this.initLoadingAnimation();
            
            this.isInitialized = true;
            console.log('✨ Efectos mágicos inicializados correctamente');
        } catch (error) {
            console.error('Error al inicializar efectos:', error);
        }
    }
    
    setupEvents() {
        // Resize con throttle simple
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 250);
        });
        
        // Scroll con throttle
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => this.handleScroll(), 16);
        }, { passive: true });
        
        // Mouse effects
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true });
        document.addEventListener('click', (e) => this.handleClick(e), { passive: true });
    }
    
    initStarField() {
        this.canvas = document.getElementById('starsCanvas');
        if (!this.canvas) {
            console.warn('Canvas no encontrado');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.createStars();
        this.animateStars();
    }
    
    resizeCanvas() {
        if (!this.canvas || !this.ctx) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        this.createStars();
    }
    
    createStars() {
        if (!this.canvas) return;
        
        this.stars = [];
        const { count, colors, minSize, maxSize } = this.config.stars;
        
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * (maxSize - minSize) + minSize,
                opacity: Math.random() * 0.8 + 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 0.02 + 0.01,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    animateStars() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += 0.01;
        
        this.stars.forEach((star) => {
            // Efecto de parpadeo
            const twinkle = Math.sin(this.time * star.speed + star.phase) * 0.5 + 0.5;
            const alpha = star.opacity * twinkle;
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.fill();
            
            // Movimiento sutil
            star.x += Math.sin(this.time + star.phase) * 0.1;
            star.y += Math.cos(this.time + star.phase) * 0.1;
            
            // Mantener en pantalla
            if (star.x < 0) star.x = this.canvas.width;
            if (star.x > this.canvas.width) star.x = 0;
            if (star.y < 0) star.y = this.canvas.height;
            if (star.y > this.canvas.height) star.y = 0;
        });
        
        this.ctx.globalAlpha = 1;
        this.animationFrame = requestAnimationFrame(() => this.animateStars());
    }
    
    initScrollEffects() {
        const cards = document.querySelectorAll('.magical-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            card.style.transition = 'all 1s ease-out';
        });
        
        this.handleScroll();
    }
    
    handleScroll() {
        const scrolled = window.pageYOffset;
        
        // Parallax para elementos flotantes
        const floatingElements = document.querySelectorAll('.floating-leaf, .magical-sparkle');
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.2;
            element.style.transform = `translateY(${scrolled * speed * -1}px)`;
        });
        
        // Aparición de cards
        const cards = document.querySelectorAll('.magical-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.8) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    }
    
    handleMouseMove(e) {
        // Efecto de inclinación en cards
        const cards = document.querySelectorAll('.magical-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            } else {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            }
        });
    }
    
    handleClick(e) {
        // Efecto de partículas en click
        this.createClickEffect(e.clientX, e.clientY);
    }
    
    createClickEffect(x, y) {
        const colors = ['#8bc34a', '#50c878', '#9caf88'];
        
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
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
                animation: particleExplode 0.8s ease-out forwards;
            `;
            
            const angle = (Math.PI * 2 * i) / 6;
            const distance = 30 + Math.random() * 20;
            particle.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
            
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
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(form);
        });
    }
    
    handleFormSubmit(form) {
        const submitBtn = form.querySelector('.magical-submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Enviando... ✨';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = '¡Enviado! 🌟';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                form.reset();
                this.showNotification('¡Propuesta enviada con éxito!');
            }, 2000);
        }, 1500);
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
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
        }, 3000);
    }
    
    initLoadingAnimation() {
        const elements = document.querySelectorAll('.magical-card, .magical-header');
        
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
    
    handleResize() {
        this.resizeCanvas();
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.isInitialized = false;
    }
}

// Agregar estilos para animaciones de partículas
function addParticleStyles() {
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
    `;
    document.head.appendChild(style);
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    addParticleStyles();
    
    // Crear instancia principal
    window.magicalEffects = new MagicalEffects();
    
    console.log('🌟 La Fil - Portal mágico cargado correctamente');
});

// Limpieza al cerrar
window.addEventListener('beforeunload', () => {
    if (window.magicalEffects) {
        window.magicalEffects.destroy();
    }
});

// Manejo de errores
window.addEventListener('error', (e) => {
    console.error('Error detectado:', e.message);
});