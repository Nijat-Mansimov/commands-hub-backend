const AttackTemplate = require('../models/AttackTemplate');
const { 
  replacePlaceholders, 
  validateRequiredFields,
  validateAllFields,
  extractPlaceholders
} = require('../utils/placeholder');

/**
 * Restructure template to have consistent ratings format
 * Ensures all responses have ratings in { averageRating, totalRatings } format
 */
const restructureTemplateRatings = (template) => {
  const data = template.toObject?.() || template;
  data.ratings = {
    averageRating: data.averageRating,
    totalRatings: data.totalRatings,
  };
  return data;
};

/**
 * Get filtered and sorted templates
 * Excludes private templates unless user is the owner
 */
exports.getFilteredTemplates = async (query = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1,
    category,
    subcategory,
    tool,
    targetSystem,
    attackProtocol,
    shellType,
    platform,
    payloadType,
    difficulty,
    search,
    minRating = 0,
    featured = false,
  } = query;

  const userId = options.userId;

  // Build the filter conditions
  const conditions = [{ published: true }];
  
  // Add privacy conditions
  if (userId) {
    conditions.push({
      $or: [
        { isPrivate: false },
        { isPrivate: true, createdBy: userId }
      ]
    });
  } else {
    conditions.push({ isPrivate: false }); // Only public if not logged in
  }

  // Handle multiple category selections (comma-separated)
  // Database stores category as "Module - Subcategory" format, so use regex matching
  if (category) {
    const categories = category.split(',').map(c => c.trim()).filter(c => c && c !== 'Other');
    if (categories.length === 1) {
      // Use regex to match category that starts with the module name
      // e.g., "Footprinting" matches "Footprinting - FTP", "Footprinting - SMB", etc.
      conditions.push({ category: { $regex: `^${categories[0]}(\\s*-|$)`, $options: 'i' } });
    } else if (categories.length > 1) {
      // For multiple categories, match any of them
      const categoryPatterns = categories.map(c => `^${c}(\\s*-|$)`).join('|');
      conditions.push({ category: { $regex: categoryPatterns, $options: 'i' } });
    }
  }
  
  // Handle multiple subcategory selections (comma-separated)
  if (subcategory) {
    const subcategories = subcategory.split(',').map(s => s.trim()).filter(s => s && s !== 'Other');
    if (subcategories.length === 1) {
      conditions.push({ subcategory: subcategories[0] });
    } else if (subcategories.length > 1) {
      conditions.push({ subcategory: { $in: subcategories } });
    }
  }
  
  // Handle difficulty multi-select (comma-separated)
  if (difficulty) {
    const difficulties = difficulty.split(',').map(d => d.trim()).filter(d => d);
    if (difficulties.length === 1) {
      conditions.push({ difficulty: difficulties[0] });
    } else if (difficulties.length > 1) {
      conditions.push({ difficulty: { $in: difficulties } });
    }
  }
  
  // Handle targetSystem multi-select (comma-separated)
  if (targetSystem) {
    const systems = targetSystem.split(',').map(s => s.trim()).filter(s => s);
    if (systems.length === 1) {
      conditions.push({ targetSystem: systems[0] });
    } else if (systems.length > 1) {
      conditions.push({ targetSystem: { $in: systems } });
    }
  }
  
  if (tool) conditions.push({ tool: { $regex: tool, $options: 'i' } });
  if (attackProtocol) conditions.push({ attackProtocol: { $regex: attackProtocol, $options: 'i' } });
  if (shellType) conditions.push({ shellType: shellType });
  if (platform) conditions.push({ platform: platform });
  if (payloadType) conditions.push({ payloadType: payloadType });
  if (featured) conditions.push({ isFeatured: true });
  if (minRating > 0) conditions.push({ averageRating: { $gte: minRating } });

  // Handle search - must match ANY of these fields
  if (search) {
    conditions.push({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { longDescription: { $regex: search, $options: 'i' } },
        { commandTemplate: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { category: { $regex: search, $options: 'i' } },
        { tool: { $regex: search, $options: 'i' } },
        { attackProtocol: { $regex: search, $options: 'i' } },
      ]
    });
  }

  // Combine all conditions with AND
  const filter = conditions.length === 1 ? conditions[0] : { $and: conditions };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortObject = { [sortBy]: parseInt(sortOrder) };

  const templates = await AttackTemplate.find(filter)
    .populate('createdBy', 'username')
    .populate('ratings.userId', 'username')
    .sort(sortObject)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await AttackTemplate.countDocuments(filter);

  // Restructure ratings for all templates to be consistent
  const restructuredTemplates = templates.map(restructureTemplateRatings);

  return {
    data: restructuredTemplates,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get user's filtered templates
 * Similar to getFilteredTemplates but only for the authenticated user's templates
 */
exports.getMyFilteredTemplates = async (userId, query = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = 'newest',
    category,
    subcategory,
    tool,
    targetSystem,
    difficulty,
    search,
    minRating = 0,
  } = query;

  // Build sort object from sort parameter
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    mostUsed: { usageCount: -1 },
    topRated: { averageRating: -1 },
    'a-z': { name: 1 },
    'z-a': { name: -1 },
  };

  const sortObj = sortMap[sort] || sortMap.newest;

  // Build the filter conditions
  const conditions = [{ createdBy: userId }];

  // Handle multiple category selections (comma-separated)
  // Database stores category as "Module - Subcategory" format, so use regex matching
  if (category) {
    const categories = category.split(',').map(c => c.trim()).filter(c => c && c !== 'Other');
    if (categories.length === 1) {
      // Use regex to match category that starts with the module name
      conditions.push({ category: { $regex: `^${categories[0]}(\\s*-|$)`, $options: 'i' } });
    } else if (categories.length > 1) {
      // For multiple categories, match any of them
      const categoryPatterns = categories.map(c => `^${c}(\\s*-|$)`).join('|');
      conditions.push({ category: { $regex: categoryPatterns, $options: 'i' } });
    }
  }
  
  // Handle multiple subcategory selections (comma-separated)
  if (subcategory) {
    const subcategories = subcategory.split(',').map(s => s.trim()).filter(s => s && s !== 'Other');
    if (subcategories.length === 1) {
      conditions.push({ subcategory: subcategories[0] });
    } else if (subcategories.length > 1) {
      conditions.push({ subcategory: { $in: subcategories } });
    }
  }
  
  // Handle difficulty multi-select (comma-separated)
  if (difficulty) {
    const difficulties = difficulty.split(',').map(d => d.trim()).filter(d => d);
    if (difficulties.length === 1) {
      conditions.push({ difficulty: difficulties[0] });
    } else if (difficulties.length > 1) {
      conditions.push({ difficulty: { $in: difficulties } });
    }
  }
  
  // Handle targetSystem multi-select (comma-separated)
  if (targetSystem) {
    const systems = targetSystem.split(',').map(s => s.trim()).filter(s => s);
    if (systems.length === 1) {
      conditions.push({ targetSystem: systems[0] });
    } else if (systems.length > 1) {
      conditions.push({ targetSystem: { $in: systems } });
    }
  }
  
  if (tool) conditions.push({ tool: { $regex: tool, $options: 'i' } });
  if (minRating > 0) conditions.push({ averageRating: { $gte: minRating } });

  // Handle search - must match ANY of these fields
  if (search) {
    conditions.push({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { longDescription: { $regex: search, $options: 'i' } },
        { commandTemplate: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { category: { $regex: search, $options: 'i' } },
        { tool: { $regex: search, $options: 'i' } },
      ]
    });
  }

  // Combine all conditions with AND
  const filter = conditions.length === 1 ? conditions[0] : { $and: conditions };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const templates = await AttackTemplate.find(filter)
    .populate('createdBy', 'username')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await AttackTemplate.countDocuments(filter);

  // Restructure ratings for all templates to be consistent
  const restructuredTemplates = templates.map(restructureTemplateRatings);

  return {
    data: restructuredTemplates,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get popular templates by ratings/usage
 */
exports.getPopularTemplates = async (limit = 10) => {
  const templates = await AttackTemplate.find({ published: true, isPrivate: false })
    .populate('createdBy', 'username')
    .sort({ averageRating: -1, totalRatings: -1, usageCount: -1 })
    .limit(parseInt(limit));

  // Restructure ratings for all templates to be consistent
  return templates.map(restructureTemplateRatings);
};

/**
 * Get featured templates
 */
exports.getFeaturedTemplates = async (limit = 10) => {
  const templates = await AttackTemplate.find({ published: true, isFeatured: true, isPrivate: false })
    .populate('createdBy', 'username')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  // Restructure ratings for all templates to be consistent
  return templates.map(restructureTemplateRatings);
};

/**
 * Generate command with validation
 */
exports.generateCommand = async (templateId, inputValues) => {
  const template = await AttackTemplate.findById(templateId);

  if (!template) {
    throw new Error('Template not found');
  }

  // Validate all fields including type validation
  const validation = validateAllFields(template.requiredFields, inputValues);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.missingFields = validation.missingFields;
    error.validationErrors = validation.errors;
    throw error;
  }

  // Replace placeholders
  const generatedCommand = replacePlaceholders(template.commandTemplate, inputValues);

  // Increment usage count
  template.usageCount += 1;
  template.lastUsedAt = new Date();
  await template.save();

  // Extract list of all placeholders that were used
  const usedPlaceholders = extractPlaceholders(template.commandTemplate);

  return {
    templateId: template._id,
    templateName: template.name,
    category: template.category,
    shellType: template.shellType,
    platform: template.platform,
    generatedCommand,
    inputValues,
    variants: template.variants || [],
    usedPlaceholders,
  };
};

