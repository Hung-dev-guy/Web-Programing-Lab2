import './App.css';

import React, { useState, useEffect } from "react";
import { Grid, Paper } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserComments from "./components/UserComments";
import LoginRegister from "./components/LoginRegister";

const AppContent = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Axios interceptor to catch 401 globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          setCurrentUser(null);
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TopBar currentUser={currentUser} setCurrentUser={setCurrentUser} />
        </Grid>
        <div className="main-topbar-buffer" />
        
        {currentUser && (
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              <UserList currentUser={currentUser} />
            </Paper>
          </Grid>
        )}
        
        <Grid item sm={currentUser ? 9 : 12}>
          <Paper className="main-grid-item">
            <Routes>
              <Route
                path="/login"
                element={
                  currentUser ? (
                    <Navigate to={`/users/${currentUser._id}`} />
                  ) : (
                    <LoginRegister setCurrentUser={setCurrentUser} />
                  )
                }
              />
              <Route
                path="/users/:userId"
                element={
                  currentUser ? (
                    <UserDetail currentUser={currentUser} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/photos/:userId"
                element={
                  currentUser ? (
                    <UserPhotos currentUser={currentUser} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/comments/:userId"
                element={
                  currentUser ? (
                    <UserComments currentUser={currentUser} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/users"
                element={
                  currentUser ? (
                    <UserList currentUser={currentUser} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/"
                element={
                  currentUser ? (
                    <Navigate to={`/users/${currentUser._id}`} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
            </Routes>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

const App = (props) => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
