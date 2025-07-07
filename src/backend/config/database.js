const mongoose = require('mongoose');
const { COUNSELORS } = require('../../shared/constants/counselors');

class Database {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careconnect';
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false
      };

      this.connection = await mongoose.connect(mongoUri, options);
      this.isConnected = true;

      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🔗 URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);

      // Set up connection event handlers
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
        this.isConnected = true;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log('🔌 MongoDB disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', message: 'Database not connected' };
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();
      
      // Check connection state
      const readyState = mongoose.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };

      return {
        status: 'healthy',
        state: states[readyState],
        database: mongoose.connection.name,
        collections: await this.getCollectionStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async getCollectionStats() {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const stats = {};

      for (const collection of collections) {
        const collectionStats = await mongoose.connection.db
          .collection(collection.name)
          .stats();
        
        stats[collection.name] = {
          count: collectionStats.count,
          size: collectionStats.size,
          avgObjSize: collectionStats.avgObjSize
        };
      }

      return stats;
    } catch (error) {
      console.error('Error getting collection stats:', error);
      return {};
    }
  }

  async initializeCollections() {
    try {
      console.log('🔄 Initializing database collections...');

      // Import models
      const User = require('../models/User');
      const Counselor = require('../models/Counselor');
      const Session = require('../models/Session');

      // Create indexes
      await User.createIndexes();
      await Counselor.createIndexes();
      await Session.createIndexes();

      console.log('✅ Database collections initialized');
    } catch (error) {
      console.error('❌ Error initializing collections:', error);
      throw error;
    }
  }

  async seedCounselors() {
    try {
      const Counselor = require('../models/Counselor');
      
      console.log('🌱 Seeding counselor data...');

      for (const [counselorId, counselorData] of Object.entries(COUNSELORS)) {
        const existingCounselor = await Counselor.findOne({ counselorId });
        
        if (!existingCounselor) {
          // Generate system prompt for the counselor
          const systemPrompt = this.generateSystemPrompt(counselorData);
          
          const counselor = new Counselor({
            ...counselorData,
            aiConfig: {
              ...counselorData.aiConfig,
              systemPrompt
            }
          });

          await counselor.save();
          console.log(`✅ Created counselor: ${counselorData.name}`);
        } else {
          console.log(`⏭️ Counselor already exists: ${counselorData.name}`);
        }
      }

      console.log('✅ Counselor seeding completed');
    } catch (error) {
      console.error('❌ Error seeding counselors:', error);
      throw error;
    }
  }

  generateSystemPrompt(counselorData) {
    return `You are ${counselorData.name}, a ${counselorData.title} specializing in ${counselorData.specialization}. 

Your expertise includes: ${counselorData.expertise.join(', ')}.

Your communication style is ${counselorData.personality.communicationStyle} and your approach is ${counselorData.personality.approach}.

Your key strengths are: ${counselorData.personality.strengths.join(', ')}.

IMPORTANT SAFETY GUIDELINES:
- Never provide advice that could harm the client or others
- If client mentions self-harm, suicide, or harm to others, immediately provide crisis resources
- Maintain professional boundaries at all times
- Refer to appropriate professionals when needed
- Focus on supportive, therapeutic responses

Crisis Response: ${counselorData.safety_guidelines.crisis_response}

Professional Boundaries: ${counselorData.safety_guidelines.professional_boundaries}

Referral Protocol: ${counselorData.safety_guidelines.referral_protocol}

Always respond as ${counselorData.name} with your specialized expertise in ${counselorData.specialization}.`;
  }

  async createTestUser() {
    try {
      const User = require('../models/User');
      
      const testUser = await User.findOne({ email: 'test@careconnect.com' });
      
      if (!testUser) {
        const user = new User({
          email: 'test@careconnect.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
          role: 'client',
          status: 'active',
          emailVerified: true,
          mentalHealthProfile: {
            primaryConcerns: ['anxiety', 'stress'],
            previousTherapy: {
              hasReceived: false
            }
          }
        });

        await user.save();
        console.log('✅ Created test user: test@careconnect.com');
      } else {
        console.log('⏭️ Test user already exists');
      }
    } catch (error) {
      console.error('❌ Error creating test user:', error);
    }
  }

  async getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port
    };
  }
}

// Create singleton instance
const database = new Database();

module.exports = database; 