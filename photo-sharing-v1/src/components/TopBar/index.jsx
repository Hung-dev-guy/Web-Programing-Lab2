import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { useLocation, useParams } from "react-router-dom";

import "./styles.css";
import models from "../../modelData/models";

/**
 * Define TopBar, a React component of Project 4.
 */
function TopBar () {
    const location = useLocation();
    const { userId } = useParams();
    let contextText = "";

    // Simplified context determination based on route
    if (userId) {
        const user = models.userModel(userId);
        if (user) {
            if (location.pathname.startsWith("/photos/")) {
                contextText = `Photos of ${user.first_name} ${user.last_name}`;
            } else if (location.pathname.startsWith("/users/")) {
                contextText = `${user.first_name} ${user.last_name}`;
            }
        }
    }

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" color="inherit">
              Manh Hung Nguyen
            </Typography>
            {contextText && (
              <Typography variant="h6" color="inherit">
                {contextText}
              </Typography>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    );
}

export default TopBar;
