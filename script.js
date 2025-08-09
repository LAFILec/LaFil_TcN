class MagicalEffects {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.stars = [];
        this.magicalParticles = [];
        this.animationFrame = null;
        this.time = 0;
        this.isInitialized = false;
        this.isMobile = window.innerWidth < 768;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.emailService = null;
        
        this.config = {
            stars: {
                count: this.isMobile ? 80 : 150,
                colors: ['#f1c40f', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#e67e22'],
                minSize: 0.5,
                maxSize: this.isMobile ? 2.5 : 4
            },
            particles: {
                count: this.isMobile ? 20 : 40,
                colors: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
            }
        };
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        try {
            this.setupEvents();
            this.initEmailService();
            if (!this.isReducedMotion) {
                this.initMagicalBackground();
                this.initLoadingAnimation();
                this.initScrollMagic();
            }
            this.initFormMagic();
            this.initNavigationMagic();
            this.initCursorMagic();
            this.initScrollProgress();
            this.addMagicalStyles();
            
            this.isInitialized = true;
            console.log('🪄 Magia inicializada correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar la magia:', error);
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
        
        this.debounce = (func, wait) => {
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
        
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));
        window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 16), { passive: true });
        
        if (!this.isMobile && !this.isReducedMotion) {
            document.addEventListener('mousemove', this.throttle((e) => this.handleMouseMove(e), 16), { passive: true });
            document.addEventListener('click', (e) => this.handleMagicalClick(e), { passive: true });
        }

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        motionQuery.addListener((query) => {
            this.isReducedMotion = query.matches;
            this.updateMotionPreferences();
        });
    }
    
    initEmailService() {
        this.emailService = {
            endpoint: 'mailto:lafilec01@gmail.com',
            
            async sendEmail(formData) {
                const subject = encodeURIComponent('Nueva Propuesta Mágica - La Fil');
                const body = encodeURIComponent(
                    `NUEVA PROPUESTA MÁGICA 🪄\n\n` +
                    `Nombre/Marca: ${formData.get('nombre')}\n` +
                    `Email: ${formData.get('email')}\n` +
                    `Teléfono: ${formData.get('telefono') || 'No proporcionado'}\n` +
                    `Categoría: ${formData.get('producto')}\n` +
                    `Experiencia: ${formData.get('experiencia') || 'No especificada'}\n` +
                    `Newsletter: ${formData.get('newsletter') ? 'Sí' : 'No'}\n\n` +
                    `DESCRIPCIÓN:\n${formData.get('descripcion')}\n\n` +
                    `---\nEnviado desde el Portal Mágico de La Fil ✨`
                );
                
                const mailtoLink = `mailto:lafilec01@gmail.com?subject=${subject}&body=${body}`;

                return new Promise((resolve) => {
                    setTimeout(() => {
                        window.location.href = mailtoLink;
                        resolve({ success: true });
                    }, 1500);
                });
            }
        };
    }
    
    

    initMagicalBackground() {
        this.canvas = document.getElementById('starsCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.createMagicalElements();
        this.animateMagicalBackground();
        this.initFloatingParticles();
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
        this.createMagicalElements();
    }
    
    createMagicalElements() {
        if (!this.canvas) return;
        
        this.stars = [];
        this.magicalParticles = [];
        
        const { count, colors, minSize, maxSize } = this.config.stars;
        const rect = this.canvas.getBoundingClientRect();

        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * rect.width,
                y: Math.random() * rect.height,
                size: Math.random() * (maxSize - minSize) + minSize,
                opacity: Math.random() * 0.8 + 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 0.03 + 0.01,
                phase: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                type: Math.random() > 0.7 ? 'magical' : 'normal'
            });
        }

        for (let i = 0; i < this.config.particles.count; i++) {
            this.magicalParticles.push({
                x: Math.random() * rect.width,
                y: Math.random() * rect.height,
                size: Math.random() * 3 + 1,
                color: this.config.particles.colors[Math.floor(Math.random() * this.config.particles.colors.length)],
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: Math.random() * 200 + 100,
                maxLife: 300,
                type: ['sparkle', 'glow', 'shimmer'][Math.floor(Math.random() * 3)]
            });
        }
    }
    
    animateMagicalBackground() {
        if (!this.ctx || !this.canvas || this.isReducedMotion) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        this.time += 0.01;
 
        this.stars.forEach((star) => {
            const twinkle = Math.sin(this.time * star.twinkleSpeed + star.phase) * 0.5 + 0.5;
            const alpha = star.opacity * twinkle;
            
            this.ctx.beginPath();
            if (star.type === 'magical') {
                this.drawMagicalStar(star.x, star.y, star.size, alpha, star.color);
            } else {
                this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                this.ctx.fillStyle = star.color;
                this.ctx.globalAlpha = alpha;
                this.ctx.fill();
            }
   
            star.x += star.vx;
            star.y += star.vy;

            if (star.x < -10) star.x = rect.width + 10;
            if (star.x > rect.width + 10) star.x = -10;
            if (star.y < -10) star.y = rect.height + 10;
            if (star.y > rect.height + 10) star.y = -10;
        });

        this.magicalParticles.forEach((particle, index) => {
            const lifeRatio = particle.life / particle.maxLife;
            const alpha = Math.sin(lifeRatio * Math.PI) * 0.8;
            
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            
            if (particle.type === 'sparkle') {
                this.drawSparkle(particle.x, particle.y, particle.size);
            } else if (particle.type === 'glow') {
                this.drawGlow(particle.x, particle.y, particle.size);
            } else {
                this.drawShimmer(particle.x, particle.y, particle.size);
            }

            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;

            if (particle.life <= 0) {
                particle.x = Math.random() * rect.width;
                particle.y = Math.random() * rect.height;
                particle.life = particle.maxLife;
                particle.vx = (Math.random() - 0.5) * 0.5;
                particle.vy = (Math.random() - 0.5) * 0.5;
            }
        });
        
        this.ctx.globalAlpha = 1;
        this.animationFrame = requestAnimationFrame(() => this.animateMagicalBackground());
    }
    
    drawMagicalStar(x, y, size, alpha, color) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.translate(x, y);
        this.ctx.rotate(this.time * 0.5);
        
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const outerRadius = size * 2;
            const innerRadius = size;
            
            const outerX = Math.cos(angle) * outerRadius;
            const outerY = Math.sin(angle) * outerRadius;
            const innerX = Math.cos(angle + Math.PI / 5) * innerRadius;
            const innerY = Math.sin(angle + Math.PI / 5) * innerRadius;
            
            if (i === 0) {
                this.ctx.moveTo(outerX, outerY);
            } else {
                this.ctx.lineTo(outerX, outerY);
            }
            this.ctx.lineTo(innerX, innerY);
        }
        
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawSparkle(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();

        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
    
    drawGlow(x, y, size) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        gradient.addColorStop(0, this.ctx.fillStyle);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
    
    drawShimmer(x, y, size) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(this.time * 2);
        
        this.ctx.beginPath();
        this.ctx.rect(-size/2, -size/2, size, size);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    initFloatingParticles() {
        const container = document.querySelector('.floating-particles');
        if (!container) return;

        container.innerHTML = '';
        
        const particleCount = this.isMobile ? 5 : 8;
        const emojis = ['✨', '⭐', '🌟', '💫', '🔮', '⚡'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = `particle particle-${i + 1}`;
            particle.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
            particle.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 10 + 15}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 3 + 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
                opacity: ${Math.random() * 0.6 + 0.4};
                z-index: 1;
            `;
            container.appendChild(particle);
        }
    }
    
    initScrollMagic() {
        const observerOptions = {
            threshold: [0, 0.1, 0.5, 1],
            rootMargin: '0px 0px -10% 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.intersectionRatio > 0.1) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.classList.add('magical-reveal');
                        
                        if (entry.target.classList.contains('hero-card')) {
                            this.createMagicalEntrance(entry.target);
                        }
                    }
                } else {
                    if (entry.intersectionRatio === 0) {
                        entry.target.classList.remove('magical-reveal');
                    }
                }
            });
        }, observerOptions);
        
        const cards = document.querySelectorAll('.magical-card, .benefit-item, .testimonial-item');
        cards.forEach(card => {
            if (!this.isReducedMotion) {
                card.style.opacity = '2';
                card.style.transform = 'translateY(0)';
                card.style.transition = 'none'; 
            }

            observer.observe(card);
        });
        
        this.handleScroll();
    }
    
    createMagicalEntrance(element) {
        if (this.isReducedMotion) return;

        const rect = element.getBoundingClientRect();
        const particles = [];
        
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: #ffd700;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${rect.left + rect.width/2}px;
                top: ${rect.top + rect.height/2}px;
            `;
            
            document.body.appendChild(particle);
            particles.push(particle);
            
            const angle = (i / 12) * Math.PI * 2;
            const distance = 100;
            const targetX = Math.cos(angle) * distance;
            const targetY = Math.sin(angle) * distance;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${targetX}px, ${targetY}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out'
            }).onfinish = () => {
                particle.remove();
            };
        }
    }
    
    initFormMagic() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        
        const inputs = form.querySelectorAll('.magical-input, .magical-select, .magical-textarea');
        const submitBtn = form.querySelector('.magical-submit-btn');
        const charCounter = document.getElementById('char-count');
        const descriptionField = document.getElementById('descripcion');

        if (descriptionField && charCounter) {
            descriptionField.addEventListener('input', (e) => {
                const count = e.target.value.length;
                charCounter.textContent = count;
                
                if (count > 1800) {
                    charCounter.style.color = '#e74c3c';
                } else if (count > 1500) {
                    charCounter.style.color = '#f39c12';
                } else {
                    charCounter.style.color = '#2ecc71';
                }
            });
        }
 
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.addInputMagic(input, 'focus');
            });
            
            input.addEventListener('blur', () => {
                this.addInputMagic(input, 'blur');
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.validateField(input);
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (await this.handleMagicalSubmit(form)) {
                this.showMagicalSuccess();
            }
        });
  
        if (submitBtn) {
            submitBtn.addEventListener('mouseenter', () => {
                if (!this.isMobile) {
                    this.createButtonSparkles(submitBtn);
                }
            });
        }
    }
    
    addInputMagic(input, type) {
        if (this.isReducedMotion) return;
        
        const rect = input.getBoundingClientRect();
        
        if (type === 'focus') {
            input.style.borderColor = '#9b59b6';
            input.style.boxShadow = '0 0 15px rgba(155, 89, 182, 0.4)';
            input.style.transform = 'scale(1.02)';
 
            this.createInputParticles(rect, '#9b59b6');
        } else {
            input.style.borderColor = '';
            input.style.boxShadow = '';
            input.style.transform = 'scale(1)';
        }
    }
    
    createInputParticles(rect, color) {
        const particleCount = 6;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 3px;
                height: 3px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + Math.random() * rect.height}px;
            `;
            
            document.body.appendChild(particle);
            
            particle.animate([
                { opacity: 1, transform: 'scale(1) translateY(0)' },
                { opacity: 0, transform: 'scale(0) translateY(-20px)' }
            ], {
                duration: 800,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
    }
    
    validateField(field) {
        const value = field.value.trim();
        const errorElement = document.getElementById(`${field.name}-error`);
        let isValid = true;
        let errorMessage = '';

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Este campo es requerido para completar tu hechizo';
        } else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Tu lechuza digital necesita una dirección válida';
            }
        } else if (field.name === 'descripcion' && value.length < 50) {
            isValid = false;
            errorMessage = 'Cuéntanos más sobre tu magia (mínimo 50 caracteres)';
        } else if (field.name === 'nombre' && value.length < 2) {
            isValid = false;
            errorMessage = 'Tu nombre mágico debe tener al menos 2 caracteres';
        }

        if (isValid) {
            field.style.borderColor = '#2ecc71';
            field.classList.remove('error');
            if (errorElement) errorElement.textContent = '';
        } else {
            field.style.borderColor = '#e74c3c';
            field.classList.add('error');
            if (errorElement) errorElement.textContent = errorMessage;
            
            if (!this.isReducedMotion) {
                field.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => field.style.animation = '', 500);
            }
        }
        
        return isValid;
    }
    
    async handleMagicalSubmit(form) {
        const submitBtn = form.querySelector('.magical-submit-btn');
        const btnContent = submitBtn.querySelector('.btn-content');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        const inputs = form.querySelectorAll('.magical-input, .magical-select, .magical-textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showMagicalError('Por favor corrige los errores antes de enviar tu propuesta mágica');
            return false;
        }
        
        btnContent.style.display = 'none';
        btnLoading.style.display = 'flex';
        submitBtn.disabled = true;
        submitBtn.style.transform = 'scale(0.98)';
        
        try {
            const formData = new FormData(form);
            const result = await this.emailService.sendEmail(formData);
            
            if (result.success) {
                form.reset();
                inputs.forEach(input => {
                    input.style.borderColor = '';
                    input.classList.remove('error');
                    const errorElement = document.getElementById(`${input.name}-error`);
                    if (errorElement) errorElement.textContent = '';
                });
                
                const charCounter = document.getElementById('char-count');
                if (charCounter) charCounter.textContent = '0';
                
                return true;
            }
        } catch (error) {
            console.error('Error al enviar propuesta:', error);
            this.showMagicalError('Hubo un problema al enviar tu propuesta. Inténtalo de nuevo.');
        } finally {
            setTimeout(() => {
                btnContent.style.display = 'flex';
                btnLoading.style.display = 'none';
                submitBtn.disabled = false;
                submitBtn.style.transform = 'scale(1)';
            }, 2000);
        }
        
        return false;
    }
    
    showMagicalSuccess() {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.style.display = 'block';
            successMessage.style.opacity = '0';
            successMessage.style.transform = 'translateY(20px)';
            
            requestAnimationFrame(() => {
                successMessage.style.transition = 'all 0.5s ease';
                successMessage.style.opacity = '1';
                successMessage.style.transform = 'translateY(0)';
            });
            
            this.createCelebration();
            
            setTimeout(() => {
                successMessage.style.opacity = '0';
                successMessage.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 500);
            }, 5000);
        }
    }
    
    showMagicalError(message) {
        this.showNotification(message, 'error');
    }
    
    createCelebration() {
        if (this.isReducedMotion) return;
        
        const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
        const emojis = ['🎉', '✨', '🌟', '💫', '🎊'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const celebration = document.createElement('div');
                celebration.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
                celebration.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * window.innerWidth}px;
                    top: -20px;
                    font-size: ${Math.random() * 15 + 20}px;
                    pointer-events: none;
                    z-index: 10000;
                `;
                
                document.body.appendChild(celebration);
                
                celebration.animate([
                    { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                    { transform: `translateY(${window.innerHeight + 100}px) rotate(360deg)`, opacity: 0 }
                ], {
                    duration: Math.random() * 2000 + 3000,
                    easing: 'ease-in'
                }).onfinish = () => celebration.remove();
            }, i * 100);
        }
    }
    
    initNavigationMagic() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        
        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                const isActive = navMenu.classList.toggle('active');
                mobileToggle.classList.toggle('active');
                
                if (!this.isReducedMotion) {
                    if (isActive) {
                        this.animateMenuOpen(navMenu);
                    } else {
                        this.animateMenuClose(navMenu);
                    }
                }
            });
        }
        
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                if (!this.isMobile && !this.isReducedMotion) {
                    this.createLinkSparkles(link);
                }
            });
            
            link.addEventListener('click', (e) => {
                this.createClickEffect(e.clientX, e.clientY, '#ffd700');
                
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                }
            });
        });
    }
    
    animateMenuOpen(menu) {
        const items = menu.querySelectorAll('li');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }
    
    animateMenuClose(menu) {
        const items = menu.querySelectorAll('li');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
            }, index * 50);
        });
    }
    
    createLinkSparkles(link) {
        const rect = link.getBoundingClientRect();
        const sparkles = 3;
        
        for (let i = 0; i < sparkles; i++) {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '✨';
            sparkle.style.cssText = `
                position: fixed;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + Math.random() * rect.height}px;
                font-size: 12px;
                pointer-events: none;
                z-index: 9999;
            `;
            
            document.body.appendChild(sparkle);
            
            sparkle.animate([
                { opacity: 0, transform: 'scale(0) translateY(0)' },
                { opacity: 1, transform: 'scale(1) translateY(-10px)' },
                { opacity: 0, transform: 'scale(0) translateY(-20px)' }
            ], {
                duration: 1000,
                easing: 'ease-out'
            }).onfinish = () => sparkle.remove();
        }
    }
    
    initCursorMagic() {
        if (this.isMobile || this.isReducedMotion) return;
        
        const trail = document.getElementById('cursorTrail');
        if (!trail) return;
        
        let lastX = 0, lastY = 0;
        let particles = [];
        
        document.addEventListener('mousemove', (e) => {
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                this.createTrailParticle(e.clientX, e.clientY, particles);
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });
        
        const updateTrail = () => {
            particles.forEach((particle, index) => {
                particle.life--;
                particle.element.style.opacity = particle.life / 30;
                particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px) scale(${particle.life / 30})`;
                
                if (particle.life <= 0) {
                    particle.element.remove();
                    particles.splice(index, 1);
                }
            });
            
            requestAnimationFrame(updateTrail);
        };
        updateTrail();
    }
    
    createTrailParticle(x, y, particles) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, #ffd700, transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
        `;
        
        document.body.appendChild(particle);
        
        particles.push({
            element: particle,
            x: x - 2,
            y: y - 2,
            life: 30
        });
    }
    
    initScrollProgress() {
        const progressBar = document.querySelector('.scroll-progress');
        if (!progressBar) return;
        
        const updateProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            
            progressBar.style.width = `${Math.min(progress, 100)}px`;
            progressBar.style.background = `linear-gradient(90deg, 
                #ffd700 0%, 
                #ff6b6b 25%, 
                #4ecdc4 50%, 
                #45b7d1 75%, 
                #9b59b6 100%)`;
        };
        
        window.addEventListener('scroll', this.throttle(updateProgress, 16), { passive: true });
    }
    
    handleScroll() {
        if (this.isReducedMotion) return;
        
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        const floatingElements = document.querySelectorAll('.floating-element, .magical-aura, .floating-letters span');
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.1;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
        
        const background = document.querySelector('.magical-background');
        if (background) {
            background.style.transform = `translateY(${rate}px)`;
        }
        

        const cards = document.querySelectorAll('.magical-card');
        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                const transform = Math.max(0, Math.min(1, progress));
                
                if (!this.isReducedMotion) {
                    card.style.transform = `translateY(${(1 - transform) * 20}px)`;
                    card.style.opacity = 1;
                }
            }
        });
    }
    
    handleMouseMove(e) {
        if (this.isMobile) return;
        
        const cards = document.querySelectorAll('.magical-card:not(.form-card)');
        const maxTilt = 1.5; 
        
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = (e.clientX - centerX) / (rect.width / 1.8); 
            const deltaY = (e.clientY - centerY) / (rect.height / 1.8); 
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance < 1.0) { 
                const rotateX = deltaY * maxTilt * 0.3; 
                const rotateY = deltaX * maxTilt * -0.3; 
                
                card.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                card.style.transform = `
                    perspective(1000px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg) 
                    scale(${scale})
                    translateZ(5px)
                `;
                card.style.boxShadow = `0 ${10 + distance * 2}px ${20 + distance * 3}px rgba(155, 89, 182, 0.2)`;
            } else {
                card.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease-out';
                card.style.transform = `
                    perspective(1000px) 
                    rotateX(0deg) 
                    rotateY(0deg) 
                    scale(1)
                    translateZ(0px)
                `;
                card.style.boxShadow = '';
            }
        });
        
        this.updateCustomCursor(e.clientX, e.clientY);
    }
    
    updateCustomCursor(x, y) {
        const cursor = document.querySelector('.cursor-trail');
        if (cursor) {
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
        }
    }
    
    handleMagicalClick(e) {
        this.createClickEffect(e.clientX, e.clientY);
 
        if (e.target.classList.contains('magical-submit-btn') || 
            e.target.closest('.magical-submit-btn')) {
            this.createButtonMagic(e.target);
        }
    }
    
    createClickEffect(x, y, customColor = null) {
        if (this.isReducedMotion) return;
        
        const colors = customColor ? [customColor] : ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
        const particleCount = this.isMobile ? 6 : 12;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 30 + Math.random() * 20;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: ${Math.random() * 4 + 3}px;
                height: ${Math.random() * 4 + 3}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                --dx: ${dx}px;
                --dy: ${dy}px;
            `;
            
            document.body.appendChild(particle);
            
            particle.animate([
                { 
                    transform: 'translate(0, 0) scale(1)', 
                    opacity: 1 
                },
                { 
                    transform: 'translate(var(--dx), var(--dy)) scale(0)', 
                    opacity: 0 
                }
            ], {
                duration: 800 + Math.random() * 400,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            border: 2px solid ${colors[0] || '#ffd700'};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
        `;
        
        document.body.appendChild(ripple);
        
        ripple.animate([
            { width: '4px', height: '4px', opacity: 1 },
            { width: '100px', height: '100px', opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => ripple.remove();
    }
    
    createButtonMagic(button) {
        if (this.isReducedMotion) return;
        
        const rect = button.getBoundingClientRect();
        const sparkleCount = 15;
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = ['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)];
            sparkle.style.cssText = `
                position: fixed;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + Math.random() * rect.height}px;
                font-size: ${Math.random() * 8 + 12}px;
                pointer-events: none;
                z-index: 9999;
            `;
            
            document.body.appendChild(sparkle);
            
            sparkle.animate([
                { 
                    opacity: 0, 
                    transform: 'scale(0) rotate(0deg) translateY(0px)' 
                },
                { 
                    opacity: 1, 
                    transform: 'scale(1) rotate(180deg) translateY(-20px)' 
                },
                { 
                    opacity: 0, 
                    transform: 'scale(0) rotate(360deg) translateY(-40px)' 
                }
            ], {
                duration: 1500,
                easing: 'ease-out'
            }).onfinish = () => sparkle.remove();
        }
    }
    
    createButtonSparkles(button) {
        if (this.isReducedMotion) return;
        
        const rect = button.getBoundingClientRect();
        const sparkles = 5;
        
        for (let i = 0; i < sparkles; i++) {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '✨';
            sparkle.style.cssText = `
                position: fixed;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top - 10 + Math.random() * (rect.height + 20)}px;
                font-size: 10px;
                pointer-events: none;
                z-index: 9999;
            `;
            
            document.body.appendChild(sparkle);
            
            sparkle.animate([
                { opacity: 0, transform: 'scale(0) translateX(0)' },
                { opacity: 1, transform: 'scale(1) translateX(5px)' },
                { opacity: 0, transform: 'scale(0) translateX(10px)' }
            ], {
                duration: 1000,
                easing: 'ease-out'
            }).onfinish = () => sparkle.remove();
        }
    }
    
    handleKeyboard(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
        
        if (e.key === 'Escape') {
            const navMenu = document.querySelector('.nav-menu');
            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        }
        
        this.konamiCode = this.konamiCode || [];
        const konamiSequence = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'KeyB', 'KeyA'
        ];
        
        this.konamiCode.push(e.code);
        if (this.konamiCode.length > konamiSequence.length) {
            this.konamiCode.shift();
        }
        
        if (this.konamiCode.join(',') === konamiSequence.join(',')) {
            this.activateEasterEgg();
        }
    }
    
    activateEasterEgg() {
        const message = "🪄 ¡Has descubierto el código mágico! La Fil te saluda, mago experto.";
        this.showNotification(message, 'magic');
        
        if (!this.isReducedMotion) {
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    this.createClickEffect(
                        Math.random() * window.innerWidth,
                        Math.random() * window.innerHeight,
                        '#9b59b6'
                    );
                }, i * 100);
            }
        }
    }
    
    showNotification(message, type = 'info') {
        const existing = document.querySelector('.magical-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'magical-notification';
        
        const colors = {
            info: 'linear-gradient(135deg, #3498db, #2980b9)',
            success: 'linear-gradient(135deg, #2ecc71, #27ae60)',
            error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            warning: 'linear-gradient(135deg, #f39c12, #e67e22)',
            magic: 'linear-gradient(135deg, #9b59b6, #8e44ad)'
        };
        
        const icons = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warning: '⚠️',
            magic: '🪄'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 15px;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            max-width: 350px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            border: 2px solid rgba(255,255,255,0.2);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">${icons[type]}</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }, type === 'magic' ? 6000 : 4000);
  
        notification.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    updateMotionPreferences() {
        if (this.isReducedMotion) {
            document.body.classList.add('reduced-motion');
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
        } else {
            document.body.classList.remove('reduced-motion');
            if (!this.animationFrame && this.canvas) {
                this.animateMagicalBackground();
            }
        }
    }
    
    handleResize() {
        const oldIsMobile = this.isMobile;
        this.isMobile = window.innerWidth < 768;
        
        if (oldIsMobile !== this.isMobile) {
            this.config.stars.count = this.isMobile ? 80 : 150;
            this.config.stars.maxSize = this.isMobile ? 2.5 : 4;
            this.config.particles.count = this.isMobile ? 20 : 40;
        
            this.initFloatingParticles();
        }
        
        if (this.canvas) {
            this.resizeCanvas();
        }
    
        if (!this.isMobile) {
            const navMenu = document.querySelector('.nav-menu');
            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        }
    }
    
    addMagicalStyles() {
        if (document.getElementById('magical-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'magical-styles';
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                25% { transform: translateY(-10px) rotate(5deg); }
                50% { transform: translateY(-15px) rotate(0deg); }
                75% { transform: translateY(-5px) rotate(-5deg); }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                50% { transform: translateX(5px); }
                75% { transform: translateX(-3px); }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
            }
            
            @keyframes sparkle {
                0% { opacity: 0; transform: scale(0) rotate(0deg); }
                50% { opacity: 1; transform: scale(1) rotate(180deg); }
                100% { opacity: 0; transform: scale(0) rotate(360deg); }
            }
            
            @keyframes glow {
                0%, 100% { box-shadow: 0 0 5px currentColor; }
                50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
            }
            
            .magical-reveal {
                animation: magicalReveal 1s ease-out forwards;
            }
            
            @keyframes magicalReveal {
                0% {
                    opacity: 0;
                    transform: translateY(50px) scale(0.9);
                }
                70% {
                    opacity: 0.8;
                    transform: translateY(-5px) scale(1.02);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .keyboard-navigation *:focus {
                outline: 2px solid #ffd700 !important;
                outline-offset: 2px !important;
                border-radius: 4px !important;
            }
            
            .reduced-motion * {
                animation: none !important;
                transition: none !important;
            }
            
            .cursor-trail {
                position: fixed;
                width: 20px;
                height: 20px;
                background: radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9997;
                transition: all 0.1s ease;
            }
            
            .loading-spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid #ffffff30;
                border-top: 2px solid #ffffff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Responsive styles */
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
                
                .cursor-trail {
                    display: none;
                }
            }
            
            /* Accesibilidad */
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        const style = document.getElementById('magical-styles');
        if (style) style.remove();
   
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('click', this.handleMagicalClick);
        document.removeEventListener('keydown', this.handleKeyboard);
        
        this.isInitialized = false;
        console.log('🪄 Magia destruida correctamente');
    }
}

function initMagicalWorld() {
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
        document.body.classList.toggle('reduced-motion', query.matches);
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
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.left = '10px';
        skipLink.style.top = '10px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.left = '-9999px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

function optimizePerformance() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            console.log('Service Worker no disponible');
        });
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
        }, { rootMargin: '50px' });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    const preconnectLinks = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
    ];
    
    preconnectLinks.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        document.head.appendChild(link);
    });
}

