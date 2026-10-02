import { useState } from "react";
import {Alert, Box, Button, Paper, TextField, Typography} from '@mui/material'
import { useAuth } from "../../context/AuthContext.jsx";
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

function LoginForm(){
    const {login} = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)


    const handleSubmit = async (event) => {
        event.preventDefault()
        setError(null)
        try {
            await login(username, password)
        } catch (error) {
            if(error.response?.status === 401) {
                setError('incorrect username or password')
            } else {
                setError('An unexpected error occurred')
            }
        }
    }

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            px: 2,
            backgroundColor: 'background.default',
            backgroundImage: 'radial-gradient(circle at 12% 12%, rgba(180, 35, 50, 0.1), transparent 34%), linear-gradient(150deg, #fff8f7 0%, #ffffff 68%, #f7eeee 100%)',
        }}>
            <Paper component="form" onSubmit={handleSubmit} variant="outlined" sx={{p: 4, width: 320, borderTop: '4px solid', borderTopColor: 'primary.main'}}>
                <MedicalServicesIcon sx={{mr : 2}}/>
                <Typography variant="h6" gutterBottom>
                    MedFlow Login
                </Typography>
                {error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}
                <TextField
                    label="Username"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}/>
                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(event => setPassword(event.target.value))}/>
                <Button type="submit" variant="contained" fullWidth sx={{mt:2}}>
                    Log In
                </Button>
            </Paper>
        </Box>
    );
}

export default LoginForm;