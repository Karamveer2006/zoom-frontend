import * as React from 'react';
import { 
    Box, Button, Card as MuiCard, FormControl, FormLabel, 
    TextField, Typography, styled, Avatar, Stack, 
    Snackbar, ToggleButton, ToggleButtonGroup, InputAdornment 
} from '@mui/material';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import { AuthContext } from '../contexts/AuthContext';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
}));

function Authentication() {
    const { handleRegister, handleLogin, router } = React.useContext(AuthContext);

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [fullname, setFullname] = React.useState("");
    const [buttonactive, setButtonactive] = React.useState(1); // Default to Login (1)
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [open, setOpen] = React.useState(false);

    const handleAuth = async () => {
        setError(""); 
        try {
            if (buttonactive === 1) {
                let result = await handleLogin(username, password);
                setMessage(result);
                setOpen(true);
                router("/home");
            } else {
                let result = await handleRegister(fullname, username, password);
                setMessage(result);
                setOpen(true);
                setButtonactive(1);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Something went wrong";
            setError(errorMsg);
        }
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            height: '100vh', 
            overflow: 'hidden',
            backgroundColor: '#f8f9fa' 
        }}>
          
            <Box sx={{ 
                flex: 1, 
                display: { xs: 'none', md: 'block' },
                backgroundImage: 'url("https://picsum.photos/1200/1000?grayscale&blur=1")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }} />

            
            <Box sx={{ 
                flex: { xs: 1, md: 0.6, lg: 0.4 }, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                p: 4 
            }}>
                <Card variant="outlined">
                    <Stack alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#1a73e8', width: 56, height: 56 }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography variant="h5" fontWeight="600" color="#202124">
                            {buttonactive === 1 ? "Welcome Back" : "Create Account"}
                        </Typography>
                    </Stack>

                    <ToggleButtonGroup
                        color="primary"
                        value={buttonactive}
                        exclusive
                        onChange={(e, val) => val !== null && setButtonactive(val)}
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <ToggleButton value={0} sx={{ textTransform: 'none' }}>Signup</ToggleButton>
                        <ToggleButton value={1} sx={{ textTransform: 'none' }}>Signin</ToggleButton>
                    </ToggleButtonGroup>

                    <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {buttonactive === 0 && (
                            <FormControl>
                                <FormLabel sx={{ mb: 1 }}>Full Name</FormLabel>
                                <TextField
                                    placeholder="Enter your name"
                                    required
                                    fullWidth
                                    variant="outlined"
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ fontSize: 20 }} /></InputAdornment>,
                                    }}
                                />
                            </FormControl>
                        )}

                        <FormControl>
                            <FormLabel sx={{ mb: 1 }}>Username</FormLabel>
                            <TextField
                                placeholder="username"
                                required
                                fullWidth
                                variant="outlined"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 20 }} /></InputAdornment>,
                                }}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel sx={{ mb: 1 }}>Password</FormLabel>
                            <TextField
                                name="password"
                                placeholder="••••••••"
                                type="password"
                                required
                                fullWidth
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </FormControl>

                        {error && (
                            <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
                                {error}
                            </Typography>
                        )}

                        <Button
                            onClick={handleAuth}
                            fullWidth
                            variant="contained"
                            size="large"
                            disableElevation
                            sx={{ 
                                mt: 1, 
                                py: 1.5, 
                                backgroundColor: '#1a73e8',
                                textTransform: 'none',
                                fontSize: '1rem' 
                            }}
                        >
                            {buttonactive === 0 ? "Sign Up" : "Sign In"}
                        </Button>
                    </Box>
                </Card>
            </Box>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                message={message}
            />
        </Box>
    );
}

export default Authentication;