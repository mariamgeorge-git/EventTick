import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import SecurityIcon from '@mui/icons-material/Security';
import SupportIcon from '@mui/icons-material/Support';

const AboutPage = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <EventIcon fontSize="large" color="primary" />,
      title: 'Event Management',
      description: 'Discover and book tickets for the most exciting events in your area. From concerts to conferences, we\'ve got you covered.',
    },
    {
      icon: <SecurityIcon fontSize="large" color="primary" />,
      title: 'Secure Booking',
      description: 'Our platform ensures safe and secure ticket booking with advanced security measures and user authentication.',
    },
    {
      icon: <SupportIcon fontSize="large" color="primary" />,
      title: '24/7 Support',
      description: 'Our dedicated support team is always ready to assist you with any questions or concerns about your bookings.',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={8}>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          About EventTick
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          Your Premier Destination for Event Ticketing
        </Typography>
      </Box>

      {/* Mission Statement */}
      <Paper elevation={3} sx={{ p: 4, mb: 8, backgroundColor: theme.palette.primary.main, color: 'white' }}>
        <Typography variant="h4" gutterBottom align="center">
          Our Mission
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          At EventTick, we're dedicated to connecting people with unforgettable experiences. 
          Our mission is to make event discovery and ticket booking seamless, secure, and enjoyable for everyone.
        </Typography>
      </Paper>

      {/* Features Grid */}
      <Grid container spacing={4} mb={8}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
              <Box mb={2}>
                {feature.icon}
              </Box>
              <Typography variant="h5" component="h3" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {feature.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Why Choose Us */}
      <Box mb={8}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Why Choose EventTick?
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>
                ✓ User-Friendly Platform
              </Typography>
              <Typography paragraph>
                Our intuitive interface makes it easy to find and book tickets for your favorite events.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                ✓ Secure Transactions
              </Typography>
              <Typography paragraph>
                We use state-of-the-art security measures to protect your personal and payment information.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>
                ✓ Wide Event Selection
              </Typography>
              <Typography paragraph>
                Access a diverse range of events from concerts and sports to workshops and conferences.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                ✓ Excellent Support
              </Typography>
              <Typography paragraph>
                Our customer service team is always ready to assist you with any questions or concerns.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Contact Section */}
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.100' }}>
        <Typography variant="h5" gutterBottom>
          Ready to Experience Amazing Events?
        </Typography>
        <Typography variant="body1" paragraph>
          Join thousands of satisfied users who trust EventTick for their event ticketing needs.
        </Typography>
      </Paper>
    </Container>
  );
};

export default AboutPage; 