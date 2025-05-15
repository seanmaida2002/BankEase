import { Link } from 'react-router-dom';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import ErrorIcon from '@mui/icons-material/Error';
import Alert from '@mui/material/Alert';
import { AlertTitle, FormControl } from "@mui/material";
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles'
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import Button from '@mui/material/Button';

export default function Login() {
  const [error, setError] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [loginFail, setLoginFail] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    let { email, password } = e.target.elements;
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email: email.value.trim(),
        password: password.value.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        localStorage.setItem('user', JSON.stringify(response.data));
        setRedirect(true);
      }
    } catch (e) {
      let errors = e.response.data.error;
      setError(errors);
      setLoginFail(true);
    }
  }

  if (redirect) {
    return <Navigate to='/dashboard' replace={true} />
  }

  const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    [theme.breakpoints.up('sm')]: {
      maxWidth: '450px',
    },
    boxShadow:
      'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    ...theme.applyStyles('dark', {
      boxShadow:
        'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
  }));

  const SignInContainer = styled(Stack)(({ theme }) => ({
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
    minHeight: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(4),
    },
    '&::before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      zIndex: -1,
      inset: 0,
      backgroundImage:
        'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
      backgroundRepeat: 'no-repeat',
      ...theme.applyStyles('light', {
        backgroundImage:
          'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
      }),
    },
  }))

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAF3E0] px-4">
      <SignInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          {loginFail && (
            <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error" className="mb-4">
              <AlertTitle>Log In Failed</AlertTitle>
              {error && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error}</h4>}
            </Alert>
          )}
          <Typography component="h1" variant='h4' className="text-2xl font-bold mb-6 text-center text-[#1A3B5D]">
            BankEase Log In
          </Typography>
          <Box component="form" onSubmit={handleLogin} noValidate sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
            <FormControl>
              <FormLabel htmlFor='email' style={{ color: '#1A3B5D' }}>Email</FormLabel>
              <TextField
                id="email"
                name="email"
                placeholder='example@email.com'
                autoFocus
                required
                fullWidth
                variant="outlined"
                className="w-full mb-4 p-2 border border-gray-300 rounded"
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='password' style={{ color: '#1A3B5D' }}>Password</FormLabel>
              <TextField
                name='password'
                className="w-full mb-6 p-2 border border-gray-300 rounded"
                placeholder='••••••'
                type='password'
                id="password"
                autoFocus
                required
                fullWidth
                variant='outlined'
              />
            </FormControl>
            <Button type='submit' fullWidth variant='contained' style={{ backgroundColor: '#1A3B5D' }}>
              Log In
            </Button>
            <p className="mt-4 text-sm text-center text-gray-700">
              Don’t have an account?{" "}
              <Link to="/register" className="text-[#1A3B5D] font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </Box>
        </Card>
      </SignInContainer>
    </div>
  )
}
