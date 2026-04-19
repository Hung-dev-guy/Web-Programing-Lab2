import React, { useEffect, useState } from "react";
import { 
  Typography, 
  Paper, 
  Box,
  Divider,
  Grid
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function UserComments() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchModel(`/user/${userId}`)
            .then(data => setUser(data))
            .catch(error => console.error('Error fetching user:', error));

        fetchModel(`/commentsOfUser/${userId}`)
            .then(data => setComments(data))
            .catch(error => console.error('Error fetching user comments:', error));
    }, [userId]);

    const handlePhotoClick = (photoUserId) => {
        navigate(`/photos/${photoUserId}`);
    };

    if (!user) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom>
                Comments by {user.first_name} {user.last_name}
            </Typography>
            <Divider sx={{ marginBottom: 2 }} />

            {comments.length === 0 ? (
                <Typography variant="body1">This user has not authored any comments.</Typography>
            ) : (
                comments.map((comment) => (
                    <Paper 
                        key={comment._id} 
                        sx={{ 
                            padding: 2, 
                            marginBottom: 2, 
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: '#f9f9f9'
                            }
                        }}
                        onClick={() => handlePhotoClick(userId)}
                    >
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={2}>
                                <img 
                                    src={`http://localhost:8082/images/${comment.photo_file_name}`}
                                    alt={comment.photo_file_name}
                                    style={{ 
                                        width: '100%',
                                        height: 'auto',
                                        maxHeight: '100px',
                                        objectFit: 'cover',
                                        borderRadius: '4px'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={10}>
                                <Typography variant="body1">
                                    {comment.comment}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    On: {new Date(comment.date_time).toLocaleString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                ))
            )}
        </Box>
    );
}

export default UserComments;
