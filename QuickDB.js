const mongoose = require('mongoose');
const { EventEmitter } = require('events');

class QuickDB extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.isConnected = false;
    this.connection = null;
    this.models = {};
    this.initializeModels();
  }

  // Initialize all database models
  initializeModels() {
    // Conversation Model
    const conversationSchema = new mongoose.Schema({
      user: { type: String, required: true },
      query: { type: String, required: true },
      response: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      source: { type: String, enum: ['api', 'upload', 'direct'], default: 'direct' },
      metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
    });

    // Add indexes for better query performance
    conversationSchema.index({ user: 1 });
    conversationSchema.index({ timestamp: -1 });
    conversationSchema.index({ source: 1 });

    this.models.Conversation = mongoose.model('Conversation', conversationSchema);

    // User Model (example of additional model)
    const userSchema = new mongoose.Schema({
      userId: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      preferences: {
        language: { type: String, default: 'en' },
        notificationEnabled: { type: Boolean, default: true }
      },
      createdAt: { type: Date, default: Date.now },
      lastActive: { type: Date, default: Date.now }
    });

    this.models.User = mongoose.model('User', userSchema);
  }

  // Connect to MongoDB with retry logic
  async connect() {
    if (this.isConnected) {
      return this.connection;
    }

    try {
      mongoose.set('strictQuery', true);

      this.connection = await mongoose.connect(this.config.dbUrl, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority'
      });

      this.isConnected = true;
      this.emit('connected');
      console.log('Database connected successfully');

      // Set up event listeners
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        this.isConnected = false;
        this.emit('error', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.isConnected = false;
        this.emit('disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        this.isConnected = true;
        this.emit('reconnected');
      });

      return this.connection;
    } catch (err) {
      console.error('Initial MongoDB connection failed:', err.message);
      this.emit('connectionFailed', err);
      throw err;
    }
  }

  // Gracefully disconnect from MongoDB
  async disconnect() {
    if (!this.isConnected) return;
    
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      this.emit('disconnected');
      console.log('Database disconnected successfully');
    } catch (err) {
      console.error('Error disconnecting from MongoDB:', err);
      throw err;
    }
  }

  // Health check for database
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { healthy: false, status: 'disconnected' };
      }

      // Run a simple query to verify connection
      await this.models.Conversation.findOne().limit(1).exec();
      return { 
        healthy: true, 
        status: 'connected',
        stats: await this.getDatabaseStats() 
      };
    } catch (err) {
      return { healthy: false, status: 'error', error: err.message };
    }
  }

  // Get database statistics
  async getDatabaseStats() {
    try {
      const stats = await mongoose.connection.db.stats();
      return {
        collections: stats.collections,
        documents: stats.objects,
        storageSize: stats.storageSize,
        indexSize: stats.indexSize,
        ok: stats.ok
      };
    } catch (err) {
      console.error('Error getting database stats:', err);
      return null;
    }
  }

  // CRUD Operations for Conversation Model
  async createConversation(data) {
    try {
      const conversation = new this.models.Conversation(data);
      await conversation.save();
      return conversation;
    } catch (err) {
      console.error('Error creating conversation:', err);
      throw this.handleDatabaseError(err);
    }
  }

  async getConversationsByUser(userId, limit = 10, page = 1) {
    try {
      const skip = (page - 1) * limit;
      return await this.models.Conversation.find({ user: userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
    } catch (err) {
      console.error('Error getting conversations:', err);
      throw this.handleDatabaseError(err);
    }
  }

  async searchConversations(query, userId, limit = 5) {
    try {
      return await this.models.Conversation.find({
        user: userId,
        $text: { $search: query }
      }, {
        score: { $meta: "textScore" }
      })
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean()
      .exec();
    } catch (err) {
      console.error('Error searching conversations:', err);
      throw this.handleDatabaseError(err);
    }
  }

  // Error handling helper
  handleDatabaseError(err) {
    if (err.name === 'ValidationError') {
      // Handle Mongoose validation errors
      const errors = {};
      for (const field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return { 
        name: 'ValidationError',
        message: 'Document validation failed',
        errors 
      };
    } else if (err.code === 11000) {
      // Handle duplicate key errors
      return {
        name: 'DuplicateKeyError',
        message: 'Duplicate key error',
        key: err.keyValue
      };
    } else {
      // Generic database error
      return {
        name: 'DatabaseError',
        message: 'Database operation failed',
        details: err.message
      };
    }
  }

  // Transaction support
  async withTransaction(fn) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const result = await fn(session);
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}

// Singleton pattern to ensure single DB instance
let instance = null;

module.exports = (config) => {
  if (!instance) {
    instance = new QuickDB(config);
  }
  return instance;
};