const mongoose = require('mongoose')

/**
 * @swagger
 * components:
 *   schemas:
 *     Robot:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - owner
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated robot ID
 *         name:
 *           type: string
 *           description: Robot's name
 *         type:
 *           type: string
 *           enum: [4dof_arm, 6dof_arm, mobile_base, custom]
 *           description: Type of robot
 *         model:
 *           type: string
 *           description: Robot model information
 *         status:
 *           type: string
 *           enum: [online, offline, error, maintenance]
 *           description: Current robot status
 *         position:
 *           type: object
 *           properties:
 *             x:
 *               type: number
 *             y:
 *               type: number
 *             z:
 *               type: number
 *         orientation:
 *           type: object
 *           properties:
 *             roll:
 *               type: number
 *             pitch:
 *               type: number
 *             yaw:
 *               type: number
 *         capabilities:
 *           type: array
 *           items:
 *             type: string
 *           description: List of robot capabilities
 *         hardware:
 *           type: object
 *           description: Hardware specifications
 *         lastSeen:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const robotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Robot name is required'],
    trim: true,
    maxlength: [100, 'Robot name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Robot type is required'],
    enum: ['4dof_arm', '6dof_arm', 'mobile_base', 'custom']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters']
  },
  serialNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'error', 'maintenance'],
    default: 'offline'
  },
  isSimulated: {
    type: Boolean,
    default: true
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 }
  },
  orientation: {
    roll: { type: Number, default: 0 },
    pitch: { type: Number, default: 0 },
    yaw: { type: Number, default: 0 }
  },
  jointAngles: [{
    name: String,
    angle: Number,
    minAngle: Number,
    maxAngle: Number
  }],
  capabilities: [{
    type: String,
    enum: [
      'pick_and_place',
      'computer_vision',
      'force_feedback',
      'path_planning',
      'object_detection',
      'voice_control',
      'learning',
      'safety_monitoring'
    ]
  }],
  hardware: {
    arm: {
      dof: { type: Number, min: 3, max: 7 },
      payload: { type: Number, min: 0 }, // kg
      reach: { type: Number, min: 0 }, // mm
      repeatability: { type: Number, min: 0 } // mm
    },
    camera: {
      resolution: String,
      fps: Number,
      fieldOfView: Number
    },
    sensors: [{
      type: String,
      model: String,
      accuracy: Number
    }],
    controller: {
      type: String,
      model: String,
      memory: String,
      storage: String
    }
  },
  network: {
    ipAddress: String,
    macAddress: String,
    connectionType: {
      type: String,
      enum: ['wifi', 'ethernet', 'cellular'],
      default: 'wifi'
    },
    signalStrength: Number
  },
  firmware: {
    version: String,
    lastUpdate: Date,
    updateAvailable: Boolean
  },
  configuration: {
    industry: {
      type: String,
      enum: ['construction', 'agriculture', 'cooking', 'manufacturing'],
      default: 'construction'
    },
    workspace: {
      bounds: {
        xMin: Number,
        xMax: Number,
        yMin: Number,
        yMax: Number,
        zMin: Number,
        zMax: Number
      },
      obstacles: [{
        name: String,
        position: {
          x: Number,
          y: Number,
          z: Number
        },
        dimensions: {
          width: Number,
          height: Number,
          depth: Number
        }
      }]
    },
    safety: {
      maxSpeed: { type: Number, default: 100 }, // mm/s
      maxAcceleration: { type: Number, default: 500 }, // mm/s²
      forceLimit: { type: Number, default: 10 }, // N
      emergencyStop: { type: Boolean, default: true }
    }
  },
  metrics: {
    totalOperationTime: { type: Number, default: 0 }, // hours
    taskSuccessRate: { type: Number, default: 100 }, // percentage
    averageTaskTime: { type: Number, default: 0 }, // seconds
    errorCount: { type: Number, default: 0 },
    maintenanceHours: { type: Number, default: 0 }
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  lastTelemetry: {
    timestamp: Date,
    data: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
})

// Indexes for better query performance
robotSchema.index({ owner: 1 })
robotSchema.index({ status: 1 })
robotSchema.index({ 'configuration.industry': 1 })
robotSchema.index({ serialNumber: 1 }, { unique: true, sparse: true })

// Update last seen when robot sends data
robotSchema.methods.updateLastSeen = function () {
  this.lastSeen = new Date()
  return this.save()
}

// Calculate uptime percentage
robotSchema.methods.getUptimePercentage = function (days = 30) {
  const totalTime = days * 24 * 60 * 60 * 1000 // milliseconds
  const downtime = this.metrics.errorCount * 60000 // assume 1 minute per error
  return Math.max(0, ((totalTime - downtime) / totalTime) * 100)
}

module.exports = mongoose.model('Robot', robotSchema)