const express = require('express');
const router = express.Router();
const TicketingSystem = require('../services/ticketingSystem');

const ticketingSystem = new TicketingSystem();

// Create a new support ticket
router.post('/create', async (req, res) => {
    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            customerCompany,
            subject,
            description,
            priority,
            category,
            tags
        } = req.body;

        // Validate required fields
        if (!customerName || !customerEmail || !subject || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: customerName, customerEmail, subject, description',
                poweredBy: 'Fakelit.com'
            });
        }

        const ticket = await ticketingSystem.createTicket({
            customerName,
            customerEmail,
            customerPhone,
            customerCompany,
            subject,
            description,
            priority: priority || 'normal',
            category: category || 'general',
            tags: tags || []
        });

        res.json({
            success: true,
            message: 'Support ticket created successfully',
            ticket: ticket,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Ticket creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create support ticket. Please try again.',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get all tickets with optional filters
router.get('/tickets', async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            priority: req.query.priority,
            category: req.query.category,
            customerEmail: req.query.customerEmail
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined) {
                delete filters[key];
            }
        });

        const tickets = await ticketingSystem.getAllTickets(filters);

        res.json({
            success: true,
            tickets: tickets,
            count: tickets.length,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve tickets',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get a specific ticket by ID
router.get('/ticket/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await ticketingSystem.getTicket(ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
                poweredBy: 'Fakelit.com'
            });
        }

        res.json({
            success: true,
            ticket: ticket,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve ticket',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Update ticket status
router.put('/ticket/:ticketId/status', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status, agentName } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required',
                poweredBy: 'Fakelit.com'
            });
        }

        const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: open, in-progress, resolved, closed',
                poweredBy: 'Fakelit.com'
            });
        }

        const updatedTicket = await ticketingSystem.changeStatus(ticketId, status, agentName);

        res.json({
            success: true,
            message: 'Ticket status updated successfully',
            ticket: updatedTicket,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Update ticket status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update ticket status',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Assign ticket to agent
router.put('/ticket/:ticketId/assign', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { agentName } = req.body;

        if (!agentName) {
            return res.status(400).json({
                success: false,
                message: 'Agent name is required',
                poweredBy: 'Fakelit.com'
            });
        }

        const updatedTicket = await ticketingSystem.assignTicket(ticketId, agentName);

        res.json({
            success: true,
            message: 'Ticket assigned successfully',
            ticket: updatedTicket,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Assign ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign ticket',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Add response to ticket
router.post('/ticket/:ticketId/response', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { author, content, authorType, internal } = req.body;

        if (!author || !content) {
            return res.status(400).json({
                success: false,
                message: 'Author and content are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const response = await ticketingSystem.addResponse(ticketId, {
            author,
            content,
            authorType: authorType || 'customer',
            internal: internal || false
        });

        res.json({
            success: true,
            message: 'Response added successfully',
            response: response,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Add response error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add response',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Search tickets
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required',
                poweredBy: 'Fakelit.com'
            });
        }

        const tickets = await ticketingSystem.searchTickets(query);

        res.json({
            success: true,
            tickets: tickets,
            count: tickets.length,
            query: query,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Search tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search tickets',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get ticket statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await ticketingSystem.getTicketStats();

        res.json({
            success: true,
            stats: stats,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get ticket statistics',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Update ticket details
router.put('/ticket/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates.id;
        delete updates.createdAt;
        delete updates.responses;

        const updatedTicket = await ticketingSystem.updateTicket(ticketId, updates);

        res.json({
            success: true,
            message: 'Ticket updated successfully',
            ticket: updatedTicket,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update ticket',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Delete ticket (admin only)
router.delete('/ticket/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const success = await ticketingSystem.deleteTicket(ticketId);

        if (success) {
            res.json({
                success: true,
                message: 'Ticket deleted successfully',
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Ticket not found',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Delete ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete ticket',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get tickets by customer email
router.get('/customer/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const tickets = await ticketingSystem.getAllTickets({ customerEmail: email });

        res.json({
            success: true,
            tickets: tickets,
            count: tickets.length,
            customerEmail: email,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get customer tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get customer tickets',
            poweredBy: 'Fakelit.com'
        });
    }
});

module.exports = router; 