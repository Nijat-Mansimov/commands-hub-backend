const AttackTemplate = require('../models/AttackTemplate');
const { validationResult } = require('express-validator');
const { 
  replacePlaceholders, 
  validateRequiredFields, 
  validateAllFields,
  extractPlaceholders,
  validateTemplatePlaceholders
} = require('../utils/placeholder');
const templateService = require('../services/templateService');
const {
  CATEGORIES_HIERARCHY,
  CATEGORIES_ENUM,
  TARGET_SYSTEMS,
  DIFFICULTIES,
  COMMON_TOOLS,
  COMMON_PROTOCOLS
} = require('../constants/categories');

/**
 * @route   GET /api/templates
 * @desc    Get all approved templates with advanced filtering (excludes private unless owner)
 * @access  Public
 */
exports.getTemplates = async (req, res) => {
  try {
    const userId = req.user?._id; // Get userId if authenticated
    const result = await templateService.getFilteredTemplates(req.query, { userId });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: err.message,
    });
  }
};

/**
 * @route   GET /api/templates/featured
 * @desc    Get featured templates
 * @access  Private
 */
exports.getFeaturedTemplates = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const templates = await templateService.getFeaturedTemplates(limit);

    res.json({
      success: true,
      message: 'Featured templates',
      data: templates,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured templates',
      error: err.message,
    });
  }
};

/**
 * @route   GET /api/templates/popular
 * @desc    Get popular templates by rating and usage
 * @access  Private
 */
exports.getPopularTemplates = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const templates = await templateService.getPopularTemplates(limit);

    res.json({
      success: true,
      message: 'Popular templates',
      data: templates,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular templates',
      error: err.message,
    });
  }
};

/**
 * @route   GET /api/templates/shell-types/:shellType
 * @desc    Get templates by shell type
 * @access  Private
 */
exports.getTemplatesByShellType = async (req, res) => {
  try {
    const { shellType } = req.params;
    const limit = req.query.limit || 20;
    const templates = await templateService.getTemplatesByShellType(shellType, limit);

    res.json({
      success: true,
      data: templates,
      shellType,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates by shell type',
      error: err.message,
    });
  }
};

/**
 * @route   GET /api/templates/filters/options
 * @desc    Get available filter options
 * @access  Private
 */
exports.getFilterOptions = async (req, res) => {
  try {
    console.log('[FILTER OPTIONS] Request received');
    // Get all metadata from centralized constants and database
    const platforms = await templateService.getAvailablePlatforms();
    const tools = await AttackTemplate.distinct('tool', { published: true });
    const protocols = await AttackTemplate.distinct('attackProtocol', { published: true });

    console.log('[FILTER OPTIONS] Platforms:', platforms.length, 'Tools:', tools.length, 'Protocols:', protocols.length);

    // Combine database tools with common tools from constants
    const allTools = Array.from(
      new Set([...COMMON_TOOLS, ...tools.filter(t => t)])
    ).sort();

    // Combine database protocols with common protocols from constants
    const allProtocols = Array.from(
      new Set([...COMMON_PROTOCOLS, ...protocols.filter(p => p)])
    ).sort();

    console.log('[FILTER OPTIONS] Sending response with', CATEGORIES_ENUM.length, 'categories');
    res.json({
      success: true,
      data: {
        categoriesHierarchy: CATEGORIES_HIERARCHY,  // Organized by major module and subcategory
        categories: CATEGORIES_ENUM,  // Flattened list for enum validation
        targetSystems: TARGET_SYSTEMS,
        difficulties: DIFFICULTIES,
        platforms: platforms.filter(p => p), // Remove null values
        tools: allTools,
        protocols: allProtocols,
      },
    });
  } catch (err) {
    console.error('[FILTER OPTIONS] Error:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching filter options',
      error: err.message,
    });
  }
};

/**
 * @route   GET /api/templates/my-templates
 * @desc    Get authenticated user's templates
 * @access  Private
 */
exports.getMyTemplates = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await templateService.getMyFilteredTemplates(userId, req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error fetching user templates',
      error: err.message,
    });
  }
};

/**
 * @route   POST /api/templates
 * @desc    Create a new attack template
 * @access  Private
 */
