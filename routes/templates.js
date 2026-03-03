const express = require('express');
const { body } = require('express-validator');
const templateController = require('../controllers/templateController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation middleware for templates
const validateTemplate = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('category')
    .notEmpty()
    .withMessage('Please select a category'),
  body('commandTemplate')
    .notEmpty()
    .withMessage('Command template cannot be empty'),
];

/**
 * PUBLIC/SHARED ROUTES
 */

/**
 * @route   GET /api/templates
 * @desc    Get all approved templates with filtering
 * @query   page, limit, category, shellType, platform, difficulty, search, minRating
 * @access  Public
 */
router.get('/', templateController.getTemplates);

/**
 * @route   GET /api/templates/featured
 * @desc    Get featured templates
 * @access  Public
 */
router.get('/featured', templateController.getFeaturedTemplates);

/**
 * @route   GET /api/stats/public
 * @desc    Get public statistics (no auth required)
 * @access  Public
 */
router.get('/stats/public', templateController.getPublicStats);

/**
 * @route   GET /api/templates/popular
 * @desc    Get popular templates by rating and usage
 * @access  Public
 */
router.get('/popular', templateController.getPopularTemplates);

/**
 * @route   GET /api/templates/filters/options
 * @desc    Get available filter options for UI
 * @access  Public
 */
router.get('/filters/options', templateController.getFilterOptions);

/**
 * @route   GET /api/templates/my-templates
 * @desc    Get authenticated user's templates
 * @access  Private
 */
router.get('/my-templates', isAuthenticated, templateController.getMyTemplates);

/**
 * @route   GET /api/templates/shell-types/:shellType
 * @desc    Get templates by specific shell type
 * @access  Private
 */
router.get('/shell-types/:shellType', isAuthenticated, templateController.getTemplatesByShellType);

/**
 * @route   GET /api/templates/search/advanced
 * @desc    Advanced search with multiple filters
 * @access  Private
 */
router.get('/search/advanced', isAuthenticated, templateController.advancedSearch);

/**
 * CRUD OPERATIONS
 */

/**
 * @route   POST /api/templates
 * @desc    Create new attack template
 * @access  Private
 */
router.post('/', isAuthenticated, validateTemplate, templateController.createTemplate);

/**
 * @route   GET /api/templates/:id
 * @desc    Get single template with details and similar templates
 * @access  Public
 */
router.get('/:id', templateController.getTemplate);

/**
 * @route   PUT /api/templates/:id
 * @desc    Update template
 * @access  Private (creator or admin)
 */
router.put('/:id', isAuthenticated, validateTemplate, templateController.updateTemplate);

/**
 * @route   DELETE /api/templates/:id
 * @desc    Delete template
 * @access  Private (creator or admin)
 */
router.delete('/:id', isAuthenticated, templateController.deleteTemplate);

/**
 * COMMAND GENERATION
 */

/**
 * @route   POST /api/templates/:id/generate
 * @desc    Generate single command from template
 * @body    Dynamic fields based on template.requiredFields
 * @access  Private
 */
router.post('/:id/generate', isAuthenticated, templateController.generateCommands);

/**
 * @route   POST /api/templates/:id/generate/batch
 * @desc    Generate multiple commands from template
 * @body    { inputs: [ { field1: value1, ... }, ... ] }
 * @access  Private
 */
router.post('/:id/generate/batch', isAuthenticated, templateController.generateBatchCommands);

/**
 * RATING & FEEDBACK
 */

/**
 * @route   POST /api/templates/:id/rate
 * @desc    Rate and comment on a template
 * @body    { score: 1-5, comment: "..." }
 * @access  Private
 */
router.post('/:id/rate', isAuthenticated, templateController.rateTemplate);

/**
 * @route   GET /api/templates/:id/ratings
 * @desc    Get all ratings for a template
 * @access  Private
 */
router.get('/:id/ratings', isAuthenticated, templateController.getTemplateRatings);

/**
 * ADMIN ROUTES
 */

/**
 * @route   POST /api/admin/templates/:id/feature
 * @desc    Feature a template on homepage
 * @access  Admin only
 */
router.post('/admin/templates/:id/feature', isAuthenticated, isAdmin, templateController.featureTemplate);

/**
 * @route   POST /api/admin/templates/:id/unfeature
 * @desc    Unfeature a template
 * @access  Admin only
 */
router.post('/admin/templates/:id/unfeature', isAuthenticated, isAdmin, templateController.unfeatureTemplate);

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin statistics
 * @access  Admin only
 */
router.get('/admin/stats', isAuthenticated, isAdmin, templateController.getAdminStats);

module.exports = router;
