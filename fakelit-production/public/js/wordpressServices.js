// WordPress Services JavaScript
class WordPressServices {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.themes = [];
        this.currentFilter = 'all';
        this.selectedSupportTier = null;
        
        this.init();
    }

    init() {
        this.loadThemes();
        this.bindEvents();
        this.initializeForm();
    }

    bindEvents() {
        // Theme filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterThemes(e.target.dataset.filter);
            });
        });

        // Support tier selection
        document.querySelectorAll('[onclick^="selectSupportTier"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tier = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.selectSupportTier(tier);
            });
        });

        // Form submission
        const form = document.getElementById('wordpress-quote-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitQuoteRequest();
            });
        }
    }

    async loadThemes() {
        try {
            const response = await fetch('/api/wordpress/themes');
            const data = await response.json();
            
            if (data.success) {
                this.themes = data.themes;
                this.renderThemes();
            } else {
                // Fallback to sample themes if API is not available
                this.loadSampleThemes();
            }
        } catch (error) {
            console.log('Using sample themes');
            this.loadSampleThemes();
        }
    }

    loadSampleThemes() {
        this.themes = [
            {
                id: 'theme_1',
                name: 'Business Pro',
                description: 'Professional business theme with modern design and advanced features',
                category: 'business',
                price: 199,
                isCustom: false,
                features: ['Responsive Design', 'SEO Optimized', 'Custom Widgets', 'Page Builder Ready'],
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'theme_2',
                name: 'E-commerce Plus',
                description: 'Complete e-commerce solution with WooCommerce integration',
                category: 'ecommerce',
                price: 299,
                isCustom: false,
                features: ['WooCommerce Ready', 'Payment Integration', 'Inventory Management', 'Mobile Optimized'],
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'theme_3',
                name: 'Portfolio Elite',
                description: 'Creative portfolio theme for designers and artists',
                category: 'portfolio',
                price: 149,
                isCustom: false,
                features: ['Gallery Support', 'Creative Layouts', 'Social Integration', 'Fast Loading'],
                image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'theme_4',
                name: 'Blog Master',
                description: 'Optimized blog theme with advanced content features',
                category: 'blog',
                price: 99,
                isCustom: false,
                features: ['Reading Mode', 'Social Sharing', 'Comment System', 'Newsletter Integration'],
                image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'theme_5',
                name: 'Restaurant Deluxe',
                description: 'Custom theme for restaurant and food service businesses',
                category: 'custom',
                price: 599,
                isCustom: true,
                features: ['Menu Management', 'Reservation System', 'Online Ordering', 'Location Services'],
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'theme_6',
                name: 'Agency Pro',
                description: 'Professional agency theme with client management features',
                category: 'business',
                price: 249,
                isCustom: false,
                features: ['Client Portal', 'Project Showcase', 'Team Management', 'Analytics Dashboard'],
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
            }
        ];
        
        this.renderThemes();
    }

    renderThemes() {
        const grid = document.getElementById('themes-grid');
        if (!grid) return;

        const filteredThemes = this.filterThemesByCategory(this.themes, this.currentFilter);
        
        grid.innerHTML = filteredThemes.map(theme => this.createThemeCard(theme)).join('');
    }

    filterThemes(category) {
        this.currentFilter = category;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${category}"]`).classList.add('active');
        
        this.renderThemes();
    }

    filterThemesByCategory(themes, category) {
        if (category === 'all') return themes;
        return themes.filter(theme => theme.category === category);
    }

    createThemeCard(theme) {
        const customBadge = theme.isCustom ? '<div class="theme-badge">Custom</div>' : '';
        
        return `
            <div class="theme-card" data-category="${theme.category}">
                ${customBadge}
                <div class="theme-image">
                    <img src="${theme.image}" alt="${theme.name}" class="theme-img">
                </div>
                <div class="theme-content">
                    <h3>${theme.name}</h3>
                    <p>${theme.description}</p>
                    <div class="theme-features">
                        <h4>Features:</h4>
                        <ul>
                            ${theme.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="theme-price">
                        <span class="price">$${theme.price}</span>
                        ${theme.isCustom ? '<span class="custom-note">Custom Development</span>' : ''}
                    </div>
                    <div class="theme-actions">
                        <button class="btn btn-primary" onclick="wordpressServices.previewTheme('${theme.id}')">Preview</button>
                        <button class="btn btn-secondary" onclick="wordpressServices.requestTheme('${theme.id}')">Request Quote</button>
                    </div>
                </div>
            </div>
        `;
    }

    previewTheme(themeId) {
        const theme = this.themes.find(t => t.id === themeId);
        if (theme) {
            // Open theme preview in new window
            window.open(`/theme-preview/${themeId}`, '_blank');
        }
    }

    requestTheme(themeId) {
        const theme = this.themes.find(t => t.id === themeId);
        if (theme) {
            // Pre-fill the contact form with theme information
            const form = document.getElementById('wordpress-quote-form');
            if (form) {
                const serviceSelect = form.querySelector('#service');
                const messageTextarea = form.querySelector('#message');
                
                if (serviceSelect) {
                    serviceSelect.value = 'custom-theme';
                }
                
                if (messageTextarea) {
                    messageTextarea.value = `I'm interested in the ${theme.name} theme.\n\nTheme ID: ${theme.id}\nPrice: $${theme.price}\n\nPlease provide more information about this theme and customization options.`;
                }
                
                // Scroll to contact form
                form.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    selectSupportTier(tierName) {
        this.selectedSupportTier = tierName;
        
        // Update UI to show selected tier
        document.querySelectorAll('.tier-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[onclick*="${tierName}"]`).closest('.tier-card');
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Show upgrade confirmation
        this.showSupportUpgrade(tierName);
    }

    showSupportUpgrade(tierName) {
        const tiers = {
            free: { name: 'Free Support', price: 0 },
            ai_support: { name: 'AI Support with Live Chat', price: 150 },
            premium: { name: 'Premium Integration & AI Support', price: 550 }
        };
        
        const tier = tiers[tierName];
        
        const message = tier.price === 0 
            ? `You've selected ${tier.name}. This tier is free and includes basic support features.`
            : `You've selected ${tier.name} for $${tier.price}/month. This includes advanced support features and integrations.`;
        
        // Create modal or notification
        this.showNotification(message, 'success');
        
        // Pre-fill contact form
        const form = document.getElementById('wordpress-quote-form');
        if (form) {
            const serviceSelect = form.querySelector('#service');
            const messageTextarea = form.querySelector('#message');
            
            if (serviceSelect) {
                serviceSelect.value = 'support';
            }
            
            if (messageTextarea) {
                messageTextarea.value = `I'm interested in upgrading to ${tier.name} support tier.\n\nTier: ${tier.name}\nPrice: $${tier.price}/month\n\nPlease provide more information about this support tier and how to get started.`;
            }
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    initializeForm() {
        const form = document.getElementById('wordpress-quote-form');
        if (!form) return;

        // Add form validation
        form.addEventListener('input', (e) => {
            this.validateField(e.target);
        });

        // Add character counter for message
        const messageTextarea = form.querySelector('#message');
        if (messageTextarea) {
            messageTextarea.addEventListener('input', (e) => {
                const maxLength = 1000;
                const currentLength = e.target.value.length;
                const remaining = maxLength - currentLength;
                
                // Update character counter
                let counter = e.target.parentElement.querySelector('.char-counter');
                if (!counter) {
                    counter = document.createElement('div');
                    counter.className = 'char-counter';
                    e.target.parentElement.appendChild(counter);
                }
                
                counter.textContent = `${remaining} characters remaining`;
                counter.style.color = remaining < 100 ? '#e74c3c' : '#666';
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                errorMessage = 'Please enter a valid email address';
                break;
            
            case 'text':
                isValid = value.length >= 2;
                errorMessage = 'This field must be at least 2 characters long';
                break;
            
            case 'select-one':
                isValid = value !== '';
                errorMessage = 'Please select an option';
                break;
        }

        // Update field styling
        field.classList.toggle('error', !isValid);
        
        // Show/hide error message
        let errorElement = field.parentElement.querySelector('.error-message');
        if (!isValid) {
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                field.parentElement.appendChild(errorElement);
            }
            errorElement.textContent = errorMessage;
        } else if (errorElement) {
            errorElement.remove();
        }

        return isValid;
    }

    async submitQuoteRequest() {
        const form = document.getElementById('wordpress-quote-form');
        if (!form) return;

        // Validate all fields
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showNotification('Please fix the errors in the form', 'error');
            return;
        }

        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Add selected support tier if any
        if (this.selectedSupportTier) {
            data.supportTier = this.selectedSupportTier;
        }

        try {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Send to API
            const response = await fetch('/api/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'wordpress_quote',
                    data: data
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Quote request sent successfully! We\'ll get back to you within 24 hours.', 'success');
                form.reset();
                this.selectedSupportTier = null;
                
                // Remove selected tier styling
                document.querySelectorAll('.tier-card').forEach(card => {
                    card.classList.remove('selected');
                });
            } else {
                throw new Error(result.message || 'Failed to send quote request');
            }

        } catch (error) {
            console.error('Quote request error:', error);
            this.showNotification('Failed to send quote request. Please try again or contact us directly.', 'error');
        } finally {
            // Reset button state
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Send Quote Request';
            submitBtn.disabled = false;
        }
    }
}

// Initialize WordPress Services when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.wordpressServices = new WordPressServices();
});

// Global functions for external use
window.selectSupportTier = (tierName) => {
    if (window.wordpressServices) {
        window.wordpressServices.selectSupportTier(tierName);
    }
};

window.previewTheme = (themeId) => {
    if (window.wordpressServices) {
        window.wordpressServices.previewTheme(themeId);
    }
};

window.requestTheme = (themeId) => {
    if (window.wordpressServices) {
        window.wordpressServices.requestTheme(themeId);
    }
}; 