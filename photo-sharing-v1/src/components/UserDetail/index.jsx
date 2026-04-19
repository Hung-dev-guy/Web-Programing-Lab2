import React, { useEffect, useState } from "react";
import { Typography, Button, Box, Paper, Grid } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserDetail, a React component of Project 4.
 */
function UserDetail() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
      fetchModel(`/user/${userId}`)
        .then(data => setUser(data))
        .catch(error => console.error('Error fetching user:', error));
    }, [userId]);

    const handleViewPhotos = () => {
        navigate(`/photos/${userId}`);
    };

    if (!user) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                {user.first_name} {user.last_name}
            </Typography>
            
            <Paper sx={{ padding: 2, marginBottom: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" color="textSecondary">
                            Location
                        </Typography>
                        <Typography variant="body1">
                            {user.location}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" color="textSecondary">
                            Occupation
                        </Typography>
                        <Typography variant="body1">
                            {user.occupation}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" color="textSecondary">
                            Description
                        </Typography>
                        <Typography variant="body1">
                            {user.description}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Button 
                variant="contained" 
                color="primary"
                onClick={handleViewPhotos}
            >
                View Photos
            </Button>
        </Box>
    );
}

export default UserDetail;
