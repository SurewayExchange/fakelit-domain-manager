// Dedicated Server Service JavaScript
class DedicatedServerService {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.selectedConfiguration = null;
        this.companyInfo = {
            name: 'Fakelit.com',
            address: '2300 W Sahara Ave Suite 800, Las Vegas, NV 89102',
            phone: '702-664-0009',
            email: 'sales@fakelit.com',
            website: 'https://fakelit.com'
        };
        
        this.serverConfigurations = {
            basic: {
                name: 'Basic Dedicated Server',
                price: 199.99,
                specs: {
                    cpu: '4 vCPU',
                    ram: '8GB DDR4',
                    storage: '500GB SSD',
                    bandwidth: '1TB/month',
                    ipAddresses: 1
                },
                features: [
                    'Full root access',
                    'DDoS protection',
                    '24/7 monitoring',
                    'Daily backups',
                    '5 free email addresses',
                    'Free SSL certificates'
                ]
            },
            professional: {
                name: 'Professional Dedicated Server',
                price: 399.99,
                specs: {
                    cpu: '8 vCPU',
                    ram: '16GB DDR4',
                    storage: '1TB SSD',
                    bandwidth: '2TB/month',
                    ipAddresses: 2
                },
                features: [
                    'All Basic features',
                    'Advanced DDoS protection',
                    'Load balancing',
                    'Priority support',
                    '10 free email addresses',
                    'Custom firewall rules'
                ]
            },
            enterprise: {
                name: 'Enterprise Dedicated Server',
                price: 799.99,
                specs: {
                    cpu: '16 vCPU',
                    ram: '32GB DDR4',
                    storage: '2TB SSD',
                    bandwidth: '5TB/month',
                    ipAddresses: 5
                },
                features: [
                    'All Professional features',
                    'High availability setup',
                    'Custom server configuration',
                    'Dedicated support team',
                    'Unlimited email addresses',
                    'Advanced security suite'
                ]
            }
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeForm();
        this.loadCompanyInfo();
    }

