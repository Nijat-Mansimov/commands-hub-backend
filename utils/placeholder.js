/**
 * Replace all placeholders in a command template with actual values
 * Example: "nmap -p 445 {{targetIP}}" + {targetIP: "192.168.1.1"} => "nmap -p 445 192.168.1.1"
 */
const replacePlaceholders = (commandTemplate, values) => {
  if (!commandTemplate || !values) {
    throw new Error('CommandTemplate and values are required');
  }

  let result = commandTemplate;

  // Find all placeholders in the format {{fieldName}} or {{ fieldName }}
  const placeholderRegex = /\{\{\s*([^}]+)\s*\}\}/g;

  result = result.replace(placeholderRegex, (match, fieldName) => {
    const trimmedFieldName = fieldName.trim();

    // Return the value if it exists, otherwise return the original placeholder
    if (values.hasOwnProperty(trimmedFieldName) && values[trimmedFieldName] !== null && values[trimmedFieldName] !== '') {
      // Escape special shell characters if needed
      return String(values[trimmedFieldName]);
    }

    // If field not provided, return placeholder untouched (will be obvious to user)
    return match;
  });

  return result;
};

/**
 * Validate that all required fields are provided
 */
const validateRequiredFields = (requiredFields, providedValues) => {
  const missingFields = [];

  for (const field of requiredFields) {
    if (field.required && (!providedValues.hasOwnProperty(field.fieldName) || 
        providedValues[field.fieldName] === '' || 
        providedValues[field.fieldName] === null ||
        providedValues[field.fieldName] === undefined)) {
      missingFields.push(field.fieldName);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Validate field values based on their type
 */
const validateFieldType = (fieldName, value, fieldType) => {
  if (value === null || value === undefined || value === '') {
    return { valid: true }; // Empty is validated by required check
  }

  const stringValue = String(value).trim();

  switch (fieldType) {
    case 'number':
      if (isNaN(stringValue)) {
        return { valid: false, error: `${fieldName} must be a valid number` };
      }
      break;

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(stringValue)) {
        return { valid: false, error: `${fieldName} must be a valid email` };
      }
      break;

    case 'url':
      try {
        new URL(stringValue);
      } catch {
        return { valid: false, error: `${fieldName} must be a valid URL` };
      }
      break;

    case 'ip':
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
      if (!ipv4Regex.test(stringValue) && !ipv6Regex.test(stringValue)) {
        return { valid: false, error: `${fieldName} must be a valid IP address` };
      }
      break;

    case 'port':
      const port = parseInt(stringValue);
      if (isNaN(port) || port < 1 || port > 65535) {
        return { valid: false, error: `${fieldName} must be a valid port (1-65535)` };
      }
      break;

    case 'domain':
      const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
      if (!domainRegex.test(stringValue)) {
        return { valid: false, error: `${fieldName} must be a valid domain` };
      }
      break;

    case 'select':
      // Validation would be done against field.options
      break;

    default:
      // text, password, textarea - no specific validation
      break;
  }

  return { valid: true };
};

/**
 * Validate all provided values against their field definitions
 */
const validateAllFields = (requiredFields, providedValues) => {
  const errors = [];
  const missingFields = [];

  for (const field of requiredFields) {
    const value = providedValues[field.fieldName];

    // Check if required
    if (field.required && (value === null || value === undefined || value === '')) {
      missingFields.push(field.fieldName);
      continue;
    }

    // Skip type validation if empty and not required
    if (!field.required && (value === null || value === undefined || value === '')) {
      continue;
    }

    // Validate type
    const typeValidation = validateFieldType(field.fieldName, value, field.fieldType);
    if (!typeValidation.valid) {
      errors.push(typeValidation.error);
    }

    // Validate select options
    if (field.fieldType === 'select' && field.options && field.options.length > 0) {
      if (!field.options.includes(String(value))) {
        errors.push(`${field.fieldName} must be one of: ${field.options.join(', ')}`);
      }
    }
  }

  return {
    isValid: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors,
  };
};

/**
 * Generate multiple commands from a template with different iterations
 */
const generateMultipleCommands = (commandTemplate, valuesArray) => {
  return valuesArray.map(values => ({
    command: replacePlaceholders(commandTemplate, values),
    values,
  }));
};

/**
 * Get list of all placeholders in a template
 */
const extractPlaceholders = (commandTemplate) => {
  if (!commandTemplate) return [];

  const placeholderRegex = /\{\{\s*([^}]+)\s*\}\}/g;
  const placeholders = [];
  let match;

  while ((match = placeholderRegex.exec(commandTemplate)) !== null) {
    const fieldName = match[1].trim();
    if (!placeholders.includes(fieldName)) {
      placeholders.push(fieldName);
    }
  }

  return placeholders;
};

/**
 * Check if template has all required placeholders
 */
const validateTemplatePlaceholders = (commandTemplate, requiredFields) => {
  const templatePlaceholders = extractPlaceholders(commandTemplate);
  const fieldNames = requiredFields.map(f => f.fieldName);

  const missingInTemplate = fieldNames.filter(f => !templatePlaceholders.includes(f));
  const unusedPlaceholders = templatePlaceholders.filter(p => !fieldNames.includes(p));

  return {
    valid: missingInTemplate.length === 0 && unusedPlaceholders.length === 0,
    missingInTemplate,
    unusedPlaceholders,
  };
};

/**
 * Format command template with syntax highlighting hints
 */
const formatCommandForDisplay = (commandTemplate) => {
  const placeholderRegex = /\{\{([^}]+)\}\}/g;
  return commandTemplate.replace(placeholderRegex, '<span style="color: #ff6b35; font-weight: bold;">{{$1}}</span>');
};

module.exports = {
  replacePlaceholders,
  validateRequiredFields,
  validateFieldType,
  validateAllFields,
  generateMultipleCommands,
  extractPlaceholders,
  validateTemplatePlaceholders,
  formatCommandForDisplay,
};
