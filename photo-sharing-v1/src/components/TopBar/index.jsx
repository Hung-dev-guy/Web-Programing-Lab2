import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import "./styles.css";

/**
 * Define TopBar, a React component of Project 4.
 */
function TopBar ({ currentUser, setCurrentUser }) {
    const location = useLocation();
    const { userId } = useParams();
    const navigate = useNavigate();
    const [contextUser, setContextUser] = useState(null);

    // Fetch user info whenever the userId param changes
    useEffect(() => {
        if (userId && currentUser) {
            axios.get(`/user/${userId}`)
                .then(res => setContextUser(res.data))
                .catch(() => setContextUser(null));
        } else {
            setContextUser(null);
        }
    }, [userId, currentUser]);

    let contextText = "";
    if (contextUser) {
        if (location.pathname.startsWith("/photos/")) {
            contextText = `Photos of ${contextUser.first_name} ${contextUser.last_name}`;
        } else if (location.pathname.startsWith("/users/")) {
            contextText = `${contextUser.first_name} ${contextUser.last_name}`;
        }
    }

    const handleLogout = () => {
        axios.post('/admin/logout')
            .then(() => {
                setCurrentUser(null);
                navigate('/login');
            })
            .catch(err => {
                console.error("Logout failed:", err);
                // Even if backend logout fails (e.g. session expired), clear local user state and redirect
                setCurrentUser(null);
                navigate('/login');
            });
    };

    const handleAddPhoto = () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          axios.post('/photos/new', formData, {
            headers: {'Content-Type': 'multipart/form-data' }
          }).then(() => {
            alert('Photo uploaded successfully!');
            navigate(`/photos/${currentUser._id}`);          
          }).catch(err => {
            console.error("Upload failed:", err);
            alert('Failed to upload photo');
          });
        }
      };
      fileInput.click();
    };  

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" color="inherit">
                Manh Hung Nguyen
              </Typography>
              {currentUser ? (
                <Typography variant="subtitle2" sx={{ opacity: 0.8, fontStyle: 'italic' }}>
                  Hi {currentUser.first_name}
                </Typography>
              ) : (
                <Typography variant="subtitle2" sx={{ opacity: 0.8, fontStyle: 'italic' }}>
                  Please Login
                </Typography>
              )}
            </Box>
            
            {contextText && (
              <Typography variant="h6" color="inherit">
                {contextText}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentUser && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleAddPhoto}
                  sx={{ 
                    textTransform: 'none', 
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Add Photo
                </Button>
              )}

              {currentUser && (
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  onClick={handleLogout}
                  sx={{ 
                    textTransform: 'none', 
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Logout
                </Button>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    );
}

export default TopBar;