/**
 * Get template with related information
 * Checks privacy and allows only public templates or templates owned by user
 * Also calculates user's rating for the current user
 */
exports.getTemplateDetails = async (templateId, userId = null) => {
  const template = await AttackTemplate.findById(templateId)
    .populate('createdBy', 'username email')
    .populate('ratings.userId', 'username');

  if (!template) {
    throw new Error('Template not found');
  }

  // Check privacy: if private, user must be owner
  if (template.isPrivate && (!userId || template.createdBy._id.toString() !== userId.toString())) {
    const error = new Error('Access denied: This template is private');
    error.statusCode = 403;
    throw error;
  }

  // Find user's rating if they're authenticated
  const userRating = userId 
    ? template.ratings.find(r => r.userId._id.toString() === userId.toString())?.score
    : undefined;

  // Transform ratings to include userId info
  const recentRatings = template.ratings
    .map(r => ({
      _id: r._id,
      userId: r.userId?._id,
      username: r.userId?.username,
      score: r.score,
      comment: r.comment,
      createdAt: r.createdAt,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10); // Get last 10 ratings

  // Restructure response to match frontend expectations
  const templateData = template.toObject();
  templateData.ratings = {
    averageRating: template.averageRating,
    totalRatings: template.totalRatings,
    userRating: userRating,
  };
  templateData.recentRatings = recentRatings;

  return templateData;
};

/**
 * Add rating to template
 */
exports.rateTemplate = async (templateId, userId, score, comment = '') => {
  const template = await AttackTemplate.findById(templateId);

  if (!template) {
    throw new Error('Template not found');
  }

  // Check if user already rated
  const existingRating = template.ratings.find(r => r.userId.toString() === userId.toString());

  if (existingRating) {
    // Update existing rating
    existingRating.score = score;
    existingRating.comment = comment;
    existingRating.createdAt = new Date();
  } else {
    // Add new rating
    template.ratings.push({
      userId,
      score,
      comment,
    });
  }

  // Recalculate average rating
  const totalScore = template.ratings.reduce((sum, r) => sum + r.score, 0);
  template.averageRating = (totalScore / template.ratings.length).toFixed(1);
  template.totalRatings = template.ratings.length;

  await template.save();

  return template;
};

/**
 * Get templates by shell type
 */
exports.getTemplatesByShellType = async (shellType, limit = 20) => {
  const templates = await AttackTemplate.find({
    shellType: { $regex: shellType, $options: 'i' },
    published: true,
  })
    .populate('createdBy', 'username')
    .sort({ averageRating: -1, usageCount: -1 })
    .limit(parseInt(limit));

  // Restructure ratings for all templates to be consistent
  return templates.map(restructureTemplateRatings);
};

/**
 * Get shell types available
 */
exports.getAvailableShellTypes = async () => {
  const shellTypes = await AttackTemplate.distinct('shellType', { published: true });
  return shellTypes.filter(st => st); // Remove null values
};

/**
 * Get platforms available
 */
exports.getAvailablePlatforms = async () => {
  const platforms = await AttackTemplate.distinct('platform', { published: true });
  return platforms.filter(p => p);
};

/**
 * Search templates with advanced options
 */
exports.advancedSearch = async (searchOptions = {}) => {
  const {
    keyword,
    category,
    subcategory,
    tool,
    targetSystem,
    attackProtocol,
    shellType,
    platform,
    payloadType,
    minRating,
    sort = 'relevance',
    limit = 20,
  } = searchOptions;

  const filter = { published: true };

  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { longDescription: { $regex: keyword, $options: 'i' } },
      { tags: { $in: [new RegExp(keyword, 'i')] } },
      { category: { $regex: keyword, $options: 'i' } },
      { tool: { $regex: keyword, $options: 'i' } },
      { attackProtocol: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (category) filter.category = category;
  if (subcategory) filter.subcategory = subcategory;
  if (tool) filter.tool = { $regex: tool, $options: 'i' };
  if (targetSystem) filter.targetSystem = targetSystem;
  if (attackProtocol) filter.attackProtocol = { $regex: attackProtocol, $options: 'i' };
  if (shellType) filter.shellType = { $regex: shellType, $options: 'i' };
  if (platform) filter.platform = platform;
  if (payloadType) filter.payloadType = payloadType;
  if (minRating) filter.averageRating = { $gte: minRating };

  let sortObject = { createdAt: -1 };
  if (sort === 'rating') {
    sortObject = { averageRating: -1, totalRatings: -1 };
  } else if (sort === 'popular') {
    sortObject = { usageCount: -1 };
  } else if (sort === 'newest') {
    sortObject = { createdAt: -1 };
  }

  const templates = await AttackTemplate.find(filter)
    .populate('createdBy', 'username')
    .sort(sortObject)
    .limit(parseInt(limit));

  // Restructure ratings for all templates to be consistent
  return templates.map(restructureTemplateRatings);
};

/**
 * Get template suggestions based on similarity
 */
exports.getSimilarTemplates = async (templateId, limit = 5, userId = null) => {
  const template = await AttackTemplate.findById(templateId);

  if (!template) {
    throw new Error('Template not found');
  }

  // Build privacy filter
  let privacyCondition;
  if (userId) {
    privacyCondition = {
      $or: [
        { isPrivate: false },
        { isPrivate: true, createdBy: userId }
      ]
    };
  } else {
    privacyCondition = { isPrivate: false };
  }

  const similar = await AttackTemplate.find({
    _id: { $ne: templateId },
    published: true,
    ...privacyCondition,
    $or: [
      { category: template.category },
      { subcategory: template.subcategory },
      { tool: template.tool },
      { targetSystem: template.targetSystem },
      { attackProtocol: template.attackProtocol },
      { shellType: template.shellType },
      { platform: template.platform },
      { tags: { $in: template.tags } },
    ],
  })
    .populate('createdBy', 'username')
    .limit(parseInt(limit));

  // Restructure ratings for all templates to be consistent
  return similar.map(restructureTemplateRatings);
};

/**
 * Generate batch commands
 */
exports.generateBatchCommands = async (templateId, inputsList) => {
  const template = await AttackTemplate.findById(templateId);

  if (!template) {
    throw new Error('Template not found');
  }

  const results = inputsList.map(inputs => {
    const validation = validateRequiredFields(template.requiredFields, inputs);
    if (!validation.isValid) {
      return {
        error: true,
        message: 'Missing required fields',
        missingFields: validation.missingFields,
      };
    }

    const generatedCommand = replacePlaceholders(template.commandTemplate, inputs);
    return {
      error: false,
      command: generatedCommand,
      values: inputs,
    };
  });

  // Increment usage
  template.usageCount += inputsList.length;
  template.lastUsedAt = new Date();
  await template.save();

  return {
    templateId: template._id,
    templateName: template.name,
    results,
    totalGenerated: results.filter(r => !r.error).length,
    totalErrors: results.filter(r => r.error).length,
  };
};

/**
 * Get user's contribution stats
 */
exports.getUserStats = async (userId) => {
  const totalTemplates = await AttackTemplate.countDocuments({ createdBy: userId });
  const publishedTemplates = await AttackTemplate.countDocuments({
    createdBy: userId,
    published: true,
  });

  const templates = await AttackTemplate.find({ createdBy: userId });
  const avgRating = templates.length > 0
    ? (templates.reduce((sum, t) => sum + (t.averageRating || 0), 0) / templates.length).toFixed(2)
    : 0;

  const totalUsage = templates.reduce((sum, t) => sum + (t.usageCount || 0), 0);

  return {
    totalTemplates,
    publishedTemplates,
    pendingApproval: totalTemplates - approvedTemplates,
    averageRating: parseFloat(avgRating),
    totalCommandsGenerated: totalUsage,
  };
};