function handleErrors() {
    window.addEventListener('error', (e) => {
        console.error('Error detectado:', {
            message: e.message,
            filename: e.filename,
            line: e.lineno,
            column: e.colno,
            error: e.error
        });
        
        if (e.message.includes('Script error')) {
            return; 
        }
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Promise rechazada:', e.reason);

        e.preventDefault();
    });
}

initMagicalWorld();
addAccessibilityFeatures();
optimizePerformance();
handleErrors();

window.addEventListener('beforeunload', () => {
    if (window.magicalEffects) {
        window.magicalEffects.destroy();
    }
});

function createMagicalLoader() {
    const loader = document.querySelector('.magical-loader');
    if (!loader) return;
    
    const snitch = loader.querySelector('.golden-snitch');
    if (snitch) {
        snitch.style.animation = 'snitchFloat 2s ease-in-out infinite';
    }
    
    const loadingText = loader.querySelector('.loading-text');
    if (loadingText) {
        const text = loadingText.textContent;
        loadingText.innerHTML = '';
        
        [...text].forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.animationDelay = `${index * 0.1}s`;
            span.style.animation = 'magicalFade 2s ease-in-out infinite';
            loadingText.appendChild(span);
        });
    }
}

function enhanceFormInteractions() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const textarea = form.querySelector('textarea');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }
    
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        let timeout;
        
        input.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                validateFieldWithAnimation(input);
            }, 300);
        });

        if (input.type === 'email') {
            input.addEventListener('blur', () => {
                const value = input.value.toLowerCase();
                if (value && !value.includes('@')) {
                    const commonDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
                    const suggestion = `${value}@${commonDomains[0]}`;
    
                    showEmailSuggestion(input, suggestion);
                }
            });
        }
    });
}

