/**
 * Validation middleware for automation endpoints
 */

export const validateAutomation = (req, res, next) => {
  const errors = [];
  const { name, trigger, action, templateId, enabled } = req.body;

  if (!name || typeof name !== 'string') {
    errors.push('name is required and must be a string');
  } else if (name.trim().length === 0) {
    errors.push('name cannot be empty');
  } else if (name.length > 100) {
    errors.push('name cannot exceed 100 characters');
  }

  if (!trigger || typeof trigger !== 'string') {
    errors.push('trigger is required and must be a string');
  } else if (trigger.trim().length === 0) {
    errors.push('trigger cannot be empty');
  } else if (trigger.length > 500) {
    errors.push('trigger cannot exceed 500 characters');
  }

  if (!action || typeof action !== 'string') {
    errors.push('action is required and must be a string');
  } else if (!['SEND_MESSAGE', 'FORWARD', 'ARCHIVE'].includes(action)) {
    errors.push('action must be one of: SEND_MESSAGE, FORWARD, ARCHIVE');
  }

  if (templateId && typeof templateId !== 'string') {
    errors.push('templateId must be a string');
  }

  if (enabled !== undefined && typeof enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors
    });
  }

  next();
};

export const validateBodyNotEmpty = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: 'Request body cannot be empty',
      code: 'EMPTY_BODY'
    });
  }
  next();
};

export const sanitizeAutomation = (req, res, next) => {
  if (req.body.name) {
    req.body.name = req.body.name.trim();
  }
  if (req.body.trigger) {
    req.body.trigger = req.body.trigger.trim();
  }
  next();
};
