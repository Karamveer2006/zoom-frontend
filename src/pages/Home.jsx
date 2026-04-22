import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import { 
    TextField, 
    Button, 
    AppBar, 
    Toolbar, 
    Typography, 
    Container, 
    Box, 
    Grid, 
    InputAdornment 
} from '@mui/material';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../contexts/AuthContext';

function Home() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");

    const {addToUserHistory }=useContext(AuthContext)

    const handleJoinVideoCall = async() => {
        await addToUserHistory(meetingCode);
        if (meetingCode.trim()) navigate(`/${meetingCode}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth");
    };

    return (
        
        <Box sx={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden', 
            backgroundColor: '#fff' 
        }}>
            
            
            <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #dadce0' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VideoCallIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
                        <Typography variant="h6" sx={{ color: '#5f6368', fontWeight: 500 }}>
                            My Video Call
                        </Typography>
                    </Box>
                    <Box>
                        <Button onClick={()=>{
                            navigate("/history");
                        }} startIcon={<HistoryIcon />} sx={{ color: '#5f6368', mr: 1 }}>History</Button>
                        <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            
            <Box component="main" sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                px: 2
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={2} alignItems="center">
                        
                      
                        <Grid item xs={12} md={7}>
                            <Box sx={{ pr: { md: 6 }, textAlign: { xs: 'center', md: 'left' } }}>
                                <Typography variant="h2" sx={{ 
                                    fontWeight: 400, 
                                    fontSize: { xs: '2rem', md: '3rem', lg: '3.5rem' }, // Fluid font sizing
                                    color: '#202124',
                                    mb: 2,
                                    lineHeight: 1.1
                                }}>
                                    Premium video meetings. <br />
                                    Now free for everyone.
                                </Typography>
                                <Typography variant="h6" sx={{ 
                                    color: '#5f6368', 
                                    mb: 4, 
                                    fontWeight: 300,
                                    maxWidth: '480px',
                                    mx: { xs: 'auto', md: '0' },
                                    fontSize: { xs: '1rem', md: '1.25rem' }
                                }}>
                                    Connect, collaborate, and celebrate from anywhere with VideoConnect.
                                </Typography>

                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: { xs: 'column', sm: 'row' }, 
                                    gap: 2,
                                    justifyContent: { xs: 'center', md: 'flex-start' }
                                }}>
                                    <TextField
                                        placeholder="Enter a code"
                                        variant="outlined"
                                        value={meetingCode}
                                        onChange={(e) => setMeetingCode(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <KeyboardIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ width: { xs: '100%', sm: '250px' } }}
                                    />
                                    <Button 
                                        variant="contained" 
                                        disableElevation
                                        onClick={handleJoinVideoCall}
                                        disabled={!meetingCode}
                                        sx={{ height: '56px', px: 4, backgroundColor: '#1a73e8' }}
                                    >
                                        Join
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>

                       
                        <Grid item xs={12} md={5} sx={{ 
                            display: { xs: 'none', md: 'flex' }, // Hide image on very small mobile screens to prevent scroll
                            justifyContent: 'center' 
                        }}>
                            <Box 
                                component="img"
                                src="/logo3.png"
                                alt="Logo"
                                sx={{ 
                                    width: '100%', 
                                    maxWidth: '400px', 
                                    height: 'auto',
                                    objectFit: 'contain'
                                }}
                            />
                        </Grid>

                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}

export default withAuth(Home);