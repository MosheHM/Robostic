const Joi = require('joi')

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate (body, query, params)
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      })
    }

    // Replace request property with validated value
    req[property] = value
    next()
  }
}

// Common validation schemas
const schemas = {
  // AI command validation
  aiCommand: Joi.object({
    text: Joi.string().trim().min(1).max(500).required()
      .messages({
        'string.empty': 'Command text is required',
        'string.min': 'Command text must not be empty',
        'string.max': 'Command text must not exceed 500 characters'
      }),
    context: Joi.object({
      robotId: Joi.string().trim(),
      environment: Joi.string().trim(),
      industry: Joi.string().valid('construction', 'agriculture', 'cooking', 'manufacturing')
    }).default({})
  }),

  // Scene analysis validation
  sceneAnalysis: Joi.object({
    image: Joi.string().required()
      .messages({
        'string.empty': 'Image data is required',
        'any.required': 'Image data is required'
      }),
    context: Joi.object({
      industry: Joi.string().valid('construction', 'agriculture', 'cooking', 'manufacturing')
    }).default({})
  }),

  // Task plan generation validation
  taskPlan: Joi.object({
    task: Joi.string().trim().min(1).max(1000).required()
      .messages({
        'string.empty': 'Task description is required',
        'any.required': 'Task description is required'
      }),
    robotCapabilities: Joi.array().items(Joi.string()).default([]),
    environment: Joi.object().default({}),
    constraints: Joi.object().default({})
  }),

  // Robot movement validation
  robotMove: Joi.object({
    position: Joi.object({
      x: Joi.number().required(),
      y: Joi.number().required(),
      z: Joi.number().required()
    }),
    orientation: Joi.object({
      roll: Joi.number().min(-180).max(180),
      pitch: Joi.number().min(-180).max(180),
      yaw: Joi.number().min(-180).max(180)
    }),
    speed: Joi.number().min(1).max(100).default(50),
    interpolation: Joi.string().valid('linear', 'cubic', 'smooth').default('linear')
  }),

  // Gripper control validation
  gripperControl: Joi.object({
    action: Joi.string().valid('open', 'close', 'grab', 'release').required()
      .messages({
        'any.required': 'Gripper action is required',
        'any.only': 'Gripper action must be one of: open, close, grab, release'
      }),
    force: Joi.number().min(0).max(1).default(0.5),
    width: Joi.number().min(0)
  }),

  // Robot creation validation
  createRobot: Joi.object({
    name: Joi.string().trim().min(1).max(100).required()
      .messages({
        'string.empty': 'Robot name is required',
        'any.required': 'Robot name is required'
      }),
    type: Joi.string().valid('4dof_arm', '6dof_arm', 'mobile_base', 'custom').required()
      .messages({
        'any.required': 'Robot type is required'
      }),
    model: Joi.string().trim().max(100),
    isSimulated: Joi.boolean().default(true),
    capabilities: Joi.array().items(Joi.string()).default([]),
    configuration: Joi.object().default({})
  }),

  // Pagination validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string(),
    industry: Joi.string().valid('construction', 'agriculture', 'cooking', 'manufacturing')
  })
}

module.exports = {
  validate,
  schemas
}
