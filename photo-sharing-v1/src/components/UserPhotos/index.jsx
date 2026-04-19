import React, { useEffect, useState } from "react";
import { 
  Typography, 
  Paper, 
  Box,
  Link
} from "@mui/material";

import "./styles.css";
import { useParams, useNavigate } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserPhotos, a React component of Project 4.
 */
function UserPhotos () {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [photos, setPhotos] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
      fetchModel(`/photosOfUser/${userId}`)
        .then(data => setPhotos(data))
        .catch(error => console.error('Error fetching photos:', error));
      
      fetchModel(`/user/${userId}`)
        .then(data => setUser(data))
        .catch(error => console.error('Error fetching user:', error));
    }, [userId]);
    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };
    const handleCommentUserClick = (commentUserId) => {
        navigate(`/users/${commentUserId}`);
    };

    if (!user) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom>
                Photos of {user.first_name} {user.last_name}
            </Typography>

            {photos.map((photo) => (
                <Paper key={photo._id} sx={{ padding: 2, marginBottom: 3 }}>
                    {/* Photo */}
                    <Box sx={{ marginBottom: 2, textAlign: 'center' }}>
                        <img 
                            src={`http://localhost:8082/images/${photo.file_name}`}
                            alt={photo.file_name}
                            style={{ 
                                width: '400px',
                                height: '400px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                            }}
                        />
                    </Box>

                    {/* Photo Date/Time */}
                    <Typography variant="subtitle2" color="textSecondary" sx={{ marginBottom: 2 }}>
                        {formatDateTime(photo.date_time)}
                    </Typography>

                    {/* Comments Section */}
                    {photo.comments && photo.comments.length > 0 && (
                        <Box>
                            <Typography variant="subtitle1" sx={{ marginTop: 2, marginBottom: 1 }}>
                                Comments:
                            </Typography>
                            {photo.comments.map((comment) => (
                                <Paper 
                                    key={comment._id} 
                                    sx={{ 
                                        padding: 1.5, 
                                        marginBottom: 1, 
                                        backgroundColor: '#f5f5f5' 
                                    }}
                                >
                                    {/* Comment Header */}
                                    <Box sx={{ marginBottom: 1 }}>
                                        <Link 
                                            component="button"
                                            variant="subtitle2"
                                            onClick={() => handleCommentUserClick(comment.user._id)}
                                            sx={{ marginRight: 1, fontWeight: 'bold' }}
                                        >
                                            {comment.user.first_name} {comment.user.last_name}
                                        </Link>
                                        <Typography 
                                            variant="caption" 
                                            color="textSecondary"
                                        >
                                            {formatDateTime(comment.date_time)}
                                        </Typography>
                                    </Box>

                                    {/* Comment Text */}
                                    <Typography variant="body2">
                                        {comment.comment}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>
                    )}

                    {(!photo.comments || photo.comments.length === 0) && (
                        <Typography variant="body2" color="textSecondary" sx={{ marginTop: 2 }}>
                            No comments yet.
                        </Typography>
                    )}
                </Paper>
            ))}
        </Box>
    );
}

export default UserPhotos;