exports.createTemplate = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const {
      name,
      description,
      longDescription,
      category,
      subcategory,
      tool,
      targetSystem,
      attackProtocol,
      shellType,
      platform,
      payloadType,
      commandTemplate,
      tags,
      requiredFields,
      difficulty,
      variants,
      relatedTemplates,
      isPrivate = false,
    } = req.body;

    // Validate that required fields array structure is correct
    if (requiredFields && Array.isArray(requiredFields)) {
      for (const field of requiredFields) {
        if (!field.fieldName || !field.fieldType) {
          return res.status(400).json({
            success: false,
            message: 'Each required field must have fieldName and fieldType',
          });
        }
        
        if (!['text', 'password', 'number', 'email', 'url', 'ip', 'port', 'domain', 'select', 'textarea'].includes(field.fieldType)) {
          return res.status(400).json({
            success: false,
            message: `Invalid fieldType: ${field.fieldType}. Allowed: text, password, number, email, url, ip, port, domain, select, textarea`,
          });
        }
      }
    }

    // Validate that placeholders in template match required fields
    if (commandTemplate && requiredFields && Array.isArray(requiredFields) && requiredFields.length > 0) {
      const validation = validateTemplatePlaceholders(commandTemplate, requiredFields);
      if (!validation.valid) {
        const errors = [];
        if (validation.missingInTemplate.length > 0) {
          errors.push(`Required fields not found in template: ${validation.missingInTemplate.join(', ')}`);
        }
        if (validation.unusedPlaceholders.length > 0) {
          errors.push(`Template has placeholders not in required fields: ${validation.unusedPlaceholders.join(', ')}`);
        }
        
        return res.status(400).json({
          success: false,
          message: 'Template placeholders do not match required fields',
          details: errors,
        });
      }
    }

    const newTemplate = await AttackTemplate.create({
      name,
      description: description || '',
      longDescription: longDescription || '',
      category,
      subcategory: subcategory || '',
      tool: tool || '',
      targetSystem: targetSystem || '',
      attackProtocol: attackProtocol || '',
      shellType: shellType || '',
      platform: platform || '',
      payloadType: payloadType || 'Reverse Shell',
      commandTemplate,
      requiredFields: requiredFields || [],
      createdBy: req.user._id,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
      difficulty: difficulty || 'Intermediate',
      variants: variants || [],
      relatedTemplates: relatedTemplates || [],
      isPrivate: Boolean(isPrivate),
      // Auto-published for all users
    });

    const populatedTemplate = await AttackTemplate.findById(newTemplate._id).populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: populatedTemplate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error creating template',
      error: err.message,
    });
  }
};

/**
 * @route   GET /api/templates/:id
 * @desc    Get single template with details
 * @access  Public (but private templates only visible to owner)
 */
exports.getTemplate = async (req, res) => {
  try {
    const userId = req.user?._id; // Get userId if authenticated
    
    // Increment view count FIRST
    try {
      const updated = await AttackTemplate.findByIdAndUpdate(
        req.params.id,
        {
          $inc: { viewCount: 1 },
          lastViewedAt: new Date(),
        },
        { new: false } // We'll fetch the updated version separately
      );
      console.log('[VIEWCOUNT] View count incremented:', { templateId: req.params.id, oldViewCount: updated?.viewCount });
    } catch (err) {
      console.warn('[VIEWCOUNT] Warning: Could not increment view count:', err.message);
      // Don't fail the entire request if view count fails
    }
    
    // NOW fetch the template AFTER incrementing view count
    const template = await templateService.getTemplateDetails(req.params.id, userId);
    console.log('[TEMPLATE] Returning template with viewCount:', { templateId: template._id, viewCount: template.viewCount });
    
    // Get similar templates, but don't fail if there's an error
    let similar = [];
    try {
      similar = await templateService.getSimilarTemplates(req.params.id, 3, userId);
    } catch (err) {
      console.warn('Warning: Could not fetch similar templates:', err.message);
      // Don't fail the entire request, just skip similar templates
    }

    res.json({
      success: true,
      data: template,
      similar,
    });
  } catch (err) {
    console.error(err);
    // Determine appropriate status code
    let statusCode = 500;
    if (err.message === 'Template not found') statusCode = 404;
    if (err.statusCode === 403) statusCode = 403;
    
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Error fetching template',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

/**
 * @route   POST /api/templates/:id/generate
 * @desc    Generate commands from template
 * @access  Private
 */
exports.generateCommands = async (req, res) => {
  try {
    const result = await templateService.generateCommand(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Commands generated successfully',
      data: result,
    });
  } catch (err) {
    console.error(err);
    const statusCode = (err.missingFields || err.validationErrors) ? 400 : (err.message === 'Template not found' ? 404 : 500);
    res.status(statusCode).json({
      success: false,
      message: err.message,
      ...(err.missingFields && { missingFields: err.missingFields }),
      ...(err.validationErrors && err.validationErrors.length > 0 && { validationErrors: err.validationErrors }),
      error: err.message,
    });
  }
};

/**
 * @route   POST /api/templates/:id/generate/batch
 * @desc    Generate multiple commands from template
 * @access  Private
 */
exports.generateBatchCommands = async (req, res) => {
  try {
    const { inputs } = req.body;

    if (!Array.isArray(inputs) || inputs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'inputs must be a non-empty array',
      });
    }

    const result = await templateService.generateBatchCommands(req.params.id, inputs);

    res.json({
      success: true,
      message: 'Batch commands generated successfully',
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error generating batch commands',
      error: err.message,
    });
  }
};

