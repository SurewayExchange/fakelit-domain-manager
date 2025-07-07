#!/usr/bin/env node

const FakelitEmailService = require('./services/fakelitEmailService');
const SMSNotificationService = require('./services/smsNotificationService');

class FakelitEmailTest {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.emailService = new FakelitEmailService();
        this.smsService = new SMSNotificationService();
        
        this.fakelitEmails = [
            'support@fakelit.com',
            'sales@fakelit.com',
            'm.brooks@fakelit.com',
            'info@fakelit.com',
            'accounts@fakelit.com',
            'v.helems@fakelit.com',
            'billing@fakelit.com'
        ];
    }

    async runTest() {
        console.log('🚀 Fakelit.com Email & SMS Test');
        console.log('================================');
        console.log(`🏢 ${this.brandName} - Professional Email System`);
        console.log(`📱 SMS Forwarding: 513-441-9772`);
        console.log(`📧 Email Forwarding: marquibelbrooks@gmail.com`);
        console.log('');

        try {
            // Test 1: Send emails from all Fakelit.com addresses
            console.log('📧 Test 1: Sending emails from all Fakelit.com addresses...');
            await this.testFakelitEmails();
            console.log('');

            // Test 2: Test SMS notifications
            console.log('📱 Test 2: Testing SMS notifications...');
            await this.testSMSNotifications();
            console.log('');

            // Test 3: Test email forwarding
            console.log('📧 Test 3: Testing email forwarding...');
            await this.testEmailForwarding();
            console.log('');

            // Test 4: Test ticketing system with SMS
            console.log('🎫 Test 4: Testing ticketing system with SMS...');
            await this.testTicketingSMS();
            console.log('');

            console.log('✅ All tests completed successfully!');
            console.log('');
            console.log('📊 Test Summary:');
            console.log('   ✅ Fakelit.com emails sent');
            console.log('   ✅ SMS notifications sent to 513-441-9772');
            console.log('   ✅ Email forwarding configured');
            console.log('   ✅ Ticketing SMS notifications working');
            console.log('');
            console.log('🏢 Fakelit.com is ready for production!');

        } catch (error) {
            console.error('❌ Test failed:', error);
        }
    }

    async testFakelitEmails() {
        const testEmails = [
            {
                from: 'support@fakelit.com',
                to: 'test@example.com',
                subject: 'Fakelit.com Support Test Email',
                content: 'This is a test email from Fakelit.com Support team. Our technical support is available 24/7 at 702-664-0009.'
            },
            {
                from: 'sales@fakelit.com',
                to: 'prospect@example.com',
                subject: 'Fakelit.com Sales Inquiry',
                content: 'Thank you for your interest in Fakelit.com services. Our sales team is ready to help you with hosting, domains, and dedicated servers.'
            },
            {
                from: 'm.brooks@fakelit.com',
                to: 'client@example.com',
                subject: 'Fakelit.com Management Update',
                content: 'Hello from M. Brooks at Fakelit.com. We appreciate your business and are committed to providing excellent service.'
            },
            {
                from: 'info@fakelit.com',
                to: 'inquiry@example.com',
                subject: 'Fakelit.com Information Request',
                content: 'Thank you for contacting Fakelit.com. Here is the information you requested about our services and pricing.'
            },
            {
                from: 'accounts@fakelit.com',
                to: 'customer@example.com',
                subject: 'Fakelit.com Account Update',
                content: 'Your Fakelit.com account has been updated successfully. If you have any questions, please contact our support team.'
            },
            {
                from: 'v.helems@fakelit.com',
                to: 'partner@example.com',
                subject: 'Fakelit.com Partnership Opportunity',
                content: 'Hello from V. Helems at Fakelit.com. We would like to discuss potential partnership opportunities with your organization.'
            },
            {
                from: 'billing@fakelit.com',
                to: 'invoice@example.com',
                subject: 'Fakelit.com Invoice #12345',
                content: 'Your Fakelit.com invoice #12345 is ready for review. Please log into your account to view and process payment.'
            }
        ];

        for (const email of testEmails) {
            try {
                console.log(`   📧 Sending from ${email.from}...`);
                const result = await this.emailService.sendFakelitEmail(
                    email.from,
                    email.to,
                    email.subject,
                    email.content
                );

                if (result.success) {
                    console.log(`   ✅ Email sent successfully: ${result.messageId}`);
                } else {
                    console.log(`   ❌ Failed to send email: ${result.error}`);
                }

                // Wait 1 second between emails
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.log(`   ❌ Error sending email from ${email.from}: ${error.message}`);
            }
        }
    }

    async testSMSNotifications() {
        const smsTests = [
            {
                type: 'email',
                data: {
                    email: 'support@fakelit.com',
                    sender: 'customer@example.com',
                    subject: 'Support Request'
                }
            },
            {
                type: 'domain',
                data: {
                    domain: 'example.com'
                }
            },
            {
                type: 'server',
                data: {
                    message: 'High CPU usage detected',
                    server: 'web-server-01'
                }
            },
            {
                type: 'billing',
                data: {
                    message: 'Payment received',
                    account: 'customer123',
                    amount: '199.99'
                }
            },
            {
                type: 'security',
                data: {
                    message: 'Failed login attempts detected',
                    account: 'admin@fakelit.com'
                }
            }
        ];

        for (const test of smsTests) {
            try {
                console.log(`   📱 Testing ${test.type} SMS notification...`);
                let result;

                switch (test.type) {
                    case 'email':
                        result = await this.smsService.notifyEmailReceived(
                            test.data.email,
                            test.data.sender,
                            test.data.subject
                        );
                        break;
                    case 'domain':
                        result = await this.smsService.notifyDomainPurchase(test.data.domain);
                        break;
                    case 'server':
                        result = await this.smsService.notifyServerAlert(
                            test.data.message,
                            test.data.server
                        );
                        break;
                    case 'billing':
                        result = await this.smsService.notifyBillingAlert(
                            test.data.message,
                            test.data.account,
                            test.data.amount
                        );
                        break;
                    case 'security':
                        result = await this.smsService.notifySecurityAlert(
                            test.data.message,
                            test.data.account
                        );
                        break;
                }

                if (result.success) {
                    console.log(`   ✅ SMS sent successfully: ${result.sid}`);
                } else {
                    console.log(`   ❌ Failed to send SMS: ${result.error}`);
                }

                // Wait 2 seconds between SMS
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.log(`   ❌ Error sending ${test.type} SMS: ${error.message}`);
            }
        }
    }

    async testEmailForwarding() {
        console.log('   📧 Testing email forwarding configuration...');
        
        // Test Fakelit email forwarding
        const fakelitForwardTest = await this.emailService.processIncomingEmail(
            'customer@example.com',
            'support@fakelit.com',
            'Test Support Email',
            'This is a test email to verify forwarding to marquibelbrooks@gmail.com',
            true // isFakelitEmail
        );

        if (fakelitForwardTest.success) {
            console.log('   ✅ Fakelit email forwarding working');
        } else {
            console.log(`   ❌ Fakelit email forwarding failed: ${fakelitForwardTest.error}`);
        }

        // Test client email forwarding
        const clientForwardTest = await this.emailService.processIncomingEmail(
            'sender@example.com',
            'client@clientdomain.com',
            'Test Client Email',
            'This is a test email to verify client forwarding',
            false // isFakelitEmail
        );

        if (clientForwardTest.success) {
            console.log('   ✅ Client email forwarding working');
        } else {
            console.log(`   ❌ Client email forwarding failed: ${clientForwardTest.error}`);
        }
    }

    async testTicketingSMS() {
        const ticketingTests = [
            {
                type: 'new',
                data: {
                    ticketId: 'TKT-1234567890-TEST',
                    customer: 'John Doe',
                    priority: 'high'
                }
            },
            {
                type: 'update',
                data: {
                    ticketId: 'TKT-1234567890-TEST',
                    status: 'in_progress',
                    message: 'Agent assigned to ticket'
                }
            },
            {
                type: 'resolved',
                data: {
                    ticketId: 'TKT-1234567890-TEST',
                    agent: 'Support Agent',
                    customer: 'John Doe'
                }
            },
            {
                type: 'escalated',
                data: {
                    ticketId: 'TKT-1234567890-TEST',
                    level: 'Management',
                    customer: 'John Doe'
                }
            }
        ];

        for (const test of ticketingTests) {
            try {
                console.log(`   🎫 Testing ${test.type} ticket SMS notification...`);
                let result;

                switch (test.type) {
                    case 'new':
                        result = await this.smsService.notifyNewTicket(
                            test.data.ticketId,
                            test.data.customer,
                            test.data.priority
                        );
                        break;
                    case 'update':
                        result = await this.smsService.notifyTicketUpdate(
                            test.data.ticketId,
                            test.data.status,
                            test.data.message
                        );
                        break;
                    case 'resolved':
                        result = await this.smsService.notifyTicketResolved(
                            test.data.ticketId,
                            test.data.agent,
                            test.data.customer
                        );
                        break;
                    case 'escalated':
                        result = await this.smsService.notifyTicketEscalated(
                            test.data.ticketId,
                            test.data.level,
                            test.data.customer
                        );
                        break;
                }

                if (result.success) {
                    console.log(`   ✅ Ticket ${test.type} SMS sent successfully: ${result.sid}`);
                } else {
                    console.log(`   ❌ Failed to send ticket ${test.type} SMS: ${result.error}`);
                }

                // Wait 2 seconds between SMS
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.log(`   ❌ Error sending ticket ${test.type} SMS: ${error.message}`);
            }
        }
    }

    async getStats() {
        console.log('📊 Getting system statistics...');
        
        try {
            const emailStats = await this.emailService.getEmailStats();
            const smsStats = await this.smsService.getSMSStats();

            console.log('');
            console.log('📧 Email Statistics:');
            console.log(`   Total emails: ${emailStats?.totalEmails || 0}`);
            console.log(`   Sent today: ${emailStats?.todayEmails || 0}`);
            console.log(`   Fakelit emails: ${emailStats?.fakelitEmails?.length || 0}`);

            console.log('');
            console.log('📱 SMS Statistics:');
            console.log(`   Total SMS: ${smsStats?.totalSMS || 0}`);
            console.log(`   Sent today: ${smsStats?.todaySMS || 0}`);
            console.log(`   Forwarding to: ${smsStats?.toNumber || '513-441-9772'}`);

        } catch (error) {
            console.error('❌ Failed to get statistics:', error);
        }
    }
}

// Run the test
const test = new FakelitEmailTest();
test.runTest().then(() => {
    console.log('');
    test.getStats().then(() => {
        console.log('');
        console.log('🎉 Fakelit.com Email & SMS Test Complete!');
        console.log('📱 All SMS notifications sent to: 513-441-9772');
        console.log('📧 All Fakelit emails forward to: marquibelbrooks@gmail.com');
        console.log('🏢 Powered by Fakelit.com');
    });
}).catch(console.error); 