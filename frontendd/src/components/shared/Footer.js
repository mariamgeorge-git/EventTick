import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#111', // Dark footer background
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Event Ticketing
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
              Your one-stop platform for discovering and booking amazing events.
            </Typography>
            <Box sx={{ mt: 2 }}>
              {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map((name) => (
                <IconButton
                  key={name}
                  color="inherit"
                  aria-label={name}
                  sx={{
                    '&:hover': {
                      color: '#ffcc00',
                    },
                  }}
                >
                  {{
                    Facebook: <FacebookIcon />,
                    Twitter: <TwitterIcon />,
                    Instagram: <InstagramIcon />,
                    YouTube: <YouTubeIcon />,
                  }[name]}
                </IconButton>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            {[
              { href: '/', label: 'Home' },
              { href: '/events', label: 'Events' },
              { href: '/about', label: 'About Us' },
              { href: '/contact', label: 'Contact' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                color="inherit"
                display="block"
                sx={{
                  mb: 1.5,
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: '#ffcc00', textDecoration: 'underline' },
                }}
              >
                {label}
              </Link>
            ))}
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            {[
              'Email: info@eventticketing.com',
              'Phone: (123) 456-7890',
              'Address: 123 Event Street, City, Country',
            ].map((line, i) => (
              <Typography
                key={i}
                variant="body2"
                sx={{ mb: i !== 2 ? 1.5 : 0, color: 'rgba(255,255,255,0.8)' }}
              >
                {line}
              </Typography>
            ))}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            © {currentYear} Event Ticketing. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
