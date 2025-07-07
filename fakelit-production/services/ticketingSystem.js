const fs = require('fs').promises;
const path = require('path');
const EmailAutomationService = require('./emailAutomation');

class TicketingSystem {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.ticketsFile = 'data/tickets.json';
        this.counterFile = 'data/ticket-counter.json';
        this.emailService = new EmailAutomationService();
        this.initializeSystem();
    }

    async initializeSystem() {
        try {
            // Create data directory if it doesn't exist
            await fs.mkdir('data', { recursive: true });
            
            // Initialize tickets file
            try {
                await fs.access(this.ticketsFile);
            } catch {
                await fs.writeFile(this.ticketsFile, JSON.stringify([], null, 2));
            }
            
            // Initialize counter file
            try {
                await fs.access(this.counterFile);
            } catch {
                await fs.writeFile(this.counterFile, JSON.stringify({ counter: 1000 }, null, 2));
            }
            
            console.log('✅ Ticketing system initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize ticketing system:', error);
        }
    }

    async generateTicketId() {
        try {
            const counterData = await fs.readFile(this.counterFile, 'utf8');
            const counter = JSON.parse(counterData);
            counter.counter += 1;
            await fs.writeFile(this.counterFile, JSON.stringify(counter, null, 2));
            return `TKT-${counter.counter}`;
        } catch (error) {
            console.error('Error generating ticket ID:', error);
            return `TKT-${Date.now()}`;
        }
    }

    async createTicket(ticketData) {
        try {
            const ticketId = await this.generateTicketId();
            const ticket = {
                id: ticketId,
                status: 'open',
                priority: ticketData.priority || 'normal',
                category: ticketData.category || 'general',
                subject: ticketData.subject,
                description: ticketData.description,
                customer: {
                    name: ticketData.customerName,
                    email: ticketData.customerEmail,
                    phone: ticketData.customerPhone || '',
                    company: ticketData.customerCompany || ''
                },
                assignedTo: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                responses: [],
                tags: ticketData.tags || [],
                attachments: [],
                poweredBy: this.brandName
            };

            // Read existing tickets
            const ticketsData = await fs.readFile(this.ticketsFile, 'utf8');
            const tickets = JSON.parse(ticketsData);
            
            // Add new ticket
            tickets.push(ticket);
            
            // Save updated tickets
            await fs.writeFile(this.ticketsFile, JSON.stringify(tickets, null, 2));

            // Send confirmation email
            await this.emailService.sendAutomatedReply('support', ticketData.customerEmail, {
                recipientName: ticketData.customerName,
                ticketId: ticketId,
                priority: ticket.priority,
                category: ticket.category,
                status: ticket.status
            });

            console.log(`✅ Ticket created: ${ticketId}`);
            return ticket;
        } catch (error) {
            console.error('❌ Failed to create ticket:', error);
            throw error;
        }
    }

    async getTicket(ticketId) {
        try {
            const ticketsData = await fs.readFile(this.ticketsFile, 'utf8');
            const tickets = JSON.parse(ticketsData);
            return tickets.find(ticket => ticket.id === ticketId);
        } catch (error) {
            console.error('❌ Failed to get ticket:', error);
            return null;
        }
    }

    async getAllTickets(filters = {}) {
        try {
            const ticketsData = await fs.readFile(this.ticketsFile, 'utf8');
            let tickets = JSON.parse(ticketsData);

            // Apply filters
            if (filters.status) {
                tickets = tickets.filter(ticket => ticket.status === filters.status);
            }
            if (filters.priority) {
                tickets = tickets.filter(ticket => ticket.priority === filters.priority);
            }
            if (filters.category) {
                tickets = tickets.filter(ticket => ticket.category === filters.category);
            }
            if (filters.customerEmail) {
                tickets = tickets.filter(ticket => ticket.customer.email === filters.customerEmail);
            }

            return tickets;
        } catch (error) {
            console.error('❌ Failed to get tickets:', error);
            return [];
        }
    }

    async updateTicket(ticketId, updates) {
        try {
            const ticketsData = await fs.readFile(this.ticketsFile, 'utf8');
            const tickets = JSON.parse(ticketsData);
            
            const ticketIndex = tickets.findIndex(ticket => ticket.id === ticketId);
            if (ticketIndex === -1) {
                throw new Error('Ticket not found');
            }

            // Update ticket
            tickets[ticketIndex] = {
                ...tickets[ticketIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            // Save updated tickets
            await fs.writeFile(this.ticketsFile, JSON.stringify(tickets, null, 2));

            console.log(`✅ Ticket updated: ${ticketId}`);
            return tickets[ticketIndex];
        } catch (error) {
            console.error('❌ Failed to update ticket:', error);
            throw error;
        }
    }

    async addResponse(ticketId, response) {
        try {
            const ticket = await this.getTicket(ticketId);
            if (!ticket) {
                throw new Error('Ticket not found');
            }

            const newResponse = {
                id: `RESP-${Date.now()}`,
                author: response.author,
                authorType: response.authorType || 'customer', // customer, agent, system
                content: response.content,
                timestamp: new Date().toISOString(),
                internal: response.internal || false
            };

            ticket.responses.push(newResponse);
            ticket.updatedAt = new Date().toISOString();

            await this.updateTicket(ticketId, ticket);

            // Send email notification if response is from agent
            if (response.authorType === 'agent' && !response.internal) {
                await this.emailService.sendAutomatedReply('support', ticket.customer.email, {
                    recipientName: ticket.customer.name,
                    ticketId: ticketId,
                    priority: ticket.priority,
                    category: ticket.category,
                    status: ticket.status,
                    responseContent: response.content
                });
            }

            console.log(`✅ Response added to ticket: ${ticketId}`);
            return newResponse;
        } catch (error) {
            console.error('❌ Failed to add response:', error);
            throw error;
        }
    }

    async changeStatus(ticketId, newStatus, agentName = null) {
        try {
            const updates = {
                status: newStatus,
                updatedAt: new Date().toISOString()
            };

            if (agentName) {
                updates.assignedTo = agentName;
            }

            const updatedTicket = await this.updateTicket(ticketId, updates);

            // Send status update email
            await this.emailService.sendAutomatedReply('support', updatedTicket.customer.email, {
                recipientName: updatedTicket.customer.name,
                ticketId: ticketId,
                priority: updatedTicket.priority,
                category: updatedTicket.category,
                status: newStatus
            });

            return updatedTicket;
        } catch (error) {
            console.error('❌ Failed to change ticket status:', error);
            throw error;
        }
    }

    async assignTicket(ticketId, agentName) {
        try {
            const updates = {
                assignedTo: agentName,
                updatedAt: new Date().toISOString()
            };

            return await this.updateTicket(ticketId, updates);
        } catch (error) {
            console.error('❌ Failed to assign ticket:', error);
            throw error;
        }
    }

    async getTicketStats() {
        try {
            const tickets = await this.getAllTickets();
            
            const stats = {
                total: tickets.length,
                open: tickets.filter(t => t.status === 'open').length,
                inProgress: tickets.filter(t => t.status === 'in-progress').length,
                resolved: tickets.filter(t => t.status === 'resolved').length,
                closed: tickets.filter(t => t.status === 'closed').length,
                highPriority: tickets.filter(t => t.priority === 'high').length,
                mediumPriority: tickets.filter(t => t.priority === 'medium').length,
                lowPriority: tickets.filter(t => t.priority === 'low').length,
                averageResponseTime: this.calculateAverageResponseTime(tickets),
                poweredBy: this.brandName
            };

            return stats;
        } catch (error) {
            console.error('❌ Failed to get ticket stats:', error);
            return null;
        }
    }

    calculateAverageResponseTime(tickets) {
        try {
            const responseTimes = tickets
                .filter(ticket => ticket.responses.length > 1)
                .map(ticket => {
                    const firstResponse = ticket.responses[1]; // First agent response
                    const createdAt = new Date(ticket.createdAt);
                    const responseTime = new Date(firstResponse.timestamp);
                    return responseTime - createdAt;
                })
                .filter(time => time > 0);

            if (responseTimes.length === 0) return 0;

            const averageMs = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
            return Math.round(averageMs / (1000 * 60 * 60)); // Convert to hours
        } catch (error) {
            return 0;
        }
    }

    async searchTickets(query) {
        try {
            const tickets = await this.getAllTickets();
            
            return tickets.filter(ticket => 
                ticket.subject.toLowerCase().includes(query.toLowerCase()) ||
                ticket.description.toLowerCase().includes(query.toLowerCase()) ||
                ticket.customer.name.toLowerCase().includes(query.toLowerCase()) ||
                ticket.customer.email.toLowerCase().includes(query.toLowerCase()) ||
                ticket.id.toLowerCase().includes(query.toLowerCase())
            );
        } catch (error) {
            console.error('❌ Failed to search tickets:', error);
            return [];
        }
    }

    async deleteTicket(ticketId) {
        try {
            const ticketsData = await fs.readFile(this.ticketsFile, 'utf8');
            const tickets = JSON.parse(ticketsData);
            
            const filteredTickets = tickets.filter(ticket => ticket.id !== ticketId);
            
            await fs.writeFile(this.ticketsFile, JSON.stringify(filteredTickets, null, 2));
            
            console.log(`✅ Ticket deleted: ${ticketId}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to delete ticket:', error);
            return false;
        }
    }
}

module.exports = TicketingSystem; 