function validateFieldWithAnimation(field) {
    const isValid = window.magicalEffects?.validateField(field);
    
    if (isValid) {
        createSuccessEffect(field);
    }
}

function createSuccessEffect(element) {
    if (!element || window.magicalEffects?.isReducedMotion) return;
    
    const rect = element.getBoundingClientRect();
    const checkmark = document.createElement('div');
    checkmark.innerHTML = '✓';
    checkmark.style.cssText = `
        position: fixed;
        left: ${rect.right - 25}px;
        top: ${rect.top + rect.height / 2 - 10}px;
        color: #2ecc71;
        font-size: 20px;
        font-weight: bold;
        pointer-events: none;
        z-index: 9999;
    `;
    
    document.body.appendChild(checkmark);
    
    checkmark.animate([
        { opacity: 0, transform: 'scale(0) rotate(-180deg)' },
        { opacity: 1, transform: 'scale(1.2) rotate(0deg)' },
        { opacity: 0, transform: 'scale(0) rotate(180deg)' }
    ], {
        duration: 1200,
        easing: 'ease-out'
    }).onfinish = () => checkmark.remove();
}

function showEmailSuggestion(input, suggestion) {
    const existingSuggestion = document.querySelector('.email-suggestion');
    if (existingSuggestion) existingSuggestion.remove();
    
    const suggestionEl = document.createElement('div');
    suggestionEl.className = 'email-suggestion';
    suggestionEl.style.cssText = `
        position: absolute;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 14px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-top: 2px;
        left: 0;
        right: 0;
    `;
    suggestionEl.innerHTML = `¿Quisiste decir: <strong>${suggestion}</strong>?`;
    
    const container = input.parentNode;
    container.style.position = 'relative';
    container.appendChild(suggestionEl);
    
    suggestionEl.addEventListener('click', () => {
        input.value = suggestion;
        input.dispatchEvent(new Event('input'));
        suggestionEl.remove();
    });
    
    setTimeout(() => {
        if (suggestionEl.parentNode) {
            suggestionEl.remove();
        }
    }, 5000);
    
    const hideOnInput = () => {
        suggestionEl.remove();
        input.removeEventListener('input', hideOnInput);
    };
    input.addEventListener('input', hideOnInput);
}

