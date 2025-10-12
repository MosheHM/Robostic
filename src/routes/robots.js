const express = require('express')
const { auth } = require('../middleware/auth')
const Robot = require('../models/Robot')
const logger = require('../utils/logger')

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Robots
 *   description: Robot management and control
 */

/**
 * @swagger
 * /api/v1/robots:
 *   get:
 *     summary: Get all robots for the authenticated user
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [online, offline, error, maintenance]
 *         description: Filter by robot status
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *           enum: [construction, agriculture, cooking, manufacturing]
 *         description: Filter by industry
 *     responses:
 *       200:
 *         description: Robots retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, async (req, res, next) => {
  try {
    const { status, industry, page = 1, limit = 20 } = req.query

    const filter = { owner: req.user.id }
    if (status) filter.status = status
    if (industry) filter['configuration.industry'] = industry

    const robots = await Robot.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ lastSeen: -1 })

    const total = await Robot.countDocuments(filter)

    res.status(200).json({
      success: true,
      data: {
        robots,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/robots:
 *   post:
 *     summary: Create a new robot
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [4dof_arm, 6dof_arm, mobile_base, custom]
 *               model:
 *                 type: string
 *               isSimulated:
 *                 type: boolean
 *               capabilities:
 *                 type: array
 *                 items:
 *                   type: string
 *               configuration:
 *                 type: object
 *     responses:
 *       201:
 *         description: Robot created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, async (req, res, next) => {
  try {
    const robotData = {
      ...req.body,
      owner: req.user.id,
      organization: req.user.organization
    }

    const robot = await Robot.create(robotData)

    logger.info(`New robot created: ${robot.name} by user: ${req.user.email}`)

    res.status(201).json({
      success: true,
      message: 'Robot created successfully',
      data: { robot }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/robots/{id}:
 *   get:
 *     summary: Get robot by ID
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Robot ID
 *     responses:
 *       200:
 *         description: Robot retrieved successfully
 *       404:
 *         description: Robot not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth, async (req, res, next) => {
  try {
    const robot = await Robot.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!robot) {
      return res.status(404).json({
        success: false,
        message: 'Robot not found'
      })
    }

    res.status(200).json({
      success: true,
      data: { robot }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/robots/{id}/status:
 *   get:
 *     summary: Get robot status and telemetry
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Robot ID
 *     responses:
 *       200:
 *         description: Robot status retrieved successfully
 *       404:
 *         description: Robot not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/status', auth, async (req, res, next) => {
  try {
    const robot = await Robot.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!robot) {
      return res.status(404).json({
        success: false,
        message: 'Robot not found'
      })
    }

    const statusData = {
      id: robot._id,
      name: robot.name,
      status: robot.status,
      position: robot.position,
      orientation: robot.orientation,
      jointAngles: robot.jointAngles,
      lastSeen: robot.lastSeen,
      uptime: robot.getUptimePercentage(),
      lastTelemetry: robot.lastTelemetry,
      metrics: robot.metrics
    }

    res.status(200).json({
      success: true,
      data: statusData
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/robots/{id}/move:
 *   post:
 *     summary: Send movement command to robot
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Robot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               position:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: number
 *                   y:
 *                     type: number
 *                   z:
 *                     type: number
 *               orientation:
 *                 type: object
 *                 properties:
 *                   roll:
 *                     type: number
 *                   pitch:
 *                     type: number
 *                   yaw:
 *                     type: number
 *               speed:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 100
 *               interpolation:
 *                 type: string
 *                 enum: [linear, cubic, smooth]
 *     responses:
 *       200:
 *         description: Movement command sent successfully
 *       404:
 *         description: Robot not found
 *       400:
 *         description: Invalid movement parameters
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/move', auth, async (req, res, next) => {
  try {
    const robot = await Robot.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!robot) {
      return res.status(404).json({
        success: false,
        message: 'Robot not found'
      })
    }

    if (robot.status === 'offline') {
      return res.status(400).json({
        success: false,
        message: 'Robot is offline'
      })
    }

    const { position, orientation, speed = 50, interpolation = 'linear' } = req.body

    // Validate movement parameters
    if (position) {
      const { x, y, z } = position
      if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Invalid position coordinates'
        })
      }
    }

    // Create movement command
    const command = {
      type: 'move',
      timestamp: new Date(),
      parameters: {
        position,
        orientation,
        speed,
        interpolation
      }
    }

    // Update robot position (for simulation)
    if (robot.isSimulated && position) {
      robot.position = { ...robot.position, ...position }
      if (orientation) {
        robot.orientation = { ...robot.orientation, ...orientation }
      }
      await robot.save()
    }

    // Emit command via Socket.IO (if available)
    try {
      const { io } = require('../server')
      if (io) {
        io.to(`robot-${robot._id}`).emit('movement-command', command)
      }
    } catch (err) {
      logger.warn('Socket.IO not available for real-time command transmission')
    }

    logger.info(`Movement command sent to robot ${robot.name}: ${JSON.stringify(command)}`)

    res.status(200).json({
      success: true,
      message: 'Movement command sent successfully',
      data: {
        command,
        estimatedDuration: Math.abs(speed - 100) * 2 // Simulate duration based on speed
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/robots/{id}/gripper:
 *   post:
 *     summary: Control robot gripper
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Robot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [open, close, grab, release]
 *               force:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               width:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Gripper command sent successfully
 *       404:
 *         description: Robot not found
 *       400:
 *         description: Invalid gripper parameters
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/gripper', auth, async (req, res, next) => {
  try {
    const robot = await Robot.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!robot) {
      return res.status(404).json({
        success: false,
        message: 'Robot not found'
      })
    }

    if (robot.status === 'offline') {
      return res.status(400).json({
        success: false,
        message: 'Robot is offline'
      })
    }

    const { action, force = 0.5, width } = req.body

    const command = {
      type: 'gripper',
      timestamp: new Date(),
      parameters: {
        action,
        force,
        width
      }
    }

    // Emit command via Socket.IO (if available)
    try {
      const { io } = require('../server')
      if (io) {
        io.to(`robot-${robot._id}`).emit('gripper-command', command)
      }
    } catch (err) {
      logger.warn('Socket.IO not available for real-time command transmission')
    }

    logger.info(`Gripper command sent to robot ${robot.name}: ${action}`)

    res.status(200).json({
      success: true,
      message: 'Gripper command sent successfully',
      data: { command }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/robots/{id}:
 *   put:
 *     summary: Update robot configuration
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Robot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               configuration:
 *                 type: object
 *               capabilities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Robot updated successfully
 *       404:
 *         description: Robot not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', auth, async (req, res, next) => {
  try {
    const robot = await Robot.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true, runValidators: true }
    )

    if (!robot) {
      return res.status(404).json({
        success: false,
        message: 'Robot not found'
      })
    }

    logger.info(`Robot updated: ${robot.name} by user: ${req.user.email}`)

    res.status(200).json({
      success: true,
      message: 'Robot updated successfully',
      data: { robot }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/v1/robots/{id}:
 *   delete:
 *     summary: Delete robot
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Robot ID
 *     responses:
 *       200:
 *         description: Robot deleted successfully
 *       404:
 *         description: Robot not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const robot = await Robot.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!robot) {
      return res.status(404).json({
        success: false,
        message: 'Robot not found'
      })
    }

    logger.info(`Robot deleted: ${robot.name} by user: ${req.user.email}`)

    res.status(200).json({
      success: true,
      message: 'Robot deleted successfully'
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
