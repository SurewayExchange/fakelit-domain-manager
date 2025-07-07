// CareConnect AI Chatbot - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupScrollEffects();
    setupAnimations();
    setupCounselorSelection();
    setupChatModals();
    setupFormHandlers();
    setupAccessibility();
    setupPWA();
    setupRealisticInteractions();
}

function setupNavigation() {
    const nav = document.querySelector('nav');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('nav-open');
            menuToggle.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    nav.classList.remove('nav-open');
                    menuToggle.classList.remove('active');
                }
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    });
}

function setupScrollEffects() {
    const scrollToTop = document.querySelector('.scroll-to-top');
    
    if (scrollToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTop.classList.add('show');
            } else {
                scrollToTop.classList.remove('show');
            }
        });

        scrollToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

function setupAnimations() {
    // Typing animation for hero text
    const heroText = document.querySelector('.hero-title');
    if (heroText) {
        const text = heroText.textContent;
        heroText.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                heroText.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        setTimeout(typeWriter, 500);
    }

    // Counter animations
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(counter);
    });
}

function setupCounselorSelection() {
    const counselorCards = document.querySelectorAll('.counselor-card');
    
    counselorCards.forEach(card => {
        card.addEventListener('click', () => {
            const counselorId = card.getAttribute('data-counselor');
            if (counselorId) {
                // Store selected counselor
                localStorage.setItem('selectedCounselor', counselorId);
                
                // Add visual feedback
                card.classList.add('selected');
                setTimeout(() => {
                    card.classList.remove('selected');
                }, 300);
                
                // Open chat modal
                openChatModal();
            }
        });

        // Hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function setupChatModals() {
    const chatButtons = document.querySelectorAll('.chat-btn, .start-session-btn');
    const chatModal = document.getElementById('chatModal');
    const closeChat = document.querySelector('.close-chat');

    chatButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const counselorId = button.getAttribute('data-counselor');
            if (counselorId) {
                localStorage.setItem('selectedCounselor', counselorId);
            }
            openChatModal();
        });
    });

    if (closeChat) {
        closeChat.addEventListener('click', closeChatModal);
    }

    // Close modal when clicking outside
    if (chatModal) {
        chatModal.addEventListener('click', (e) => {
            if (e.target === chatModal) {
                closeChatModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatModal && chatModal.classList.contains('show')) {
            closeChatModal();
        }
    });
}

// Make functions globally available
window.openChatModal = function() {
    console.log('openChatModal called');
    const chatModal = document.getElementById('chatModal');
    console.log('Chat modal element:', chatModal);
    
    if (chatModal) {
        chatModal.style.display = 'flex';
        chatModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Initialize chat if not already done and if CareConnectChat is available
        if (!window.careConnectChat) {
            console.log('Checking if CareConnectChat is available...');
            if (typeof CareConnectChat !== 'undefined') {
                console.log('Initializing CareConnectChat...');
                window.careConnectChat = new CareConnectChat();
            } else {
                console.log('CareConnectChat not available yet, will initialize later');
                // Set up a simple fallback chat interface
                setupFallbackChat();
            }
        }
        
        // Focus on input
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.focus();
            }
        }, 300);
    } else {
        console.error('Chat modal not found!');
    }
};

window.closeChatModal = function() {
    console.log('closeChatModal called');
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
        chatModal.style.display = 'none';
        chatModal.classList.remove('show');
        document.body.style.overflow = '';
    }
};

// Fallback chat setup when CareConnectChat is not available
function setupFallbackChat() {
    console.log('Setting up fallback chat...');
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        // Clear existing messages and add a simple welcome message
        chatMessages.innerHTML = `
            <div class="message counselor">
                <div class="message-avatar">
                    <img src="/images/counselors/dr-sarah-mitchell.svg" alt="Counselor">
                </div>
                <div class="message-content">
                    <p>Hello! I'm here to help you. How are you feeling today?</p>
                </div>
            </div>
        `;
    }
    
    // Set up basic message handling
    window.sendMessage = function() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (message) {
            // Add user message
            const userMessage = document.createElement('div');
            userMessage.className = 'message user';
            userMessage.innerHTML = `
                <div class="message-content">
                    <p>${message}</p>
                </div>
            `;
            chatMessages.appendChild(userMessage);
            
            // Clear input
            chatInput.value = '';
            
            // Add simple response
            setTimeout(() => {
                const counselorMessage = document.createElement('div');
                counselorMessage.className = 'message counselor';
                counselorMessage.innerHTML = `
                    <div class="message-avatar">
                        <img src="/images/counselors/dr-sarah-mitchell.svg" alt="Counselor">
                    </div>
                    <div class="message-content">
                        <p>Thank you for sharing that with me. I'm here to listen and support you.</p>
                    </div>
                `;
                chatMessages.appendChild(counselorMessage);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    };
    
    // Set up keyboard handling
    window.handleChatKeyPress = function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };
}