    bindEvents() {
        // Form submission
        const form = document.getElementById('dedicated-server-quote-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitQuoteRequest();
            });
        }

        // Configuration selection
        document.querySelectorAll('[onclick*="selectConfiguration"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const config = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.selectConfiguration(config);
            });
        });

        // Domain purchase
        const domainBtn = document.querySelector('[onclick*="showDomainPurchase"]');
        if (domainBtn) {
            domainBtn.addEventListener('click', (e) => {
                this.showDomainPurchase();
            });
        }
    }

    loadCompanyInfo() {
        // Update company information on the page
        const companyElements = document.querySelectorAll('.company-info, .contact-info');
        companyElements.forEach(element => {
            element.innerHTML = element.innerHTML.replace(
                /Fakelit\.com/g,
                this.companyInfo.name
            );
        });
    }

    selectConfiguration(configType) {
        this.selectedConfiguration = configType;
        
        // Update UI to show selected configuration
        document.querySelectorAll('.config-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[onclick*="${configType}"]`).closest('.config-card');
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Update form
        const serverTypeSelect = document.getElementById('serverType');
        if (serverTypeSelect) {
            serverTypeSelect.value = configType;
        }
        
        // Show configuration details
        this.showConfigurationDetails(configType);
    }

    showConfigurationDetails(configType) {
        const config = this.serverConfigurations[configType];
        if (!config) return;

        const message = `
🎯 **${config.name}** - $${config.price}/month

**Specifications:**
• CPU: ${config.specs.cpu}
• RAM: ${config.specs.ram}
• Storage: ${config.specs.storage}
• Bandwidth: ${config.specs.bandwidth}
• IP Addresses: ${config.specs.ipAddresses}

**Features:**
${config.features.map(feature => `• ${feature}`).join('\n')}

Would you like to proceed with this configuration?
        `;

        this.showNotification(message, 'info');
        
        // Pre-fill contact form
        this.prefillQuoteForm(configType);
    }

    prefillQuoteForm(configType) {
        const form = document.getElementById('dedicated-server-quote-form');
        if (!form) return;

        const requirementsTextarea = form.querySelector('#requirements');
        if (requirementsTextarea) {
            const config = this.serverConfigurations[configType];
            requirementsTextarea.value = `I'm interested in the ${config.name} configuration.

Server Requirements:
• Configuration: ${configType}
• Price: $${config.price}/month
• CPU: ${config.specs.cpu}
• RAM: ${config.specs.ram}
• Storage: ${config.specs.storage}

Please provide more information about this configuration and setup process.`;
        }
    }

    showDomainPurchase() {
        const message = `
🌐 **Domain Purchase with Free Email**

**What's Included:**
• Domain registration (1 year) - $21.99/year
• 5 free email addresses included
• Email hosting (2GB per address)
• Webmail access
• Spam protection
• Email forwarding
• Auto-responders

**Default Email Addresses:**
• admin@yourdomain.com
• info@yourdomain.com
• support@yourdomain.com
• sales@yourdomain.com
• contact@yourdomain.com

Would you like to purchase a domain with free email addresses?
        `;

        this.showNotification(message, 'info');
        
        // Pre-fill form for domain purchase
        this.prefillDomainForm();
    }

    prefillDomainForm() {
        const form = document.getElementById('dedicated-server-quote-form');
        if (!form) return;

        const requirementsTextarea = form.querySelector('#requirements');
        if (requirementsTextarea) {
            requirementsTextarea.value = `I'm interested in purchasing a domain with free email addresses.

Domain Requirements:
• Domain registration with 1-year term
• 5 free email addresses included
• Email hosting and webmail access
• Spam protection and security

Please provide information about available domains and setup process.`;
        }
    }

    initializeForm() {
        const form = document.getElementById('dedicated-server-quote-form');
        if (!form) return;

        // Add form validation
        form.addEventListener('input', (e) => {
            this.validateField(e.target);
        });

        // Add character counter for requirements
        const requirementsTextarea = form.querySelector('#requirements');
        if (requirementsTextarea) {
            requirementsTextarea.addEventListener('input', (e) => {
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

        // Add phone number formatting
        const phoneInput = form.querySelector('#phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 6) {
                    value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                } else if (value.length >= 3) {
                    value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
                }
                e.target.value = value;
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
            
            case 'tel':
                const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
                isValid = phoneRegex.test(value);
                errorMessage = 'Please enter a valid phone number: (XXX) XXX-XXXX';
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
        const form = document.getElementById('dedicated-server-quote-form');
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

        // Add selected configuration if any
        if (this.selectedConfiguration) {
            data.selectedConfiguration = this.selectedConfiguration;
        }

        try {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Send to API
            const response = await fetch('/api/dedicated-server/quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'dedicated_server_quote',
                    data: data
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Quote request sent successfully! Our sales team will contact you within 24 hours.', 'success');
                form.reset();
                this.selectedConfiguration = null;
                
                // Remove selected configuration styling
                document.querySelectorAll('.config-card').forEach(card => {
                    card.classList.remove('selected');
                });
            } else {
                throw new Error(result.message || 'Failed to send quote request');
            }

        } catch (error) {
            console.error('Quote request error:', error);
            this.showNotification('Failed to send quote request. Please try again or contact us directly at 702-664-0009.', 'error');
        } finally {
            // Reset button state
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Request Quote';
            submitBtn.disabled = false;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${this.formatMessage(message)}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
    }

    formatMessage(message) {
        // Convert markdown-style formatting
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    // Public methods for external use
    getCompanyInfo() {
        return this.companyInfo;
    }

    getServerConfigurations() {
        return this.serverConfigurations;
    }

    generateQuote(configType, additionalServices = []) {
        const config = this.serverConfigurations[configType];
        if (!config) return null;

        let totalPrice = config.price;
        const services = [...config.features];

        // Add additional services
        additionalServices.forEach(service => {
            services.push(service);
            totalPrice += 25; // $25 per additional service
        });

        return {
            configuration: config,
            totalPrice: totalPrice,
            services: services,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };
    }
}

// Initialize dedicated server service when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dedicatedServerService = new DedicatedServerService();
});

// Global functions for external use
window.selectConfiguration = (configType) => {
    if (window.dedicatedServerService) {
        window.dedicatedServerService.selectConfiguration(configType);
    }
};

window.showDomainPurchase = () => {
    if (window.dedicatedServerService) {
        window.dedicatedServerService.showDomainPurchase();
    }
};

window.getDedicatedServerQuote = (configType, services) => {
    if (window.dedicatedServerService) {
        return window.dedicatedServerService.generateQuote(configType, services);
    }
    return null;
}; 