/**
 * @route   PUT /api/templates/:id
 * @desc    Update a template
 * @access  Private (creator or admin)
 */
exports.updateTemplate = async (req, res) => {
  try {
    const template = await AttackTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Check authorization
    if (template.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this template',
      });
    }

    const {
      name,
      description,
      longDescription,
      category,
      subcategory,
      tool,
      targetSystem,
      attackProtocol,
      shellType,
      platform,
      payloadType,
      commandTemplate,
      tags,
      requiredFields,
      difficulty,
      variants,
      changelog,
      isPrivate,
    } = req.body;

    // Update fields
    if (name) template.name = name;
    if (description !== undefined) template.description = description;
    if (longDescription !== undefined) template.longDescription = longDescription;
    if (category) template.category = category;
    if (subcategory !== undefined) template.subcategory = subcategory;
    if (tool !== undefined) template.tool = tool;
    if (targetSystem !== undefined) template.targetSystem = targetSystem;
    if (attackProtocol !== undefined) template.attackProtocol = attackProtocol;
    if (shellType !== undefined) template.shellType = shellType;
    if (platform !== undefined) template.platform = platform;
    if (payloadType) template.payloadType = payloadType;
    if (commandTemplate) template.commandTemplate = commandTemplate;
    if (difficulty) template.difficulty = difficulty;
    if (isPrivate !== undefined) template.isPrivate = Boolean(isPrivate);

    if (tags) {
      template.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    }

    if (requiredFields && Array.isArray(requiredFields)) {
      template.requiredFields = requiredFields;
    }

    if (variants && Array.isArray(variants)) {
      template.variants = variants;
    }

    template.updatedBy = req.user._id;

    // Add to changelog
    if (changelog) {
      template.version += 1;
      template.changelog.push({
        version: template.version,
        changes: changelog,
        changedBy: req.user._id,
      });
    }

    await template.save();

    const updatedTemplate = await AttackTemplate.findById(template._id).populate('createdBy', 'username');

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: updatedTemplate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: err.message,
    });
  }
};

/**
 * @route   DELETE /api/templates/:id
 * @desc    Delete a template
 * @access  Private (creator or admin)
 */
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await AttackTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Check authorization
    if (template.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this template',
      });
    }

    await AttackTemplate.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: err.message,
    });
  }
};

/**
 * @route   POST /api/templates/:id/rate
 * @desc    Rate and comment on a template
 * @access  Private
 */
exports.rateTemplate = async (req, res) => {
  try {
    const { score, comment } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 1 and 5',
      });
    }

    const template = await templateService.rateTemplate(
      req.params.id,
      req.user._id,
      score,
      comment || ''
    );

    // Return the updated template with proper structure for ratings
    const updatedTemplate = await templateService.getTemplateDetails(req.params.id, req.user._id);

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: updatedTemplate,
    });
  } catch (err) {
    console.error(err);
    res.status(err.message === 'Template not found' ? 404 : 500).json({
      success: false,
      message: err.message,
      error: err.message,
    });
  }
};

