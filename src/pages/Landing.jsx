import React from 'react';
import { Link } from 'react-router-dom';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Container, 
    Box, 
    Grid, 
    Stack 
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';

function Landing() {
    return (
        <Box sx={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden', 
            backgroundColor: '#fff' 
        }}>
           
            <AppBar 
                position="static" 
                elevation={0} 
                sx={{ backgroundColor: 'white', borderBottom: '1px solid #dadce0' }}
            >
                <Container maxWidth="lg">
                    <Toolbar sx={{ justifyContent: 'space-between', px: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <VideoCallIcon sx={{ color: '#1a73e8', fontSize: 32 }} />
                            <Typography variant="h6" sx={{ color: '#5f6368', fontWeight: 500 }}>
                                My Video Call
                            </Typography>
                        </Stack>
                        
                        <Stack direction="row" spacing={2}>
                            <Button 
                                component={Link} 
                                to="/auth" 
                                sx={{ color: '#5f6368', textTransform: 'none', fontWeight: 500 }}
                            >
                                Register
                            </Button>
                            <Button 
                                component={Link} 
                                to="/auth" 
                                variant="outlined" 
                                sx={{ 
                                    color: '#1a73e8', 
                                    borderColor: '#dadce0', 
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#f8f9fa', borderColor: '#dadce0' }
                                }}
                            >
                                Login
                            </Button>
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>

          
            <Box component="main" sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                alignItems: 'center',
                px: 2
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        
                       
                        <Grid item xs={12} md={7}>
                            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, pr: { md: 5 } }}>
                                <Typography variant="h1" sx={{ 
                                    fontWeight: 400, 
                                    fontSize: { xs: '2.2rem', md: '3.2rem', lg: '3.8rem' },
                                    color: '#202124',
                                    lineHeight: 1.2,
                                    mb: 2
                                }}>
                                    Premium video meetings. <br />
                                    Now <span style={{ color: '#1a73e8' }}>free for everyone.</span>
                                </Typography>
                                
                                <Typography variant="h6" sx={{ 
                                    color: '#5f6368', 
                                    mb: 5, 
                                    fontWeight: 300,
                                    maxWidth: '500px',
                                    mx: { xs: 'auto', md: 0 },
                                    lineHeight: 1.5
                                }}>
                                    We re-engineered the service we built for secure business meetings to make it available for all.
                                </Typography>

                                <Button 
                                    component={Link} 
                                    to="/auth" 
                                    variant="contained" 
                                    disableElevation
                                    sx={{ 
                                        backgroundColor: '#1a73e8', 
                                        px: 4, 
                                        py: 1.5,
                                        borderRadius: '4px', // Squared corners like Google buttons
                                        fontSize: '1rem',
                                        textTransform: 'none',
                                        '&:hover': { backgroundColor: '#1765cc' }
                                    }}
                                >
                                    Get Started
                                </Button>
                            </Box>
                        </Grid>

                     
                        <Grid item xs={12} md={5} sx={{ 
                            display: { xs: 'none', md: 'flex' }, 
                            justifyContent: 'center' 
                        }}>
                            <Box 
                                component="img"
                                src='/mobile.png'
                                alt='App Illustration'
                                sx={{ 
                                    width: '100%', 
                                    maxWidth: '420px', 
                                    maxHeight: '65vh', 
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.05))'
                                }}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

         
            <Box sx={{ p: 3, textAlign: { xs: 'center', md: 'left' }, borderTop: '1px solid #f1f3f4' }}>
                <Container maxWidth="lg">
                    <Typography variant="body2" color="textSecondary">
                        Learn more about how we keep your 
                        <span style={{ color: '#1a73e8', cursor: 'pointer', marginLeft: '4px' }}>
                            meetings secure.
                        </span>
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}

export default Landing;