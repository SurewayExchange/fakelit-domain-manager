const fs = require('fs').promises;
const path = require('path');
const SMSNotificationService = require('./smsNotificationService');

class TicketingService {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.ticketsDirectory = 'data/tickets';
        this.smsService = new SMSNotificationService();
        
        // Ticket statuses
        this.statuses = {
            OPEN: 'open',
            IN_PROGRESS: 'in_progress',
            WAITING_CUSTOMER: 'waiting_customer',
            RESOLVED: 'resolved',
            CLOSED: 'closed',
            ESCALATED: 'escalated'
        };

        // Priority levels
        this.priorities = {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
            CRITICAL: 'critical'
        };

        // Support tiers
        this.supportTiers = {
            FREE: {
                name: 'Free Support',
                price: 0,
                features: ['Email support', 'Basic response time'],
                responseTime: '24-48 hours'
            },
            AI_SUPPORT: {
                name: 'AI Support with Live Chat',
                price: 150,
                features: ['AI-powered support', 'Live chat', 'Priority response', 'Advanced troubleshooting'],
                responseTime: '2-4 hours'
            },
            PREMIUM: {
                name: 'Premium Integration Support',
                price: 550,
                features: ['AI-powered support', 'Live chat', 'Premium response', 'Integration support', 'Dedicated support team'],
                responseTime: '1-2 hours'
            }
        };