/**
 * @route   GET /api/templates/:id/ratings
 * @desc    Get all ratings for a template
 * @access  Private
 */
exports.getTemplateRatings = async (req, res) => {
  try {
    const template = await AttackTemplate.findById(req.params.id)
      .populate('ratings.userId', 'username');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    res.json({
      success: true,
      data: {
        templateId: template._id,
        templateName: template.name,
        averageRating: template.averageRating,
        totalRatings: template.totalRatings,
        ratings: template.ratings,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error fetching ratings',
      error: err.message,
    });
  }
};

/**
 * @route   GET /api/templates/search/advanced
 * @desc    Advanced search with multiple filters
 * @access  Private
 */
exports.advancedSearch = async (req, res) => {
  try {
    const templates = await templateService.advancedSearch(req.query);

    res.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: err.message,
    });
  }
};

/**
 * ADMIN ENDPOINTS
 */

/**
 * @route   POST /api/templates/:id/feature
 * @desc    Feature a template (admin only)
 * @access  Admin only
 */
exports.featureTemplate = async (req, res) => {
  try {
    const template = await AttackTemplate.findByIdAndUpdate(
      req.params.id,
      { isFeatured: true },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Template featured successfully',
      data: template,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error featuring template',
      error: err.message,
    });
  }
};

/**
 * @route   POST /api/admin/templates/:id/unfeature
 * @desc    Unfeature a template
 * @access  Admin only
 */
exports.unfeatureTemplate = async (req, res) => {
  try {
    const template = await AttackTemplate.findByIdAndUpdate(
      req.params.id,
      { isFeatured: false },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Template unfeatured successfully',
      data: template,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error unfeaturing template',
      error: err.message,
    });
  }
};

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin statistics
 * @access  Admin only
 */
exports.getAdminStats = async (req, res) => {
  try {
    const totalTemplates = await AttackTemplate.countDocuments();
    const publishedTemplates = await AttackTemplate.countDocuments({ published: true });
    
    const totalUsage = await AttackTemplate.aggregate([
      { $group: { _id: null, total: { $sum: '$usageCount' } } },
    ]);

    const avgRating = await AttackTemplate.aggregate([
      { $match: { published: true } },
      { $group: { _id: null, avg: { $avg: '$averageRating' } } },
    ]);

    // Get categories and subcategories count from hierarchy
    const mainCategoriesCount = Object.keys(CATEGORIES_HIERARCHY).length;
    const subcategoriesCount = Object.values(CATEGORIES_HIERARCHY).flat().length;

    // Get unique tools count
    const uniqueTools = await AttackTemplate.distinct('tool', { published: true, tool: { $ne: '', $ne: null } });
    const toolsCount = uniqueTools.length;

    // Get total users count
    const User = require('../models/User');
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      data: {
        totalTemplates,
        publishedTemplates,
        totalCommandsGenerated: totalUsage[0]?.total || 0,
        averageRating: parseFloat((avgRating[0]?.avg || 0).toFixed(2)),
        mainCategoriesCount,
        subcategoriesCount,
        toolsCount,
        totalUsers,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: err.message,
    });
  }
};

/**
 * @route   GET /api/stats/public
 * @desc    Get public statistics (no auth required)
 * @access  Public
 */
exports.getPublicStats = async (req, res) => {
  try {
    const totalTemplates = await AttackTemplate.countDocuments({ published: true });
    
    // Get categories and subcategories count from hierarchy
    const mainCategories = Object.keys(CATEGORIES_HIERARCHY).length;
    const subcategories = Object.values(CATEGORIES_HIERARCHY).flat().length;

    // Get unique tools count
    const uniqueTools = await AttackTemplate.distinct('tool', { published: true, tool: { $ne: '', $ne: null } });
    const toolsCount = uniqueTools.length;

    // Get total users count
    const User = require('../models/User');
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      data: {
        templates: totalTemplates,
        mainCategories,
        subcategories,
        tools: toolsCount,
        users: totalUsers,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: err.message,
    });
  }
};
