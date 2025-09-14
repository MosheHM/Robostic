import React, { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  LinearProgress,
  Chip
} from '@mui/material'
import {
  SmartToy,
  TrendingUp,
  Speed,
  Security
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const DashboardPage = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalRobots: 0,
    activeRobots: 0,
    totalTasks: 0,
    successRate: 0
  })
  const [loading, setLoading] = useState(true)

  // Sample data for the chart
  const chartData = [
    { name: 'Mon', tasks: 12, success: 11 },
    { name: 'Tue', tasks: 19, success: 18 },
    { name: 'Wed', tasks: 15, success: 14 },
    { name: 'Thu', tasks: 22, success: 20 },
    { name: 'Fri', tasks: 28, success: 26 },
    { name: 'Sat', tasks: 18, success: 17 },
    { name: 'Sun', tasks: 14, success: 13 }
  ]

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls (in real app, these would be separate endpoints)
      const robotsResponse = await api.getRobots()
      const robots = robotsResponse.data.data.robots || []
      
      const activeRobots = robots.filter(robot => robot.status === 'online').length
      
      setStats({
        totalRobots: robots.length,
        activeRobots: activeRobots,
        totalTasks: 147, // Simulated
        successRate: 96.8 // Simulated
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, color, progress }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {progress !== undefined && (
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                color={color}
              />
            )}
          </Box>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Here's your robotics platform overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Robots"
            value={stats.totalRobots}
            icon={<SmartToy sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Robots"
            value={stats.activeRobots}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="success"
            progress={(stats.activeRobots / Math.max(stats.totalRobots, 1)) * 100}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tasks Completed"
            value={stats.totalTasks}
            icon={<Speed sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            icon={<Security sx={{ fontSize: 40 }} />}
            color="warning"
            progress={stats.successRate}
          />
        </Grid>
      </Grid>

      {/* Charts and Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Task Performance (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="#2196f3" 
                  strokeWidth={2}
                  name="Total Tasks"
                />
                <Line 
                  type="monotone" 
                  dataKey="success" 
                  stroke="#4caf50" 
                  strokeWidth={2}
                  name="Successful Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Industry Focus
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Current Industry
                </Typography>
                <Chip 
                  label={user?.preferences?.defaultIndustry || 'Construction'} 
                  color="primary" 
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Subscription Tier
                </Typography>
                <Chip 
                  label={user?.subscription?.tier || 'Free'} 
                  color="secondary" 
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Quick Actions
                </Typography>
                <Box mt={2} display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body2">
                    • Create new robot
                  </Typography>
                  <Typography variant="body2">
                    • Start simulation
                  </Typography>
                  <Typography variant="body2">
                    • View documentation
                  </Typography>
                  <Typography variant="body2">
                    • Download SDK
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage