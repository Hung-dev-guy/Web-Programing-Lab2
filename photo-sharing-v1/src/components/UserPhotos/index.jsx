import React, { useEffect, useState } from "react";
import { 
  Typography, 
  Paper, 
  Box,
  Link,
  TextField,
  Button,
  Alert,
  Divider,
  Avatar
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import "./styles.css";
import { useParams, useNavigate } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import axios from "axios";

/**
 * Define UserPhotos, a React component of Project 4.
 */
function UserPhotos({ currentUser }) {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [photos, setPhotos] = useState([]);
    const [user, setUser] = useState(null);
    // Track the comment input text per photo: { [photo._id]: string }
    const [commentInputs, setCommentInputs] = useState({});
    // Track submission errors per photo: { [photo._id]: string }
    const [commentErrors, setCommentErrors] = useState({});
    // Track submitting state per photo
    const [submitting, setSubmitting] = useState({});

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
        });
    };

    const handleCommentUserClick = (commentUserId) => {
        navigate(`/users/${commentUserId}`);
    };

    const handleCommentChange = (photoId, value) => {
        setCommentInputs(prev => ({ ...prev, [photoId]: value }));
        // Clear error when user starts typing
        if (commentErrors[photoId]) {
            setCommentErrors(prev => ({ ...prev, [photoId]: '' }));
        }
    };

    const handleCommentSubmit = async (photoId) => {
        const commentText = (commentInputs[photoId] || '').trim();
        if (!commentText) {
            setCommentErrors(prev => ({ ...prev, [photoId]: 'Comment cannot be empty.' }));
            return;
        }

        setSubmitting(prev => ({ ...prev, [photoId]: true }));
        setCommentErrors(prev => ({ ...prev, [photoId]: '' }));

        try {
            const response = await axios.post(`/commentsOfPhoto/${photoId}`, {
                comment: commentText
            });

            // Update just this photo's data in state immediately
            const updatedPhoto = response.data;
            setPhotos(prev =>
                prev.map(p => (p._id === photoId ? updatedPhoto : p))
            );

            // Clear the input for this photo
            setCommentInputs(prev => ({ ...prev, [photoId]: '' }));
        } catch (err) {
            const errMsg =
                err.response && err.response.data
                    ? err.response.data
                    : 'Failed to add comment. Please try again.';
            setCommentErrors(prev => ({ ...prev, [photoId]: errMsg }));
        } finally {
            setSubmitting(prev => ({ ...prev, [photoId]: false }));
        }
    };

    const handleKeyDown = (e, photoId) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCommentSubmit(photoId);
        }
    };

    // Get initials for avatar
    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    // Generate a consistent color from a string (user ID)
    const avatarColor = (str) => {
        const colors = ['#5c6bc0', '#26a69a', '#ef5350', '#ab47bc', '#42a5f5', '#66bb6a', '#ffa726'];
        let hash = 0;
        for (let i = 0; i < (str || '').length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    if (!user) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Photos of {user.first_name} {user.last_name}
            </Typography>

            {photos.map((photo) => (
                <Paper
                    key={photo._id}
                    elevation={3}
                    sx={{ padding: 2, marginBottom: 4, borderRadius: 2, overflow: 'hidden' }}
                >
                    {/* Photo */}
                    <Box sx={{ marginBottom: 2, textAlign: 'center', borderRadius: 1, overflow: 'hidden', background: '#f0f0f0' }}>
                        <img 
                            src={`http://localhost:8082/images/${photo.file_name}`}
                            alt={photo.file_name}
                            style={{ 
                                width: '100%',
                                maxHeight: '420px',
                                objectFit: 'cover',
                                display: 'block'
                            }}
                        />
                    </Box>

                    {/* Photo Date/Time */}
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                        📅 {formatDateTime(photo.date_time)}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {/* Comments Section */}
                    <Box>
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 'bold', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                            <ChatBubbleOutlineIcon fontSize="small" />
                            {photo.comments && photo.comments.length > 0
                                ? `${photo.comments.length} Comment${photo.comments.length > 1 ? 's' : ''}`
                                : 'No comments yet'}
                        </Typography>

                        {photo.comments && photo.comments.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                {photo.comments.map((comment) => (
                                    <Box
                                        key={comment._id}
                                        sx={{
                                            display: 'flex',
                                            gap: 1.5,
                                            mb: 2,
                                            alignItems: 'flex-start'
                                        }}
                                    >
                                        {/* User Avatar */}
                                        <Avatar
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                fontSize: '0.75rem',
                                                bgcolor: avatarColor(comment.user?._id),
                                                cursor: 'pointer',
                                                flexShrink: 0,
                                                mt: 0.3
                                            }}
                                            onClick={() => handleCommentUserClick(comment.user?._id)}
                                        >
                                            {getInitials(comment.user?.first_name, comment.user?.last_name)}
                                        </Avatar>

                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                padding: '8px 12px',
                                                flex: 1,
                                                borderRadius: '0 8px 8px 8px',
                                                background: '#fafafa'
                                            }}
                                        >
                                            {/* Comment Header */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                <Link
                                                    component="button"
                                                    variant="subtitle2"
                                                    onClick={() => handleCommentUserClick(comment.user?._id)}
                                                    sx={{ fontWeight: 'bold', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                                >
                                                    {comment.user?.first_name} {comment.user?.last_name}
                                                </Link>
                                                <Typography variant="caption" color="textSecondary">
                                                    {formatDateTime(comment.date_time)}
                                                </Typography>
                                            </Box>

                                            {/* Comment Text */}
                                            <Typography variant="body2">
                                                {comment.comment}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {/* ── Add Comment Section ── */}
                        <Divider sx={{ my: 1.5 }} />
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                Add a comment as{' '}
                                <span style={{ color: '#1976d2' }}>
                                    {currentUser?.first_name} {currentUser?.last_name}
                                </span>
                            </Typography>

                            {commentErrors[photo._id] && (
                                <Alert severity="error" sx={{ mb: 1, py: 0.5 }}>
                                    {commentErrors[photo._id]}
                                </Alert>
                            )}

                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                                {/* Current user avatar */}
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        fontSize: '0.75rem',
                                        bgcolor: avatarColor(currentUser?._id),
                                        flexShrink: 0,
                                        mb: 0.5
                                    }}
                                >
                                    {getInitials(currentUser?.first_name, currentUser?.last_name)}
                                </Avatar>

                                <TextField
                                    fullWidth
                                    multiline
                                    maxRows={4}
                                    placeholder={`Comment on ${user.first_name}'s photo…`}
                                    variant="outlined"
                                    size="small"
                                    value={commentInputs[photo._id] || ''}
                                    onChange={(e) => handleCommentChange(photo._id, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, photo._id)}
                                    disabled={submitting[photo._id]}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2
                                        }
                                    }}
                                />

                                <Button
                                    variant="contained"
                                    color="primary"
                                    endIcon={<SendIcon />}
                                    onClick={() => handleCommentSubmit(photo._id)}
                                    disabled={submitting[photo._id]}
                                    sx={{
                                        flexShrink: 0,
                                        height: 40,
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        borderRadius: 2
                                    }}
                                >
                                    {submitting[photo._id] ? 'Posting…' : 'Post'}
                                </Button>
                            </Box>
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                                Press Enter to submit · Shift+Enter for a new line
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            ))}

            {photos.length === 0 && (
                <Typography color="textSecondary">No photos to display.</Typography>
            )}
        </Box>
    );
}

export default UserPhotos;
