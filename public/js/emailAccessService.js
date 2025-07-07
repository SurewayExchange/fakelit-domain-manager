// Email Access Service JavaScript
class EmailAccessService {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.currentDomain = null;
        this.domains = [];
        
        this.init();
    }

    init() {
        this.loadDomainAccess();
        this.bindEvents();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Setup instructions button
        document.querySelectorAll('[onclick*="getSetupInstructions"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const domain = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.getSetupInstructions(domain);
            });
        });

        // Webmail button
        document.querySelectorAll('[onclick*="openWebmail"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const domain = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.openWebmail(domain);
            });
        });
    }

    async loadDomainAccess() {
        try {
            const response = await fetch('/api/email-access/domains');
            const result = await response.json();

            if (result.success) {
                this.domains = result.domains;
                this.renderDomainAccess();
            } else {
                console.error('Failed to load domain access:', result.message);
                this.showNotification('Failed to load domain access details', 'error');
            }
        } catch (error) {
            console.error('Load domain access error:', error);
            this.showNotification('Failed to load domain access details', 'error');
        }
    }

    renderDomainAccess() {
        const domainList = document.getElementById('domain-list');
        if (!domainList) return;

        if (this.domains.length === 0) {
            domainList.innerHTML = `
                <div class="no-domains">
                    <div class="no-domains-icon">📧</div>
                    <h3>No Domains Found</h3>
                    <p>You haven't purchased any domains yet. Purchase a domain to get email access details.</p>
                    <a href="dedicated-servers.html" class="btn btn-primary">Purchase Domain</a>
                </div>
            `;
            return;
        }

        domainList.innerHTML = '';
        
        this.domains.forEach(domain => {
            const domainCard = this.createDomainCard(domain);
            domainList.appendChild(domainCard);
        });
    }

    createDomainCard(domain) {
        const template = document.querySelector('.domain-template .domain-card');
        if (!template) return document.createElement('div');

        const card = template.cloneNode(true);
        
        // Update domain name
        const domainName = card.querySelector('.domain-name');
        if (domainName) domainName.textContent = domain.domain;

        // Update webmail URLs
        const webmailUrl = card.querySelector('.webmail-url');
        if (webmailUrl) {
            webmailUrl.href = domain.accessDetails.webmailUrl;
            webmailUrl.textContent = domain.accessDetails.webmailUrl;
        }

        const adminUrl = card.querySelector('.admin-url');
        if (adminUrl) {
            adminUrl.href = domain.accessDetails.adminPanel;
            adminUrl.textContent = domain.accessDetails.adminPanel;
        }

        // Update server settings
        const imapServer = card.querySelector('.imap-server');
        if (imapServer) imapServer.textContent = domain.accessDetails.imapSettings.server;

        const smtpServer = card.querySelector('.smtp-server');
        if (smtpServer) smtpServer.textContent = domain.accessDetails.smtpSettings.server;

        const pop3Server = card.querySelector('.pop3-server');
        if (pop3Server) pop3Server.textContent = domain.accessDetails.pop3Settings.server;

        // Update email addresses
        const emailList = card.querySelector('.email-addresses-list');
        if (emailList) {
            emailList.innerHTML = '';
            domain.emailAddresses.forEach(email => {
                const emailItem = document.createElement('div');
                emailItem.className = 'email-address-item';
                emailItem.innerHTML = `
                    <span class="email">${email.address}</span>
                    <span class="status ${email.status}">${email.status}</span>
                `;
                emailList.appendChild(emailItem);
            });
        }

        // Update button onclick handlers
        const setupBtn = card.querySelector('[onclick*="getSetupInstructions"]');
        if (setupBtn) {
            setupBtn.onclick = () => this.getSetupInstructions(domain.domain);
        }

        const webmailBtn = card.querySelector('[onclick*="openWebmail"]');
        if (webmailBtn) {
            webmailBtn.onclick = () => this.openWebmail(domain.domain);
        }

        return card;
    }

    async getSetupInstructions(domainName) {
        try {
            this.currentDomain = domainName;
            
            // Show instructions section
            const instructionsSection = document.getElementById('setup-instructions');
            if (instructionsSection) {
                instructionsSection.style.display = 'block';
                instructionsSection.scrollIntoView({ behavior: 'smooth' });
            }

            // Update instructions for the specific domain
            this.updateInstructionsForDomain(domainName);

            // Switch to webmail tab
            this.switchTab('webmail');

        } catch (error) {
            console.error('Get setup instructions error:', error);
            this.showNotification('Failed to load setup instructions', 'error');
        }
    }

    updateInstructionsForDomain(domainName) {
        // Update server settings in the instructions
        const imapServer = document.getElementById('imap-server');
        const smtpServer = document.getElementById('smtp-server');
        const pop3Server = document.getElementById('pop3-server');

        if (domainName === 'fakelit.com') {
            if (imapServer) imapServer.textContent = 'imap.fakelit.com';
            if (smtpServer) smtpServer.textContent = 'smtp.fakelit.com';
            if (pop3Server) pop3Server.textContent = 'pop3.fakelit.com';
        } else {
            if (imapServer) imapServer.textContent = `imap.${domainName}`;
            if (smtpServer) smtpServer.textContent = `smtp.${domainName}`;
            if (pop3Server) pop3Server.textContent = `pop3.${domainName}`;
        }

        // Update webmail instructions
        const webmailContent = document.getElementById('webmail-content');
        if (webmailContent) {
            const webmailUrl = domainName === 'fakelit.com' 
                ? 'https://webmail.fakelit.com' 
                : `https://webmail.${domainName}`;
            
            webmailContent.innerHTML = `
                <h3>Webmail Access</h3>
                <ol>
                    <li>Open your web browser</li>
                    <li>Go to: <a href="${webmailUrl}" target="_blank">${webmailUrl}</a></li>
                    <li>Enter your email address and password</li>
                    <li>Click "Sign In" to access your email</li>
                </ol>
            `;
        }

        // Update Outlook instructions
        const outlookContent = document.getElementById('outlook-content');
        if (outlookContent) {
            outlookContent.innerHTML = `
                <h3>Microsoft Outlook Setup</h3>
                <ol>
                    <li>Open Microsoft Outlook</li>
                    <li>Go to File > Add Account</li>
                    <li>Enter your email: your-email@${domainName}</li>
                    <li>Enter your password</li>
                    <li>Click "Next" and follow the setup wizard</li>
                </ol>
            `;
        }

        // Update mobile instructions
        const mobileContent = document.getElementById('mobile-content');
        if (mobileContent) {
            mobileContent.innerHTML = `
                <h3>Mobile Email Setup</h3>
                <ol>
                    <li>Open your device's email app</li>
                    <li>Add new email account</li>
                    <li>Enter email: your-email@${domainName}</li>
                    <li>Enter password</li>
                    <li>Select IMAP or POP3 settings</li>
                    <li>Complete setup</li>
                </ol>
            `;
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeContent = document.getElementById(`${tabName}-content`);
        if (activeContent) activeContent.classList.add('active');
    }

    openWebmail(domainName) {
        const webmailUrl = domainName === 'fakelit.com' 
            ? 'https://webmail.fakelit.com' 
            : `https://webmail.${domainName}`;
        
        window.open(webmailUrl, '_blank');
    }

    async getFakelitEmailAccess() {
        try {
            const response = await fetch('/api/email-access/fakelit');
            const result = await response.json();

            if (result.success) {
                return result.accessDetails;
            } else {
                console.error('Failed to get Fakelit email access:', result.message);
                return null;
            }
        } catch (error) {
            console.error('Get Fakelit email access error:', error);
            return null;
        }
    }

    async getDomainEmailAccess(domainName) {
        try {
            const response = await fetch(`/api/email-access/domain/${domainName}`);
            const result = await response.json();

            if (result.success) {
                return result.accessDetails;
            } else {
                console.error(`Failed to get email access for ${domainName}:`, result.message);
                return null;
            }
        } catch (error) {
            console.error(`Get email access error for ${domainName}:`, error);
            return null;
        }
    }

    async getCompleteEmailAccessSummary() {
        try {
            const response = await fetch('/api/email-access/summary');
            const result = await response.json();

            if (result.success) {
                return result.summary;
            } else {
                console.error('Failed to get email access summary:', result.message);
                return null;
            }
        } catch (error) {
            console.error('Get email access summary error:', error);
            return null;
        }
    }

    async updateEmailPassword(domainName, emailAddress, newPassword) {
        try {
            const response = await fetch('/api/email-access/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    domainName,
                    emailAddress,
                    newPassword
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Email password updated successfully', 'success');
                return result.email;
            } else {
                throw new Error(result.message || 'Failed to update email password');
            }
        } catch (error) {
            console.error('Update email password error:', error);
            this.showNotification(error.message || 'Failed to update email password', 'error');
            throw error;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${message}</div>
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

    // Public methods for external use
    getCurrentDomain() {
        return this.currentDomain;
    }

    getDomains() {
        return this.domains;
    }

    getBrandName() {
        return this.brandName;
    }
}

// Initialize email access service when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.emailAccessService = new EmailAccessService();
});

// Global functions for external use
window.getSetupInstructions = (domainName) => {
    if (window.emailAccessService) {
        window.emailAccessService.getSetupInstructions(domainName);
    }
};

window.openWebmail = (domainName) => {
    if (window.emailAccessService) {
        window.emailAccessService.openWebmail(domainName);
    }
};

window.getEmailAccessSummary = () => {
    if (window.emailAccessService) {
        return window.emailAccessService.getCompleteEmailAccessSummary();
    }
    return null;
}; 