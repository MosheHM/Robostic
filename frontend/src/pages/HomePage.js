import React from 'react'
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material'
import {
  Rocket,
  CloudQueue,
  Psychology,
  Security
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <CloudQueue color="primary" sx={{ fontSize: 40 }} />,
      title: 'Cloud-Native Platform',
      description: 'Develop and deploy robot AI applications without managing infrastructure.'
    },
    {
      icon: <Psychology color="primary" sx={{ fontSize: 40 }} />,
      title: 'AI-Powered',
      description: 'Natural language programming with advanced computer vision and machine learning.'
    },
    {
      icon: <Rocket color="primary" sx={{ fontSize: 40 }} />,
      title: 'Virtual Development',
      description: 'High-fidelity simulation environment for hardware-free development and testing.'
    },
    {
      icon: <Security color="primary" sx={{ fontSize: 40 }} />,
      title: 'Enterprise Ready',
      description: 'Secure, scalable, and compliant platform for production deployments.'
    }
  ]

  const industries = ['Construction', 'Agriculture', 'Manufacturing', 'Food Service']

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={8}>
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Democratizing AI Robotics
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Build sophisticated robot AI applications without dealing with hardware complexity.
            Our cloud-native platform abstracts away the technical barriers.
          </Typography>
          <Box mt={4}>
            <Button
              variant="contained"
              size="large"
              sx={{ mr: 2, px: 4, py: 1.5 }}
              onClick={() => navigate('/login')}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ px: 4, py: 1.5 }}
            >
              View Demo
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Box mb={8}>
          <Typography variant="h4" textAlign="center" gutterBottom>
            Platform Features
          </Typography>
          <Grid container spacing={4} mt={2}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Box mb={2}>{feature.icon}</Box>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Industries Section */}
        <Box mb={8}>
          <Typography variant="h4" textAlign="center" gutterBottom>
            Industry Applications
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" paragraph>
            Pre-built templates and examples for diverse industry use cases
          </Typography>
          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mt={3}>
            {industries.map((industry) => (
              <Chip
                key={industry}
                label={industry}
                variant="outlined"
                size="large"
                sx={{ px: 2, py: 1 }}
              />
            ))}
          </Box>
        </Box>

        {/* CTA Section */}
        <Box
          textAlign="center"
          p={6}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            color: 'white'
          }}
        >
          <Typography variant="h4" gutterBottom>
            Ready to Build the Future?
          </Typography>
          <Typography variant="h6" paragraph>
            Join thousands of developers building the next generation of AI-powered robots
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              mt: 2,
              px: 4,
              py: 1.5,
              backgroundColor: 'rgba(255,255,255,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)'
              }
            }}
            onClick={() => navigate('/login')}
          >
            Start Building Today
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default HomePage