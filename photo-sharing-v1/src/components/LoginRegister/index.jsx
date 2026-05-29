import React, { useState } from "react";
import { TextField, Button, Typography, Box, Paper, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginRegister({ setCurrentUser }) {
    const [isRegistering, setIsRegistering] = useState(false);
    
    // Login state
    const [loginName, setLoginName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    
    // Registration state
    const [regLoginName, setRegLoginName] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirmPassword, setRegConfirmPassword] = useState("");
    const [regFirstName, setRegFirstName] = useState("");
    const [regLastName, setRegLastName] = useState("");
    const [regLocation, setRegLocation] = useState("");
    const [regDescription, setRegDescription] = useState("");
    const [regOccupation, setRegOccupation] = useState("");
    
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (!loginName.trim()) {
            setError("Please enter a login name");
            return;
        }

        axios.post('/admin/login', {
            login_name: loginName.trim(),
            password: password.trim()
        })
        .then(response => {
            setCurrentUser(response.data);
            navigate(`/users/${response.data._id}`);
        })
        .catch(err => {
            console.error("Login failed:", err);
            const errMsg = err.response && err.response.data ? err.response.data : "Login failed";
            setError(errMsg);
        });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        
        // Validation: Required fields
        if (!regLoginName.trim()) {
            setError("Login name is required");
            return;
        }
        if (!regPassword.trim()) {
            setError("Password is required");
            return;
        }
        if (!regConfirmPassword.trim()) {
            setError("Please confirm your password");
            return;
        }
        if (!regFirstName.trim()) {
            setError("First name is required");
            return;
        }
        if (!regLastName.trim()) {
            setError("Last name is required");
            return;
        }
        
        // Validation: Password match
        if (regPassword.trim() !== regConfirmPassword.trim()) {
            setError("Passwords do not match");
            return;
        }
        
        // All validations passed, send to backend
        axios.post('/user', {
            login_name: regLoginName.trim(),
            password: regPassword.trim(),
            first_name: regFirstName.trim(),
            last_name: regLastName.trim(),
            location: regLocation.trim(),
            description: regDescription.trim(),
            occupation: regOccupation.trim()
        })
        .then(response => {
            setError("");
            alert("Registration successful! Please login with your credentials.");
            // Clear all input fields
            setRegLoginName("");
            setRegPassword("");
            setRegConfirmPassword("");
            setRegFirstName("");
            setRegLastName("");
            setRegLocation("");
            setRegDescription("");
            setRegOccupation("");
            // Switch back to login form
            setIsRegistering(false);
        })
        .catch(err => {
            console.error("Registration failed:", err);
            const errMsg = err.response && err.response.data ? err.response.data : "Registration failed";
            setError(errMsg);
        });
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 4,
                minHeight: "100vh"
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    width: "100%",
                    maxWidth: 500,
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3
                }}
            >
                <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Photo Sharing App
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ width: "100%" }}>
                        {error}
                    </Alert>
                )}

                {/* Login Form */}
                {!isRegistering && (
                    <>
                        <Typography variant="body1" align="center" color="textSecondary">
                            Please enter your login credentials
                        </Typography>
                        <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                label="Login Name"
                                variant="outlined"
                                fullWidth
                                value={loginName}
                                onChange={(e) => {
                                    setLoginName(e.target.value);
                                    setError("");
                                }}
                                autoFocus
                            />
                            <TextField
                                label="Password"
                                variant="outlined"
                                fullWidth
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                sx={{
                                    marginTop: 1,
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    padding: "10px 0"
                                }}
                            >
                                Login
                            </Button>
                            <Box sx={{ textAlign: "center", marginTop: 2 }}>
                                <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 1 }}>
                                    Don't have an account?
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    fullWidth
                                    onClick={() => {
                                        setIsRegistering(true);
                                        setError("");
                                    }}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: "bold",
                                        padding: "10px 0"
                                    }}
                                >
                                    Register Me
                                </Button>
                            </Box>
                        </Box>
                    </>
                )}

                {/* Registration Form */}
                {isRegistering && (
                    <>
                        <Typography variant="body1" align="center" color="textSecondary">
                            Create a new account
                        </Typography>
                        <Box component="form" onSubmit={handleRegister} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                label="Login Name"
                                variant="outlined"
                                fullWidth
                                value={regLoginName}
                                onChange={(e) => setRegLoginName(e.target.value)}
                                autoFocus
                                required
                            />
                            <TextField
                                label="First Name"
                                variant="outlined"
                                fullWidth
                                value={regFirstName}
                                onChange={(e) => setRegFirstName(e.target.value)}
                            />
                            <TextField
                                label="Last Name"
                                variant="outlined"
                                fullWidth
                                value={regLastName}
                                onChange={(e) => setRegLastName(e.target.value)}
                            />
                            <TextField
                                label="Password"
                                variant="outlined"
                                fullWidth
                                type="password"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                            />
                            <TextField
                                label="Confirm Password"
                                variant="outlined"
                                fullWidth
                                type="password"
                                value={regConfirmPassword}
                                onChange={(e) => setRegConfirmPassword(e.target.value)}
                            />
                            <TextField
                                label="Location"
                                variant="outlined"
                                fullWidth
                                value={regLocation}
                                onChange={(e) => setRegLocation(e.target.value)}
                            />
                            <TextField
                                label="Description"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={2}
                                value={regDescription}
                                onChange={(e) => setRegDescription(e.target.value)}
                            />
                            <TextField
                                label="Occupation"
                                variant="outlined"
                                fullWidth
                                value={regOccupation}
                                onChange={(e) => setRegOccupation(e.target.value)}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                sx={{
                                    marginTop: 2,
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    padding: "10px 0"
                                }}
                            >
                                Register Me
                            </Button>
                            <Button
                                variant="text"
                                color="primary"
                                fullWidth
                                onClick={() => {
                                    setIsRegistering(false);
                                    setError("");
                                }}
                                sx={{
                                    textTransform: "none",
                                    padding: "10px 0"
                                }}
                            >
                                Back to Login
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>
        </Box>
    );
}

export default LoginRegister;
