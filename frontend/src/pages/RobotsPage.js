import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert
} from '@mui/material'
import {
  Add,
  SmartToy,
  Circle,
  PlayArrow,
  Stop,
  Settings
} from '@mui/icons-material'
import api from '../services/api'

const RobotsPage = () => {
  const [robots, setRobots] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [error, setError] = useState('')
  const [newRobot, setNewRobot] = useState({
    name: '',
    type: '6dof_arm',
    model: '',
    isSimulated: true,
    configuration: {
      industry: 'construction'
    }
  })

  useEffect(() => {
    fetchRobots()
  }, [])

  const fetchRobots = async () => {
    try {
      const response = await api.getRobots()
      setRobots(response.data.data.robots || [])
    } catch (error) {
      console.error('Failed to fetch robots:', error)
      setError('Failed to load robots')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRobot = async () => {
    try {
      await api.createRobot(newRobot)
      setOpenDialog(false)
      setNewRobot({
        name: '',
        type: '6dof_arm',
        model: '',
        isSimulated: true,
        configuration: {
          industry: 'construction'
        }
      })
      fetchRobots()
    } catch (error) {
      console.error('Failed to create robot:', error)
      setError('Failed to create robot')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success'
      case 'offline': return 'default'
      case 'error': return 'error'
      case 'maintenance': return 'warning'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    const color = getStatusColor(status)
    return <Circle color={color} sx={{ fontSize: 12 }} />
  }

  const RobotCard = ({ robot }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="div">
            {robot.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {getStatusIcon(robot.status)}
            <Typography variant="body2" color="text.secondary">
              {robot.status}
            </Typography>
          </Box>
        </Box>
        
        <Typography color="text.secondary" gutterBottom>
          Type: {robot.type}
        </Typography>
        
        <Box display="flex" gap={1} mb={2}>
          <Chip 
            label={robot.isSimulated ? 'Simulated' : 'Physical'} 
            size="small" 
            color={robot.isSimulated ? 'primary' : 'secondary'}
          />
          <Chip 
            label={robot.configuration?.industry || 'General'} 
            size="small" 
            variant="outlined"
          />
        </Box>

        {robot.position && (
          <Typography variant="body2" color="text.secondary">
            Position: ({robot.position.x}, {robot.position.y}, {robot.position.z})
          </Typography>
        )}
      </CardContent>
      
      <CardActions>
        <Button 
          size="small" 
          startIcon={robot.status === 'online' ? <Stop /> : <PlayArrow />}
          color={robot.status === 'online' ? 'error' : 'primary'}
        >
          {robot.status === 'online' ? 'Stop' : 'Start'}
        </Button>
        <Button size="small" startIcon={<Settings />}>
          Configure
        </Button>
      </CardActions>
    </Card>
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading robots...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <div>
          <Typography variant="h4" gutterBottom>
            Robot Fleet
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your robots and their configurations
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Robot
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {robots.length === 0 ? (
        <Box textAlign="center" py={8}>
          <SmartToy sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No robots found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first robot to get started with the platform
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Create Robot
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {robots.map((robot) => (
            <Grid item xs={12} sm={6} md={4} key={robot._id}>
              <RobotCard robot={robot} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Robot Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Robot</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Robot Name"
            fullWidth
            variant="outlined"
            value={newRobot.name}
            onChange={(e) => setNewRobot({ ...newRobot, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Robot Type</InputLabel>
            <Select
              value={newRobot.type}
              label="Robot Type"
              onChange={(e) => setNewRobot({ ...newRobot, type: e.target.value })}
            >
              <MenuItem value="4dof_arm">4-DOF Robotic Arm</MenuItem>
              <MenuItem value="6dof_arm">6-DOF Robotic Arm</MenuItem>
              <MenuItem value="mobile_base">Mobile Base</MenuItem>
              <MenuItem value="custom">Custom Configuration</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Model (Optional)"
            fullWidth
            variant="outlined"
            value={newRobot.model}
            onChange={(e) => setNewRobot({ ...newRobot, model: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Industry</InputLabel>
            <Select
              value={newRobot.configuration.industry}
              label="Industry"
              onChange={(e) => setNewRobot({
                ...newRobot,
                configuration: { ...newRobot.configuration, industry: e.target.value }
              })}
            >
              <MenuItem value="construction">Construction</MenuItem>
              <MenuItem value="agriculture">Agriculture</MenuItem>
              <MenuItem value="cooking">Food Service</MenuItem>
              <MenuItem value="manufacturing">Manufacturing</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateRobot} variant="contained">
            Create Robot
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RobotsPage