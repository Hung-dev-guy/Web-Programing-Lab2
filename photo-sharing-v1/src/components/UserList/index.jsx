import React, { useEffect, useState } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserList, a React component of Project 4.
 */
function UserList () {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
      fetchModel('/user/list')
        .then(data => setUsers(data))
        .catch(error => console.error('Error fetching users:', error));
    }, []);

    const handleUserClick = (userId) => {
      navigate(`/users/${userId}`);
    };

    const handleCommentBubbleClick = (e, userId) => {
      e.stopPropagation(); // Prevent navigating to user detail
      navigate(`/comments/${userId}`);
    };

    return (
      <div>
        <Typography variant="h6" sx={{ padding: 2 }}>
          Users
        </Typography>
        <Divider />
        <List component="nav">
          {users.map((item) => (
            <div key={item._id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleUserClick(item._id)}
                  style={{ cursor: "pointer", display: 'flex', justifyContent: 'space-between' }}
                >
                  <ListItemText 
                    primary={`${item.first_name} ${item.last_name}`}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* Photo Count Bubble (Green) */}
                    <Box 
                      sx={{ 
                        backgroundColor: '#4caf50', 
                        color: 'white', 
                        borderRadius: '12px', 
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        minWidth: '20px',
                        textAlign: 'center'
                      }}
                    >
                      {item.photoCount || 0}
                    </Box>
                    
                    {/* Comment Count Bubble (Red) */}
                    <Box 
                      onClick={(e) => handleCommentBubbleClick(e, item._id)}
                      sx={{ 
                        backgroundColor: '#f44336', 
                        color: 'white', 
                        borderRadius: '12px', 
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        minWidth: '20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#d32f2f'
                        }
                      }}
                    >
                      {item.commentCount || 0}
                    </Box>
                  </Box>
                </ListItemButton>
              </ListItem>
              <Divider />
            </div>
          ))}
        </List>
      </div>
    );
}

export default UserList;
