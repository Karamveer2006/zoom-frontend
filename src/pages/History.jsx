import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    Container, 
    Typography, 
    Card, 
    CardContent, 
    IconButton, 
    Box, 
    Grid, 
    Divider 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import CodeIcon from '@mui/icons-material/Code';

function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch (error) {
                console.log(error);
            }
        };
        fetchHistory();
    }, [getHistoryOfUser]);

    // Function to format the date into something pretty
    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="md">
                {/* Header Area */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton 
                        onClick={() => navigate("/home")} 
                        sx={{ mr: 2, backgroundColor: 'white', '&:hover': { backgroundColor: '#e3f2fd' } }}
                    >
                        <ArrowBackIcon color="primary" />
                    </IconButton>
                    <Typography variant="h4" component="h1" fontWeight="600">
                        Meeting History
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* List Area */}
                {meetings.length > 0 ? (
                    <Grid container spacing={2}>
                        {meetings.map((e, index) => (
                            <Grid item xs={12} key={index}>
                                <Card elevation={1} sx={{ borderRadius: 2, transition: '0.3s', '&:hover': { boxShadow: 4 } }}>
                                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ p: 1, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                                                <CodeIcon color="primary" />
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    Code: {e.meetingCode}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <EventIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {formatDate(e.date)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Typography variant="caption" color="text.disabled">
                                            Completed
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    // Empty State
                    <Box sx={{ textAlign: 'center', mt: 10 }}>
                        <Typography variant="h6" color="text.secondary">
                            No meetings found in your history.
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                            Join a meeting to see it appear here!
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default History;