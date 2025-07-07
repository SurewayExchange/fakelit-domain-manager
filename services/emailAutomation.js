const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailAutomationService {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.supportEmail = 'support@fakelit.com';
        this.infoEmail = 'info@fakelit.com';
        this.salesEmail = 'sales@fakelit.com';
        
        // Email templates cache
        this.templates = {};
        
        // Initialize email transporter
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || 'info@fakelit.com',
                pass: process.env.SMTP_PASS || 'your-smtp-password'
            }
        });
        
        this.loadTemplates();
    }

    async loadTemplates() {
        try {
            const templatesDir = path.join(__dirname, '../templates/emails');
            const templateFiles = await fs.readdir(templatesDir);
            
            for (const file of templateFiles) {
                if (file.endsWith('.html')) {
                    const templateName = file.replace('.html', '');
                    const templateContent = await fs.readFile(path.join(templatesDir, file), 'utf8');
                    this.templates[templateName] = templateContent;
                }
            }
            
            console.log('✅ Email templates loaded successfully');
        } catch (error) {
            console.log('⚠️ Using default email templates');
            this.loadDefaultTemplates();
        }
    }

    loadDefaultTemplates() {
        this.templates = {
            welcome: this.getWelcomeTemplate(),
            inquiry: this.getInquiryTemplate(),
            quote: this.getQuoteTemplate(),
            support: this.getSupportTemplate(),
            order: this.getOrderTemplate(),
            payment: this.getPaymentTemplate(),
            scaling: this.getScalingTemplate(),
            newsletter: this.getNewsletterTemplate()
        };
    }

    async sendAutomatedReply(type, recipient, data = {}) {
        try {
            const template = this.templates[type];
            if (!template) {
                throw new Error(`Email template '${type}' not found`);
            }

            const emailContent = this.replacePlaceholders(template, {
                ...data,
                recipientName: data.recipientName || 'Valued Customer',
                brandName: this.brandName,
                supportEmail: this.supportEmail,
                infoEmail: this.infoEmail,
                salesEmail: this.salesEmail,
                currentDate: new Date().toLocaleDateString(),
                currentYear: new Date().getFullYear()
            });

            const mailOptions = {
                from: `"${this.brandName}" <${this.infoEmail}>`,
                to: recipient,
                subject: this.getSubject(type, data),
                html: emailContent,
                text: this.htmlToText(emailContent)
            };

            const result = await this.transporter.sendMail(mailOptions);
            
            console.log(`✅ Automated email sent: ${type} to ${recipient}`);
            return result;
        } catch (error) {
            console.error(`❌ Failed to send automated email: ${error.message}`);
            throw error;
        }
    }

    getSubject(type, data = {}) {
        const subjects = {
            welcome: `Welcome to ${this.brandName} - Your Professional Hosting Partner`,
            inquiry: `Thank you for your inquiry - ${this.brandName}`,
            quote: `Your custom quote from ${this.brandName}`,
            support: `Support ticket received - ${this.brandName}`,
            order: `Order confirmation - ${this.brandName}`,
            payment: `Payment processing update - ${this.brandName}`,
            scaling: `Server scaling notification - ${this.brandName}`,
            newsletter: `Latest updates from ${this.brandName}`
        };
        
        return subjects[type] || `Message from ${this.brandName}`;
    }

    replacePlaceholders(template, data) {
        let content = template;
        Object.keys(data).forEach(key => {
            const placeholder = `{{${key}}}`;
            content = content.replace(new RegExp(placeholder, 'g'), data[key]);
        });
        return content;
    }

    htmlToText(html) {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    // Email Templates
    getWelcomeTemplate() {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{brandName}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5, #10B981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{brandName}}!</h1>
            <p>Professional Hosting & Payment Solutions</p>
        </div>
        <div class="content">
            <h2>Hello {{recipientName}},</h2>
            <p>Welcome to {{brandName}}! We're excited to have you as part of our community of professional businesses.</p>
            
            <h3>What we offer:</h3>
            <ul>
                <li>🌐 <strong>Web Hosting:</strong> Scalable hosting solutions with auto-scaling</li>
                <li>💳 <strong>Payment Processing:</strong> NMI terminals and gateway integration</li>
                <li>🏷️ <strong>Domain Management:</strong> Professional domain services</li>
                <li>💻 <strong>Web Development:</strong> Custom solutions for your business</li>
            </ul>
            
            <h3>Get Started:</h3>
            <p>Ready to launch your business with professional solutions?</p>
            <a href="https://{{brandName}}/products" class="button">View Our Products</a>
            <a href="https://{{brandName}}/contact" class="button">Contact Sales</a>
            
            <h3>24/7 Support:</h3>
            <p>Our professional support team is available around the clock:</p>
            <ul>
                <li>📧 Email: {{supportEmail}}</li>
                <li>📞 Phone: (555) 123-4567</li>
                <li>💬 Live Chat: Available on our website</li>
            </ul>
        </div>
        <div class="footer">
            <p>Powered by {{brandName}} | {{currentDate}}</p>
            <p>&copy; {{currentYear}} {{brandName}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    }

    getInquiryTemplate() {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inquiry Received - {{brandName}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5, #10B981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Inquiry Received</h1>
            <p>{{brandName}} - Professional Solutions</p>
        </div>
        <div class="content">
            <h2>Hello {{recipientName}},</h2>
            <p>Thank you for your inquiry to {{brandName}}! We've received your message and our professional team is reviewing your requirements.</p>
            
            <div class="highlight">
                <h3>What happens next:</h3>
                <ul>
                    <li>✅ We'll review your requirements within 2 hours</li>
                    <li>📞 A specialist will contact you with a custom solution</li>
                    <li>💼 You'll receive a detailed proposal and quote</li>
                    <li>🚀 We'll help you get started with implementation</li>
                </ul>
            </div>
            
            <h3>Service Interest: {{serviceInterest}}</h3>
            <p>Based on your inquiry about <strong>{{serviceInterest}}</strong>, we'll provide you with the most suitable solution for your business needs.</p>
            
            <h3>Quick Links:</h3>
            <a href="https://{{brandName}}/products" class="button">View Products</a>
            <a href="https://{{brandName}}/services" class="button">Our Services</a>
            
            <h3>Need immediate assistance?</h3>
            <p>Our support team is available 24/7:</p>
            <ul>
                <li>📧 {{supportEmail}}</li>
                <li>📞 (555) 123-4567</li>
                <li>💬 Live chat on our website</li>
            </ul>
        </div>
        <div class="footer">
            <p>Powered by {{brandName}} | {{currentDate}}</p>
            <p>&copy; {{currentYear}} {{brandName}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    }

    getQuoteTemplate() {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Quote - {{brandName}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5, #10B981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .quote-box { background: white; border: 2px solid #4F46E5; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .price { font-size: 24px; font-weight: bold; color: #4F46E5; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Custom Quote</h1>
            <p>{{brandName}} - Professional Solutions</p>
        </div>
        <div class="content">
            <h2>Hello {{recipientName}},</h2>
            <p>Thank you for your interest in {{brandName}}! We've prepared a custom quote based on your requirements.</p>
            
            <div class="quote-box">
                <h3>Quote Summary</h3>
                <p><strong>Service:</strong> {{serviceType}}</p>
                <p><strong>Package:</strong> {{packageName}}</p>
                <p><strong>Setup Fee:</strong> <span class="price">${{setupFee}}</span></p>
                <p><strong>Monthly Fee:</strong> <span class="price">${{monthlyFee}}</span></p>
                <p><strong>Additional Features:</strong> {{additionalFeatures}}</p>
            </div>
            
            <h3>What's included:</h3>
            <ul>
                <li>✅ Professional setup and configuration</li>
                <li>✅ 24/7 technical support</li>
                <li>✅ Performance monitoring</li>
                <li>✅ Security features</li>
                <li>✅ Regular backups</li>
            </ul>
            
            <h3>Next Steps:</h3>
            <a href="https://{{brandName}}/contact" class="button">Accept Quote</a>
            <a href="mailto:{{salesEmail}}" class="button">Request Changes</a>
            
            <p><strong>Quote valid until:</strong> {{validUntil}}</p>
        </div>
        <div class="footer">
            <p>Powered by {{brandName}} | {{currentDate}}</p>
            <p>&copy; {{currentYear}} {{brandName}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    }

    getSupportTemplate() {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Ticket - {{brandName}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5, #10B981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .ticket-info { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Support Ticket Received</h1>
            <p>{{brandName}} - 24/7 Support</p>
        </div>
        <div class="content">
            <h2>Hello {{recipientName}},</h2>
            <p>Thank you for contacting {{brandName}} support! We've received your support request and our team is working on it.</p>
            
            <div class="ticket-info">
                <h3>Ticket Information:</h3>
                <p><strong>Ticket ID:</strong> #{{ticketId}}</p>
                <p><strong>Priority:</strong> {{priority}}</p>
                <p><strong>Category:</strong> {{category}}</p>
                <p><strong>Status:</strong> {{status}}</p>
            </div>
            
            <h3>What happens next:</h3>
            <ul>
                <li>✅ Your ticket has been assigned to a specialist</li>
                <li>⏰ We'll respond within 2 hours during business hours</li>
                <li>🔧 Our team will work to resolve your issue</li>
                <li>📧 You'll receive updates on the progress</li>
            </ul>
            
            <h3>Need immediate assistance?</h3>
            <p>For urgent issues, please call our 24/7 support line:</p>
            <p><strong>📞 (555) 123-4567</strong></p>
            
            <a href="https://{{brandName}}/contact" class="button">View Support Portal</a>
        </div>
        <div class="footer">
            <p>Powered by {{brandName}} | {{currentDate}}</p>
            <p>&copy; {{currentYear}} {{brandName}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    }

    getOrderTemplate() {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - {{brandName}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5, #10B981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; border: 2px solid #4F46E5; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation</h1>
            <p>{{brandName}} - Thank you for your order!</p>
        </div>
        <div class="content">
            <h2>Hello {{recipientName}},</h2>
            <p>Thank you for your order with {{brandName}}! We're excited to help you with your professional hosting and payment solutions.</p>
            
            <div class="order-details">
                <h3>Order Details:</h3>
                <p><strong>Order ID:</strong> #{{orderId}}</p>
                <p><strong>Product:</strong> {{productName}}</p>
                <p><strong>Total Amount:</strong> ${{totalAmount}}</p>
                <p><strong>Order Date:</strong> {{orderDate}}</p>
                <p><strong>Estimated Setup:</strong> {{setupTime}}</p>
            </div>
            
            <h3>What happens next:</h3>
            <ul>
                <li>✅ We'll process your payment securely</li>
                <li>🔧 Our team will begin setup within 24 hours</li>
                <li>📧 You'll receive setup instructions</li>
                <li>🎯 Your service will be ready for use</li>
            </ul>
            
            <h3>Support & Questions:</h3>
            <p>Our team is here to help you every step of the way:</p>
            <ul>
                <li>📧 {{supportEmail}}</li>
                <li>📞 (555) 123-4567</li>
                <li>💬 Live chat on our website</li>
            </ul>
            
            <a href="https://{{brandName}}/dashboard" class="button">View Order Status</a>
        </div>
        <div class="footer">
            <p>Powered by {{brandName}} | {{currentDate}}</p>
            <p>&copy; {{currentYear}} {{brandName}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    }

    getPaymentTemplate() {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Update - {{brandName}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5, #10B981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .payment-status { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Update</h1>
            <p>{{brandName}} - Payment Processing</p>
        </div>
        <div class="content">
            <h2>Hello {{recipientName}},</h2>
            <p>This is an update regarding your payment with {{brandName}}.</p>
            
            <div class="payment-status">
                <h3>Payment Status: {{paymentStatus}}</h3>
                <p><strong>Transaction ID:</strong> {{transactionId}}</p>
                <p><strong>Amount:</strong> ${{amount}}</p>
                <p><strong>Date:</strong> {{paymentDate}}</p>
                <p><strong>Method:</strong> {{paymentMethod}}</p>
            </div>
            
            <h3>What this means:</h3>
            <p>{{statusDescription}}</p>
            
            <h3>Next Steps:</h3>
            <ul>
                <li>{{nextSteps}}</li>
            </ul>
            
            <h3>Need Help?</h3>
            <p>If you have any questions about this payment, please contact us:</p>
            <ul>
                <li>📧 {{supportEmail}}</li>
                <li>📞 (555) 123-4567</li>
            </ul>
            
            <a href="https://{{brandName}}/dashboard" class="button">View Account</a>
        </div>
        <div class="footer">
            <p>Powered by {{brandName}} | {{currentDate}}</p>
            <p>&copy; {{currentYear}} {{brandName}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    }

    getScalingTemplate() {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Scaling - {{brandName}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5, #10B981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .scaling-info { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Server Scaling Notification</h1>
            <p>{{brandName}} - Auto-Scaling System</p>
        </div>
        <div class="content">
            <h2>Hello {{recipientName}},</h2>
            <p>Your {{brandName}} server has been automatically scaled to accommodate your growing business needs.</p>
            
            <div class="scaling-info">
                <h3>Scaling Details:</h3>
                <p><strong>Previous Capacity:</strong> {{previousCapacity}} Magento sites</p>
                <p><strong>New Capacity:</strong> {{newCapacity}} Magento sites</p>
                <p><strong>Scaling Date:</strong> {{scalingDate}}</p>
                <p><strong>Reason:</strong> {{scalingReason}}</p>
            </div>
            
            <h3>What this means for you:</h3>
            <ul>
                <li>✅ Your websites will continue running smoothly</li>
                <li>📈 Better performance for your customers</li>
                <li>🔒 Enhanced security and reliability</li>
                <li>📊 Improved monitoring and support</li>
            </ul>
            
            <h3>Billing Update:</h3>
            <p>Your monthly fee has been adjusted to reflect the new capacity:</p>
            <p><strong>New Monthly Fee:</strong> ${{newMonthlyFee}}</p>
            
            <h3>Questions?</h3>
            <p>Our team is here to help with any questions about the scaling:</p>
            <ul>
                <li>📧 {{supportEmail}}</li>
                <li>📞 (555) 123-4567</li>
            </ul>
            
            <a href="https://{{brandName}}/dashboard" class="button">View Server Status</a>
        </div>
        <div class="footer">
            <p>Powered by {{brandName}} | {{currentDate}}</p>
            <p>&copy; {{currentYear}} {{brandName}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    }

    getNewsletterTemplate() {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{newsletterTitle}} - {{brandName}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5, #10B981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .newsletter-item { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{newsletterTitle}}</h1>
            <p>{{brandName}} - Latest Updates</p>
        </div>
        <div class="content">
            <h2>Hello {{recipientName}},</h2>
            <p>Here are the latest updates and news from {{brandName}}:</p>
            
            <div class="newsletter-item">
                <h3>{{updateTitle1}}</h3>
                <p>{{updateContent1}}</p>
                <a href="{{updateLink1}}" class="button">Learn More</a>
            </div>
            
            <div class="newsletter-item">
                <h3>{{updateTitle2}}</h3>
                <p>{{updateContent2}}</p>
                <a href="{{updateLink2}}" class="button">Learn More</a>
            </div>
            
            <h3>Special Offers:</h3>
            <p>{{specialOffer}}</p>
            
            <h3>Stay Connected:</h3>
            <a href="https://{{brandName}}/contact" class="button">Contact Us</a>
            <a href="https://{{brandName}}/products" class="button">View Products</a>
        </div>
        <div class="footer">
            <p>Powered by {{brandName}} | {{currentDate}}</p>
            <p>&copy; {{currentYear}} {{brandName}}. All rights reserved.</p>
            <p><a href="{{unsubscribeLink}}">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`;
    }
}

module.exports = EmailAutomationService; 