        this.initializeService();
    }

    async initializeService() {
        try {
            await fs.mkdir(this.ticketsDirectory, { recursive: true });
            
            console.log('✅ Ticketing service initialized successfully');
            console.log(`🎫 Support tiers: ${Object.keys(this.supportTiers).length}`);
            console.log(`📱 SMS notifications: ${this.smsService.smsConfig.enabled ? 'Enabled' : 'Disabled'}`);
            console.log(`🏢 ${this.brandName} - Professional support system`);
        } catch (error) {
            console.error('❌ Failed to initialize ticketing service:', error);
        }
    }

    // Create new ticket
    async createTicket(ticketData) {
        try {
            const ticketId = this.generateTicketId();
            const timestamp = new Date().toISOString();
            
            const ticket = {
                id: ticketId,
                customer: ticketData.customer,
                email: ticketData.email,
                subject: ticketData.subject,
                description: ticketData.description,
                priority: ticketData.priority || this.priorities.MEDIUM,
                status: this.statuses.OPEN,
                category: ticketData.category || 'general',
                supportTier: ticketData.supportTier || 'FREE',
                assignedTo: null,
                createdAt: timestamp,
                updatedAt: timestamp,
                messages: [{
                    id: 1,
                    from: ticketData.customer,
                    message: ticketData.description,
                    timestamp: timestamp,
                    type: 'customer'
                }],
                poweredBy: this.brandName
            };

            // Save ticket
            await this.saveTicket(ticket);

            // Send SMS notification for new ticket
            await this.smsService.notifyNewTicket(ticketId, ticketData.customer, ticket.priority);

            console.log(`✅ Ticket ${ticketId} created successfully for ${ticketData.customer}`);
            return { success: true, ticket: ticket };
        } catch (error) {
            console.error('❌ Failed to create ticket:', error);
            return { success: false, error: error.message };
        }
    }

    // Update ticket status
    async updateTicketStatus(ticketId, newStatus, agent = null, message = null) {
        try {
            const ticket = await this.getTicket(ticketId);
            if (!ticket) {
                throw new Error(`Ticket ${ticketId} not found`);
            }

            const oldStatus = ticket.status;
            ticket.status = newStatus;
            ticket.updatedAt = new Date().toISOString();

            if (agent) {
                ticket.assignedTo = agent;
            }

            if (message) {
                ticket.messages.push({
                    id: ticket.messages.length + 1,
                    from: agent || 'System',
                    message: message,
                    timestamp: new Date().toISOString(),
                    type: 'agent'
                });
            }

            // Save updated ticket
            await this.saveTicket(ticket);

            // Send SMS notifications based on status change
            if (newStatus === this.statuses.RESOLVED) {
                await this.smsService.notifyTicketResolved(ticketId, agent || 'System', ticket.customer);
            } else if (newStatus === this.statuses.ESCALATED) {
                await this.smsService.notifyTicketEscalated(ticketId, 'Management', ticket.customer);
            } else {
                await this.smsService.notifyTicketUpdate(ticketId, newStatus, message || 'Status updated');
            }

            console.log(`✅ Ticket ${ticketId} status updated from ${oldStatus} to ${newStatus}`);
            return { success: true, ticket: ticket };
        } catch (error) {
            console.error('❌ Failed to update ticket status:', error);
            return { success: false, error: error.message };
        }
    }

    // Add message to ticket
    async addMessage(ticketId, from, message, type = 'customer') {
        try {
            const ticket = await this.getTicket(ticketId);
            if (!ticket) {
                throw new Error(`Ticket ${ticketId} not found`);
            }

            const newMessage = {
                id: ticket.messages.length + 1,
                from: from,
                message: message,
                timestamp: new Date().toISOString(),
                type: type
            };

            ticket.messages.push(newMessage);
            ticket.updatedAt = new Date().toISOString();

            // Update status if customer replied
            if (type === 'customer' && ticket.status === this.statuses.WAITING_CUSTOMER) {
                ticket.status = this.statuses.IN_PROGRESS;
            }

            // Save updated ticket
            await this.saveTicket(ticket);

            // Send SMS notification for new message
            const statusMessage = type === 'customer' ? 'Customer replied' : 'Agent replied';
            await this.smsService.notifyTicketUpdate(ticketId, ticket.status, statusMessage);

            console.log(`✅ Message added to ticket ${ticketId}`);
            return { success: true, message: newMessage };
        } catch (error) {
            console.error('❌ Failed to add message to ticket:', error);
            return { success: false, error: error.message };
        }
    }

    // Assign ticket to agent
    async assignTicket(ticketId, agent) {
        try {
            const ticket = await this.getTicket(ticketId);
            if (!ticket) {
                throw new Error(`Ticket ${ticketId} not found`);
            }

            ticket.assignedTo = agent;
            ticket.updatedAt = new Date().toISOString();

            // Update status to in progress if it was open
            if (ticket.status === this.statuses.OPEN) {
                ticket.status = this.statuses.IN_PROGRESS;
            }

            // Save updated ticket
            await this.saveTicket(ticket);

            // Send SMS notification for assignment
            await this.smsService.notifyTicketUpdate(ticketId, ticket.status, `Assigned to ${agent}`);

            console.log(`✅ Ticket ${ticketId} assigned to ${agent}`);
            return { success: true, ticket: ticket };
        } catch (error) {
            console.error('❌ Failed to assign ticket:', error);
            return { success: false, error: error.message };
        }
    }

    // Escalate ticket
    async escalateTicket(ticketId, reason, escalatedBy) {
        try {
            const ticket = await this.getTicket(ticketId);
            if (!ticket) {
                throw new Error(`Ticket ${ticketId} not found`);
            }

            ticket.status = this.statuses.ESCALATED;
            ticket.updatedAt = new Date().toISOString();
            ticket.escalatedBy = escalatedBy;
            ticket.escalationReason = reason;

            // Add escalation message
            ticket.messages.push({
                id: ticket.messages.length + 1,
                from: escalatedBy,
                message: `Ticket escalated: ${reason}`,
                timestamp: new Date().toISOString(),
                type: 'system'
            });

            // Save updated ticket
            await this.saveTicket(ticket);

            // Send SMS notification for escalation
            await this.smsService.notifyTicketEscalated(ticketId, 'Management', ticket.customer);

            console.log(`✅ Ticket ${ticketId} escalated by ${escalatedBy}`);
            return { success: true, ticket: ticket };
        } catch (error) {
            console.error('❌ Failed to escalate ticket:', error);
            return { success: false, error: error.message };
        }
    }

    // Resolve ticket
    async resolveTicket(ticketId, resolution, resolvedBy) {
        try {
            const ticket = await this.getTicket(ticketId);
            if (!ticket) {
                throw new Error(`Ticket ${ticketId} not found`);
            }

            ticket.status = this.statuses.RESOLVED;
            ticket.updatedAt = new Date().toISOString();
            ticket.resolvedBy = resolvedBy;
            ticket.resolution = resolution;
            ticket.resolvedAt = new Date().toISOString();

            // Add resolution message
            ticket.messages.push({
                id: ticket.messages.length + 1,
                from: resolvedBy,
                message: `Ticket resolved: ${resolution}`,
                timestamp: new Date().toISOString(),
                type: 'agent'
            });

            // Save updated ticket
            await this.saveTicket(ticket);

            // Send SMS notification for resolution
            await this.smsService.notifyTicketResolved(ticketId, resolvedBy, ticket.customer);

            console.log(`✅ Ticket ${ticketId} resolved by ${resolvedBy}`);
            return { success: true, ticket: ticket };
        } catch (error) {
            console.error('❌ Failed to resolve ticket:', error);
            return { success: false, error: error.message };
        }
    }

    // Get ticket by ID
    async getTicket(ticketId) {
        try {
            const ticketFile = path.join(this.ticketsDirectory, `${ticketId}.json`);
            const ticketData = await fs.readFile(ticketFile, 'utf8');
            return JSON.parse(ticketData);
        } catch (error) {
            return null;
        }
    }

    // Get all tickets
    async getAllTickets() {
        try {
            const files = await fs.readdir(this.ticketsDirectory);
            const tickets = [];

            for (const file of files) {
                if (file.endsWith('.json') && file !== 'ticket-stats.json') {
                    const ticketData = await fs.readFile(path.join(this.ticketsDirectory, file), 'utf8');
                    tickets.push(JSON.parse(ticketData));
                }
            }

            return tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } catch (error) {
            console.error('❌ Failed to get all tickets:', error);
            return [];
        }
    }

    // Get tickets by status
    async getTicketsByStatus(status) {
        try {
            const allTickets = await this.getAllTickets();
            return allTickets.filter(ticket => ticket.status === status);
        } catch (error) {
            console.error('❌ Failed to get tickets by status:', error);
            return [];
        }
    }

    // Get tickets by priority
    async getTicketsByPriority(priority) {
        try {
            const allTickets = await this.getAllTickets();
            return allTickets.filter(ticket => ticket.priority === priority);
        } catch (error) {
            console.error('❌ Failed to get tickets by priority:', error);
            return [];
        }
    }

    // Save ticket
    async saveTicket(ticket) {
        try {
            const ticketFile = path.join(this.ticketsDirectory, `${ticket.id}.json`);
            await fs.writeFile(ticketFile, JSON.stringify(ticket, null, 2));
        } catch (error) {
            throw new Error(`Failed to save ticket: ${error.message}`);
        }
    }

    // Generate ticket ID
    generateTicketId() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substr(2, 5);
        return `TKT-${timestamp}-${random}`.toUpperCase();
    }

    // Get ticket statistics
    async getTicketStats() {
        try {
            const allTickets = await this.getAllTickets();
            
            const stats = {
                total: allTickets.length,
                open: allTickets.filter(t => t.status === this.statuses.OPEN).length,
                inProgress: allTickets.filter(t => t.status === this.statuses.IN_PROGRESS).length,
                waitingCustomer: allTickets.filter(t => t.status === this.statuses.WAITING_CUSTOMER).length,
                resolved: allTickets.filter(t => t.status === this.statuses.RESOLVED).length,
                closed: allTickets.filter(t => t.status === this.statuses.CLOSED).length,
                escalated: allTickets.filter(t => t.status === this.statuses.ESCALATED).length,
                critical: allTickets.filter(t => t.priority === this.priorities.CRITICAL).length,
                high: allTickets.filter(t => t.priority === this.priorities.HIGH).length,
                medium: allTickets.filter(t => t.priority === this.priorities.MEDIUM).length,
                low: allTickets.filter(t => t.priority === this.priorities.LOW).length,
                supportTiers: this.supportTiers,
                statuses: this.statuses,
                priorities: this.priorities,
                poweredBy: this.brandName
            };

            // Save stats
            await fs.writeFile(
                path.join(this.ticketsDirectory, 'ticket-stats.json'),
                JSON.stringify(stats, null, 2)
            );

            return stats;
        } catch (error) {
            console.error('❌ Failed to get ticket stats:', error);
            return null;
        }
    }

    // Get support tiers
    getSupportTiers() {
        return this.supportTiers;
    }

    // Get statuses
    getStatuses() {
        return this.statuses;
    }

    // Get priorities
    getPriorities() {
        return this.priorities;
    }
}

module.exports = TicketingService; 