function addAdvancedAnimations() {
    const benefitItems = document.querySelectorAll('.benefit-item');
    benefitItems.forEach((item, index) => {
        if (window.magicalEffects?.isReducedMotion) return;
        
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-5px) scale(1.02)';
            item.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
            
            const house = item.classList.contains('house-gryffindor') ? 'gryffindor' :
                         item.classList.contains('house-hufflepuff') ? 'hufflepuff' :
                         item.classList.contains('house-ravenclaw') ? 'ravenclaw' :
                         item.classList.contains('house-slytherin') ? 'slytherin' : '';
            
            if (house) {
                createHouseEffect(item, house);
            }
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
            item.style.boxShadow = '';
        });
    });
    
    const testimonials = document.querySelectorAll('.testimonial-item');
    testimonials.forEach(testimonial => {
        testimonial.addEventListener('mouseenter', () => {
            if (!window.magicalEffects?.isReducedMotion) {
                createTestimonialEffect(testimonial);
            }
        });
    });
}

function createHouseEffect(element, house) {
    const colors = {
        gryffindor: ['#740001', '#eeba30'],
        hufflepuff: ['#ecb939', '#726255'],
        ravenclaw: ['#0e1a40', '#946b2d'],
        slytherin: ['#1a472a', '#aaaaaa']
    };
    
    const houseColors = colors[house] || colors.gryffindor;
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 3px;
            height: 3px;
            background: ${houseColors[Math.floor(Math.random() * houseColors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${rect.left + Math.random() * rect.width}px;
            top: ${rect.top + Math.random() * rect.height}px;
        `;
        
        document.body.appendChild(particle);
        
        particle.animate([
            { opacity: 1, transform: 'translateY(0) scale(1)' },
            { opacity: 0, transform: 'translateY(-30px) scale(0)' }
        ], {
            duration: 1500,
            easing: 'ease-out'
        }).onfinish = () => particle.remove();
    }
}

function createTestimonialEffect(testimonial) {
    const rect = testimonial.getBoundingClientRect();
    const quotes = ['"', '"', '❝', '❞'];
    
    quotes.forEach((quote, index) => {
        const quoteEl = document.createElement('div');
        quoteEl.textContent = quote;
        quoteEl.style.cssText = `
            position: fixed;
            font-size: 24px;
            color: rgba(155, 89, 182, 0.6);
            pointer-events: none;
            z-index: 9999;
            left: ${rect.left + (index % 2 === 0 ? -10 : rect.width + 10)}px;
            top: ${rect.top + (index < 2 ? -10 : rect.height + 10)}px;
        `;
        
        document.body.appendChild(quoteEl);
        
        quoteEl.animate([
            { opacity: 0, transform: 'scale(0)' },
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0)' }
        ], {
            duration: 2000,
            easing: 'ease-in-out'
        }).onfinish = () => quoteEl.remove();
    });
}

function initializeSeasonalEffects() {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    
    if (month === 9) {
        addHalloweenEffects();
    }
    else if (month === 11) {
        addChristmasEffects();
    }
    else if (month === 6 && day === 31) {
        addHarryPotterDayEffects();
    }
}

function addHalloweenEffects() {
    if (window.magicalEffects?.isReducedMotion) return;
    
    const halloweenParticles = ['🦇', '🎃', '👻', '🕷️', '🕸️'];
    
    setInterval(() => {
        if (Math.random() < 0.1) { 
            const particle = document.createElement('div');
            particle.textContent = halloweenParticles[Math.floor(Math.random() * halloweenParticles.length)];
            particle.style.cssText = `
                position: fixed;
                top: -20px;
                left: ${Math.random() * window.innerWidth}px;
                font-size: ${Math.random() * 10 + 20}px;
                pointer-events: none;
                z-index: 1;
                opacity: 0.7;
            `;
            
            document.body.appendChild(particle);
            
            particle.animate([
                { transform: 'translateY(0) rotate(0deg)' },
                { transform: `translateY(${window.innerHeight + 50}px) rotate(360deg)` }
            ], {
                duration: Math.random() * 3000 + 5000,
                easing: 'linear'
            }).onfinish = () => particle.remove();
        }
    }, 1000);
}

function addChristmasEffects() {
    if (window.magicalEffects?.isReducedMotion) return;
    
    const christmasParticles = ['❄️', '⭐', '🎄', '🎁', '✨'];
    
    setInterval(() => {
        if (Math.random() < 0.15) { 
            const particle = document.createElement('div');
            particle.textContent = christmasParticles[Math.floor(Math.random() * christmasParticles.length)];
            particle.style.cssText = `
                position: fixed;
                top: -20px;
                left: ${Math.random() * window.innerWidth}px;
                font-size: ${Math.random() * 8 + 16}px;
                pointer-events: none;
                z-index: 1;
                opacity: 0.8;
            `;
            
            document.body.appendChild(particle);
            
            const duration = particle.textContent === '❄️' ? 
                Math.random() * 2000 + 4000 : 
                Math.random() * 3000 + 3000;
            
            particle.animate([
                { transform: 'translateY(0) rotate(0deg)' },
                { transform: `translateY(${window.innerHeight + 50}px) rotate(${Math.random() * 360}deg)` }
            ], {
                duration: duration,
                easing: 'linear'
            }).onfinish = () => particle.remove();
        }
    }, 800);
}

function addHarryPotterDayEffects() {

    const specialMessage = "🎂 ¡Feliz cumpleaños, Mago! Que la magia te acompañe siempre.";
    
    setTimeout(() => {
        if (window.magicalEffects) {
            window.magicalEffects.showNotification(specialMessage, 'magic');
        }
    }, 2000);
    
    if (!window.magicalEffects?.isReducedMotion) {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const lightning = document.createElement('div');
                lightning.textContent = '⚡';
                lightning.style.cssText = `
                    position: fixed;
                    top: -20px;
                    left: ${Math.random() * window.innerWidth}px;
                    font-size: ${Math.random() * 15 + 25}px;
                    pointer-events: none;
                    z-index: 9999;
                    color: #ffd700;
                `;
                
                document.body.appendChild(lightning);
                
                lightning.animate([
                    { opacity: 0, transform: 'translateY(0) rotate(0deg) scale(0)' },
                    { opacity: 1, transform: 'translateY(50px) rotate(180deg) scale(1)' },
                    { opacity: 0, transform: 'translateY(100px) rotate(360deg) scale(0)' }
                ], {
                    duration: 2000,
                    easing: 'ease-out'
                }).onfinish = () => lightning.remove();
            }, i * 200);
        }
    }
}

function initializeAllFeatures() {
    createMagicalLoader();
    enhanceFormInteractions();
    addAdvancedAnimations();
    initializeSeasonalEffects();
    
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
        @keyframes snitchFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-15px) rotate(90deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
            75% { transform: translateY(-10px) rotate(270deg); }
        }
        
        @keyframes magicalFade {
            0%, 100% { opacity: 0.5; color: #9b59b6; }
            50% { opacity: 1; color: #ffd700; }
        }
        
        .email-suggestion:hover {
            background: #e9ecef !important;
            transform: translateY(-1px);
        }
        
        .golden-snitch {
            display: inline-block;
            font-size: 30px;
        }
        
        .snitch-body::before {
            content: "🟡";
        }
        
        .snitch-wings::before {
            content: "🪶";
            position: absolute;
            left: -10px;
            animation: wingFlutter 0.5s ease-in-out infinite alternate;
        }
        
        .snitch-wings::after {
            content: "🪶";
            position: absolute;
            right: -10px;
            animation: wingFlutter 0.5s ease-in-out infinite alternate-reverse;
        }
        
        @keyframes wingFlutter {
            0% { transform: rotate(-10deg); }
            100% { transform: rotate(10deg); }
        }
    `;
    
    document.head.appendChild(additionalStyles);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllFeatures);
} else {
    initializeAllFeatures();
}

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugMagic = {
        effects: () => window.magicalEffects,
        triggerCelebration: () => window.magicalEffects?.createCelebration(),
        triggerEasterEgg: () => window.magicalEffects?.activateEasterEgg(),
        showNotification: (msg, type) => window.magicalEffects?.showNotification(msg, type),
        particleCount: () => {
            const canvas = document.getElementById('starsCanvas');
            return canvas ? window.magicalEffects?.stars?.length || 0 : 0;
        }
    };
    
    console.log(`
    🪄 ¡Modo Debug Activado! 
    Usa window.debugMagic para explorar los efectos mágicos:
    
    - debugMagic.triggerCelebration() - Crear celebración
    - debugMagic.triggerEasterEgg() - Activar easter egg
    - debugMagic.showNotification('mensaje', 'tipo') - Mostrar notificación
    - debugMagic.particleCount() - Contar partículas activas
    `);
}

