// Animations and visual effects for CareConnect

class CareConnectAnimations {
    constructor() {
        this.initializeAnimations();
    }

    initializeAnimations() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupLoadingAnimations();
        this.setupParallaxEffects();
        this.setupCounterAnimations();
    }

    setupScrollAnimations() {
        // Intersection Observer for scroll-triggered animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll(
            '.service-card, .counselor-card, .feature-card, .stat-item, .contact-item'
        );

        animateElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    animateElement(element) {
        const animationType = element.dataset.animation || 'fadeInUp';
        
        element.classList.add('animated', animationType);
        
        // Remove animation class after animation completes
        element.addEventListener('animationend', () => {
            element.classList.remove('animated', animationType);
        }, { once: true });
    }

    setupHoverEffects() {
        // Card hover effects
        const cards = document.querySelectorAll('.service-card, .counselor-card, .feature-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.addHoverEffect(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.removeHoverEffect(card);
            });
        });

        // Button hover effects
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.addButtonHoverEffect(button);
            });
            
            button.addEventListener('mouseleave', () => {
                this.removeButtonHoverEffect(button);
            });
        });
    }

    addHoverEffect(element) {
        element.style.transform = 'translateY(-8px) scale(1.02)';
        element.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
    }

    removeHoverEffect(element) {
        element.style.transform = 'translateY(0) scale(1)';
        element.style.boxShadow = '';
    }

    addButtonHoverEffect(button) {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
    }

    removeButtonHoverEffect(button) {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '';
    }

    setupLoadingAnimations() {
        // Loading spinner for async operations
        this.createLoadingSpinner();
        
        // Skeleton loading for content
        this.setupSkeletonLoading();
    }

    createLoadingSpinner() {
        const spinnerHTML = `
            <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
            </div>
        `;

        // Add spinner styles
        const spinnerStyles = `
            .loading-spinner {
                display: inline-block;
                position: relative;
                width: 40px;
                height: 40px;
            }

            .spinner-ring {
                position: absolute;
                width: 100%;
                height: 100%;
                border: 3px solid transparent;
                border-top: 3px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1.2s linear infinite;
            }

            .spinner-ring:nth-child(2) {
                border-top-color: var(--secondary-color);
                animation-delay: -0.4s;
            }

            .spinner-ring:nth-child(3) {
                border-top-color: var(--accent-color);
                animation-delay: -0.8s;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;

        this.injectStyles(spinnerStyles);
    }

    setupSkeletonLoading() {
        const skeletonStyles = `
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: var(--radius-md);
            }

            .skeleton-text {
                height: 1em;
                margin-bottom: 0.5em;
            }

            .skeleton-text:last-child {
                width: 60%;
            }

            .skeleton-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
            }

            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `;

        this.injectStyles(skeletonStyles);
    }

    setupParallaxEffects() {
        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    setupCounterAnimations() {
        // Animate counters when they come into view
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => counterObserver.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.target || element.textContent.replace(/[^\d]/g, ''));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            const suffix = element.dataset.suffix || '';
            element.textContent = Math.floor(current) + suffix;
        }, 16);
    }

    // Modal animations
    animateModalOpen(modal) {
        modal.style.display = 'block';
        modal.style.opacity = '0';
        
        setTimeout(() => {
            modal.style.opacity = '1';
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.transform = 'scale(0.8) translateY(-50px)';
                content.style.opacity = '0';
                
                setTimeout(() => {
                    content.style.transform = 'scale(1) translateY(0)';
                    content.style.opacity = '1';
                }, 50);
            }
        }, 10);
    }

    animateModalClose(modal) {
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.style.transform = 'scale(0.8) translateY(-50px)';
            content.style.opacity = '0';
        }
        
        modal.style.opacity = '0';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Page transition animations
    animatePageTransition() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.remove();
        }, 600);
    }

    // Success/error animations
    animateSuccess(element) {
        element.classList.add('success-animation');
        setTimeout(() => {
            element.classList.remove('success-animation');
        }, 1000);
    }

    animateError(element) {
        element.classList.add('error-animation');
        setTimeout(() => {
            element.classList.remove('error-animation');
        }, 1000);
    }

    // Pulse animation for important elements
    addPulseAnimation(element) {
        element.classList.add('pulse-animation');
    }

    removePulseAnimation(element) {
        element.classList.remove('pulse-animation');
    }

    // Floating animation
    addFloatingAnimation(element) {
        element.classList.add('floating-animation');
    }

    // Bounce animation
    addBounceAnimation(element) {
        element.classList.add('bounce-animation');
        setTimeout(() => {
            element.classList.remove('bounce-animation');
        }, 1000);
    }

    // Shake animation for errors
    addShakeAnimation(element) {
        element.classList.add('shake-animation');
        setTimeout(() => {
            element.classList.remove('shake-animation');
        }, 500);
    }

    // Inject CSS styles
    injectStyles(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }
}

// Initialize animations
let animationsInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    animationsInstance = new CareConnectAnimations();
});

// Animation CSS
const animationStyles = `
    /* Fade animations */
    .fadeIn {
        animation: fadeIn 0.6s ease-out;
    }

    .fadeInUp {
        animation: fadeInUp 0.6s ease-out;
    }

    .fadeInDown {
        animation: fadeInDown 0.6s ease-out;
    }

    .fadeInLeft {
        animation: fadeInLeft 0.6s ease-out;
    }

    .fadeInRight {
        animation: fadeInRight 0.6s ease-out;
    }

    /* Slide animations */
    .slideInUp {
        animation: slideInUp 0.6s ease-out;
    }

    .slideInDown {
        animation: slideInDown 0.6s ease-out;
    }

    .slideInLeft {
        animation: slideInLeft 0.6s ease-out;
    }

    .slideInRight {
        animation: slideInRight 0.6s ease-out;
    }

    /* Scale animations */
    .scaleIn {
        animation: scaleIn 0.6s ease-out;
    }

    .scaleOut {
        animation: scaleOut 0.6s ease-out;
    }

    /* Bounce animations */
    .bounceIn {
        animation: bounceIn 0.6s ease-out;
    }

    .bounceOut {
        animation: bounceOut 0.6s ease-out;
    }

    /* Rotate animations */
    .rotateIn {
        animation: rotateIn 0.6s ease-out;
    }

    .rotateOut {
        animation: rotateOut 0.6s ease-out;
    }

    /* Special animations */
    .pulse-animation {
        animation: pulse 2s infinite;
    }

    .floating-animation {
        animation: float 3s ease-in-out infinite;
    }

    .bounce-animation {
        animation: bounce 0.6s ease-out;
    }

    .shake-animation {
        animation: shake 0.5s ease-in-out;
    }

    .success-animation {
        animation: successPulse 1s ease-out;
    }

    .error-animation {
        animation: errorShake 1s ease-out;
    }

    /* Page transition */
    .page-transition-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        z-index: 9999;
        animation: pageTransition 0.6s ease-in-out;
    }

    /* Animation keyframes */
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-30px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInLeft {
        from { opacity: 0; transform: translateX(-30px); }
        to { opacity: 1; transform: translateX(0); }
    }

    @keyframes fadeInRight {
        from { opacity: 0; transform: translateX(30px); }
        to { opacity: 1; transform: translateX(0); }
    }

    @keyframes slideInUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }

    @keyframes slideInDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
    }

    @keyframes slideInLeft {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
    }

    @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }

    @keyframes scaleIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }

    @keyframes scaleOut {
        from { transform: scale(1); opacity: 1; }
        to { transform: scale(0.8); opacity: 0; }
    }

    @keyframes bounceIn {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
    }

    @keyframes bounceOut {
        0% { transform: scale(1); opacity: 1; }
        20% { transform: scale(0.9); }
        50% { transform: scale(1.05); }
        100% { transform: scale(0.3); opacity: 0; }
    }

    @keyframes rotateIn {
        from { transform: rotate(-200deg); opacity: 0; }
        to { transform: rotate(0deg); opacity: 1; }
    }

    @keyframes rotateOut {
        from { transform: rotate(0deg); opacity: 1; }
        to { transform: rotate(200deg); opacity: 0; }
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }

    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }

    @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
        40%, 43% { transform: translate3d(0,-30px,0); }
        70% { transform: translate3d(0,-15px,0); }
        90% { transform: translate3d(0,-4px,0); }
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }

    @keyframes successPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); background-color: var(--success-color); }
        100% { transform: scale(1); }
    }

    @keyframes errorShake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    @keyframes pageTransition {
        0% { transform: scaleY(0); transform-origin: top; }
        50% { transform: scaleY(1); transform-origin: top; }
        51% { transform: scaleY(1); transform-origin: bottom; }
        100% { transform: scaleY(0); transform-origin: bottom; }
    }

    /* Stagger animations */
    .stagger-children > * {
        opacity: 0;
        animation: fadeInUp 0.6s ease-out forwards;
    }

    .stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
    .stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
    .stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
    .stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
    .stagger-children > *:nth-child(5) { animation-delay: 0.5s; }
    .stagger-children > *:nth-child(6) { animation-delay: 0.6s; }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
`;

// Inject animation styles
const animationStyleSheet = document.createElement('style');
animationStyleSheet.textContent = animationStyles;
document.head.appendChild(animationStyleSheet);

// Export animation functions
window.CareConnectAnimations = {
    animateModalOpen: (modal) => animationsInstance?.animateModalOpen(modal),
    animateModalClose: (modal) => animationsInstance?.animateModalClose(modal),
    animateSuccess: (element) => animationsInstance?.animateSuccess(element),
    animateError: (element) => animationsInstance?.animateError(element),
    addPulseAnimation: (element) => animationsInstance?.addPulseAnimation(element),
    removePulseAnimation: (element) => animationsInstance?.removePulseAnimation(element),
    addFloatingAnimation: (element) => animationsInstance?.addFloatingAnimation(element),
    addBounceAnimation: (element) => animationsInstance?.addBounceAnimation(element),
    addShakeAnimation: (element) => animationsInstance?.addShakeAnimation(element)
}; 