const express = require('express')
const { auth } = require('../middleware/auth')

const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Telemetry API endpoint - Implementation in progress'
  })
})

module.exports = router