function setupFormHandlers() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showAlert('Thank you for your message! We\'ll get back to you soon.', 'success');
        e.target.reset();
    } catch (error) {
        showAlert('Sorry, there was an error sending your message. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Subscribing...';
    submitBtn.disabled = true;

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showAlert('Thank you for subscribing to our newsletter!', 'success');
        e.target.reset();
    } catch (error) {
        showAlert('Sorry, there was an error. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

function setupAccessibility() {
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(skipLink.getAttribute('href'));
            if (target) {
                target.focus();
                target.scrollIntoView();
            }
        });
    }

    // Focus management for modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Trap focus within modal
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    });
}

function setupPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

    // Add to home screen prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button if available
        const installBtn = document.querySelector('.install-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.addEventListener('click', () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    deferredPrompt = null;
                    installBtn.style.display = 'none';
                });
            });
        }
    });
}

function setupRealisticInteractions() {
    // Add realistic hover effects to counselor cards
    const counselorCards = document.querySelectorAll('.counselor-card');
    
    counselorCards.forEach(card => {
        const avatar = card.querySelector('.counselor-avatar');
        const info = card.querySelector('.counselor-info');
        
        card.addEventListener('mouseenter', () => {
            if (avatar) {
                avatar.style.transform = 'scale(1.1) rotate(5deg)';
            }
            if (info) {
                info.style.transform = 'translateY(-2px)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (avatar) {
                avatar.style.transform = 'scale(1) rotate(0deg)';
            }
            if (info) {
                info.style.transform = 'translateY(0)';
            }
        });
    });

    // Add realistic button interactions
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    });

    // Add realistic form interactions
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });

    // Add realistic page transitions
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    // Add smooth transition effect
                    document.body.style.opacity = '0.8';
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth' });
                        document.body.style.opacity = '1';
                    }, 150);
                }
            }
        });
    });

    // Add realistic loading states
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                
                // Re-enable after a delay (for demo purposes)
                setTimeout(() => {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    });

    // Add realistic scroll effects
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const parallax = document.querySelector('.parallax');
                if (parallax) {
                    parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // Add realistic cursor effects
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: rgba(102, 126, 234, 0.3);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.1s ease;
        display: none;
    `;
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
        cursor.style.display = 'block';
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.display = 'none';
    });

    // Add hover effect to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .counselor-card, .service-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursor.style.background = 'rgba(102, 126, 234, 0.5)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.background = 'rgba(102, 126, 234, 0.3)';
        });
    });
}

function openCounselorProfile(counselorId) {
    // Store selected counselor for chat
    localStorage.setItem('selectedCounselor', counselorId);
    
    // Navigate to counselor profile page
    window.location.href = `/counselor/${counselorId}`;
}

function openServiceChat(serviceType) {
    // Map service types to counselors
    const serviceCounselorMap = {
        'mental-health': 'dr-sarah-mitchell',
        'drug-alcohol': 'michael-rodriguez',
        'social-family': 'dr-emily-chen',
        'career-school': 'james-williams',
        'crisis-escalation': 'dr-maria-garcia',
        'onboarding': 'lisa-thompson'
    };
    
    const counselorId = serviceCounselorMap[serviceType];
    if (counselorId) {
        localStorage.setItem('selectedCounselor', counselorId);
        openChatModal();
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Initialize CareConnectChat when it becomes available
function initializeCareConnectChat() {
    if (typeof CareConnectChat !== 'undefined' && !window.careConnectChat) {
        console.log('CareConnectChat is now available, initializing...');
        window.careConnectChat = new CareConnectChat();
        
        // Update the sendMessage function to use the full chat system
        window.sendMessage = function() {
            if (window.careConnectChat) {
                window.careConnectChat.sendMessage();
            }
        };
        
        // Update the handleChatKeyPress function
        window.handleChatKeyPress = function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        };
        
        console.log('CareConnectChat initialized successfully');
    }
}

// Check for CareConnectChat availability after scripts load
document.addEventListener('DOMContentLoaded', function() {
    // Check immediately
    initializeCareConnectChat();
    
    // Check again after a short delay to ensure all scripts are loaded
    setTimeout(initializeCareConnectChat, 100);
    
    // Check periodically for a few seconds
    let checkCount = 0;
    const checkInterval = setInterval(() => {
        checkCount++;
        initializeCareConnectChat();
        if (checkCount >= 10) { // Stop checking after 1 second
            clearInterval(checkInterval);
        }
    }, 100);
}); 

// Voice input/output functionality
let voiceIO = null;
let isVoiceRecording = false;

// Initialize voice system when chat modal opens
function initializeVoiceSystem() {
    if (!voiceIO) {
        try {
            voiceIO = new VoiceInputOutput({
                apiUrl: '/api/voice',
                autoStart: false,
                continuousMode: false,
                language: 'en-US'
            });

            // Set up voice event handlers
            voiceIO.onTranscription((text) => {
                handleVoiceTranscription(text);
            });

            voiceIO.onError((error) => {
                console.error('Voice error:', error);
                stopVoiceRecording();
                showVoiceError('Voice input error. Please try again.');
            });

            console.log('Voice system initialized');
        } catch (error) {
            console.error('Failed to initialize voice system:', error);
            showVoiceError('Voice input not available. Please use text input.');
        }
    }
}

// Toggle voice input recording
async function toggleVoiceInput() {
    if (!voiceIO) {
        initializeVoiceSystem();
        return;
    }

    if (isVoiceRecording) {
        stopVoiceRecording();
    } else {
        startVoiceRecording();
    }
}

// Start voice recording
async function startVoiceRecording() {
    try {
        const success = await voiceIO.startRecording();
        if (success) {
            isVoiceRecording = true;
            updateVoiceUI(true);
            console.log('Voice recording started');
        } else {
            showVoiceError('Failed to start voice recording');
        }
    } catch (error) {
        console.error('Start recording error:', error);
        showVoiceError('Microphone access denied. Please allow microphone access.');
    }
}

// Stop voice recording
function stopVoiceRecording() {
    if (voiceIO && isVoiceRecording) {
        voiceIO.stopRecording();
        isVoiceRecording = false;
        updateVoiceUI(false);
        console.log('Voice recording stopped');
    }
}

// Handle voice transcription
function handleVoiceTranscription(text) {
    if (text && text.trim()) {
        // Update the chat input with transcribed text
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = text;
            // Automatically send the message after a short delay
            setTimeout(() => {
                sendMessage();
            }, 500);
        }
    }
}

// Update voice UI elements
function updateVoiceUI(isRecording) {
    const voiceBtn = document.getElementById('voiceInputBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const statusText = voiceStatus?.querySelector('.status-text');

    if (voiceBtn) {
        if (isRecording) {
            voiceBtn.classList.add('recording');
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
            voiceBtn.title = 'Click to stop recording';
        } else {
            voiceBtn.classList.remove('recording');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceBtn.title = 'Click to speak';
        }
    }

    if (voiceStatus) {
        voiceStatus.style.display = isRecording ? 'flex' : 'none';
        if (statusText) {
            statusText.textContent = isRecording ? 'Listening...' : '';
        }
    }
}

// Show voice error message
function showVoiceError(message) {
    const voiceStatus = document.getElementById('voiceStatus');
    const statusText = voiceStatus?.querySelector('.status-text');
    
    if (voiceStatus && statusText) {
        voiceStatus.style.display = 'flex';
        voiceStatus.style.backgroundColor = 'var(--red-50)';
        voiceStatus.style.borderColor = 'var(--red-200)';
        voiceStatus.style.color = 'var(--red-700)';
        statusText.textContent = message;
        
        // Hide error after 3 seconds
        setTimeout(() => {
            voiceStatus.style.display = 'none';
            voiceStatus.style.backgroundColor = 'var(--blue-50)';
            voiceStatus.style.borderColor = 'var(--blue-200)';
            voiceStatus.style.color = 'var(--blue-700)';
        }, 3000);
    }
} 

// Voice output functionality
let voiceOutputEnabled = true;

// Toggle voice output for counselor responses
window.toggleVoiceOutput = function() {
    voiceOutputEnabled = !voiceOutputEnabled;
    const voiceOutputBtn = document.getElementById('voiceOutputBtn');
    const icon = voiceOutputBtn?.querySelector('i');
    
    if (voiceOutputBtn && icon) {
        if (voiceOutputEnabled) {
            voiceOutputBtn.classList.remove('disabled');
            icon.className = 'fas fa-volume-up';
            voiceOutputBtn.title = 'Voice output enabled';
            showStatus('Voice output enabled', 'success');
        } else {
            voiceOutputBtn.classList.add('disabled');
            icon.className = 'fas fa-volume-mute';
            voiceOutputBtn.title = 'Voice output disabled';
            showStatus('Voice output disabled', 'info');
        }
    }
}

// Show status message
function showStatus(message, type) {
    // Create a temporary status message
    const statusDiv = document.createElement('div');
    statusDiv.className = `voice-status ${type}`;
    statusDiv.innerHTML = `
        <span class="status-text">${message}</span>
    `;
    
    // Add to chat modal
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
        chatModal.appendChild(statusDiv);
        
        // Remove after 2 seconds
        setTimeout(() => {
            if (statusDiv.parentElement) {
                statusDiv.remove();
            }
        }, 2000);
    }
} 

// Authentication functions
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    
    if (token && user.id) {
        // User is logged in
        authButtons.style.display = 'none';
        userMenu.style.display = 'flex';
        userName.textContent = `${user.firstName} ${user.lastName}`;
        
        // Enable chat functionality
        enableChatFeatures();
    } else {
        // User is not logged in
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
        
        // Disable chat functionality
        disableChatFeatures();
    }
}

function enableChatFeatures() {
    // Enable chat modal and other authenticated features
    const chatButtons = document.querySelectorAll('[onclick*="openChatModal"]');
    chatButtons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
    });
}

function disableChatFeatures() {
    // Disable chat modal and other authenticated features
    const chatButtons = document.querySelectorAll('[onclick*="openChatModal"]');
    chatButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    checkAuthStatus();
    
    // Redirect to home page
    window.location.href = '/';
}

// Check auth status on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Add click handlers for auth buttons
    const loginBtn = document.querySelector('a[href="/login.html"]');
    const registerBtn = document.querySelector('a[href="/register.html"]');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/login.html';
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/register.html';
        });
    }
}); 