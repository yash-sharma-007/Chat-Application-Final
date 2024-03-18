import React, { useState } from 'react';
import { Button, TextField, Typography, Box } from '@mui/material';

const SignUp = ({ handleSignUp, switchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSignUp({ name, email, password });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: 'auto',
                width: '50%',
                border: '1px solid #ccc',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
            }}
        >
            <Typography variant="h4" sx={{ marginBottom: '20px' }}>Sign Up</Typography>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <TextField
                    label="Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    sx={{ marginBottom: '20px' }}
                />
                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    sx={{ marginBottom: '20px' }}
                />
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    sx={{ marginBottom: '20px' }}
                />
                <Button variant="contained" type="submit" fullWidth>Sign Up</Button>
            </form>
            <Typography sx={{ marginTop: '20px' }}>
                If you already signed up,{' '}
                <Button variant="outlined" onClick={switchToLogin}>
                    Login
                </Button>
            </Typography>
        </Box>
    );
};

export default SignUp;
