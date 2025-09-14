import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material'
import {
  PlayArrow,
  Stop,
  Refresh,
  Send
} from '@mui/icons-material'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Box as ThreeBox, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import api from '../services/api'

// Simple 3D Robot Arm Component
const RobotArm = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group position={position} rotation={rotation}>
      {/* Base */}
      <ThreeBox ref={meshRef} args={[1, 0.2, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="gray" />
      </ThreeBox>
      
      {/* Arm segments */}
      <ThreeBox args={[0.2, 2, 0.2]} position={[0, 1, 0]}>
        <meshStandardMaterial color="blue" />
      </ThreeBox>
      
      <ThreeBox args={[0.15, 1.5, 0.15]} position={[0, 2.5, 0]}>
        <meshStandardMaterial color="blue" />
      </ThreeBox>
      
      {/* End effector */}
      <Sphere args={[0.1]} position={[0, 3.5, 0]}>
        <meshStandardMaterial color="red" />
      </Sphere>
    </group>
  )
}

// 3D Environment Component
const SimulationEnvironment = () => {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshLambertMaterial color="lightgray" />
      </mesh>
      
      {/* Robot */}
      <RobotArm position={[0, 0, 0]} />
      
      {/* Some objects in the scene */}
      <ThreeBox args={[0.5, 0.5, 0.5]} position={[2, 0, 0]}>
        <meshStandardMaterial color="orange" />
      </ThreeBox>
      
      <ThreeBox args={[0.3, 0.8, 0.3]} position={[-2, 0, 1]}>
        <meshStandardMaterial color="green" />
      </ThreeBox>
      
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </Canvas>
  )
}

const SimulationPage = () => {
  const [isSimulationRunning, setIsSimulationRunning] = useState(false)
  const [command, setCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [robotStatus, setRobotStatus] = useState({
    position: { x: 0, y: 0, z: 0 },
    status: 'ready'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStartSimulation = () => {
    setIsSimulationRunning(true)
    setCommandHistory([
      ...commandHistory,
      {
        timestamp: new Date().toLocaleTimeString(),
        type: 'system',
        message: 'Simulation started'
      }
    ])
  }

  const handleStopSimulation = () => {
    setIsSimulationRunning(false)
    setCommandHistory([
      ...commandHistory,
      {
        timestamp: new Date().toLocaleTimeString(),
        type: 'system',
        message: 'Simulation stopped'
      }
    ])
  }

  const handleSendCommand = async () => {
    if (!command.trim()) return

    setLoading(true)
    setError('')

    try {
      // Add user command to history
      const userCommand = {
        timestamp: new Date().toLocaleTimeString(),
        type: 'user',
        message: command
      }
      setCommandHistory(prev => [...prev, userCommand])

      // Process command with AI
      const response = await api.processCommand(command, {
        robotId: 'simulation',
        environment: 'virtual'
      })

      // Add AI response to history
      const aiResponse = {
        timestamp: new Date().toLocaleTimeString(),
        type: 'ai',
        message: `Command processed: ${response.data.processedCommand.action}`,
        confidence: response.data.confidence
      }
      setCommandHistory(prev => [...prev, aiResponse])

      // Simulate robot movement (in real app, this would update the 3D scene)
      if (response.data.processedCommand.action === 'move') {
        setRobotStatus(prev => ({
          ...prev,
          position: {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2,
            z: Math.random() * 2 - 1
          }
        }))
      }

      setCommand('')
    } catch (error) {
      console.error('Failed to process command:', error)
      setError('Failed to process command. Please try again.')
      
      const errorResponse = {
        timestamp: new Date().toLocaleTimeString(),
        type: 'error',
        message: 'Failed to process command'
      }
      setCommandHistory(prev => [...prev, errorResponse])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendCommand()
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Virtual Simulation Environment
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Test and develop your robot AI applications in a risk-free virtual environment
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 3D Simulation Viewport */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 500 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                3D Simulation Viewport
              </Typography>
              <Box>
                <Button
                  variant={isSimulationRunning ? "outlined" : "contained"}
                  startIcon={isSimulationRunning ? <Stop /> : <PlayArrow />}
                  onClick={isSimulationRunning ? handleStopSimulation : handleStartSimulation}
                  sx={{ mr: 1 }}
                  color={isSimulationRunning ? "error" : "primary"}
                >
                  {isSimulationRunning ? 'Stop' : 'Start'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => window.location.reload()}
                >
                  Reset
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ height: 400, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <SimulationEnvironment />
            </Box>
          </Paper>
        </Grid>

        {/* Control Panel */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2} direction="column">
            {/* Robot Status */}
            <Grid item>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Robot Status
                  </Typography>
                  <Box display="flex" gap={1} mb={2}>
                    <Chip 
                      label={isSimulationRunning ? 'Running' : 'Stopped'} 
                      color={isSimulationRunning ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip 
                      label="Simulated" 
                      color="primary" 
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Position: ({robotStatus.position.x.toFixed(2)}, {robotStatus.position.y.toFixed(2)}, {robotStatus.position.z.toFixed(2)})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {robotStatus.status}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Natural Language Commands */}
            <Grid item>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI Commands
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Tell the robot what to do... (e.g., 'Pick up the orange block and place it on the table')"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!isSimulationRunning || loading}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleSendCommand}
                    disabled={!isSimulationRunning || loading || !command.trim()}
                  >
                    {loading ? 'Processing...' : 'Send Command'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Command History */}
            <Grid item>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Command History
                  </Typography>
                  <Box
                    sx={{
                      height: 200,
                      overflowY: 'auto',
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      p: 1
                    }}
                  >
                    {commandHistory.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No commands yet. Start the simulation and send a command.
                      </Typography>
                    ) : (
                      commandHistory.map((entry, index) => (
                        <Box key={index} mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            {entry.timestamp}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={
                              entry.type === 'user' ? 'primary.main' :
                              entry.type === 'ai' ? 'success.main' :
                              entry.type === 'error' ? 'error.main' :
                              'text.secondary'
                            }
                          >
                            {entry.type === 'user' ? '> ' : ''}
                            {entry.message}
                            {entry.confidence && ` (${(entry.confidence * 100).toFixed(0)}% confidence)`}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SimulationPage