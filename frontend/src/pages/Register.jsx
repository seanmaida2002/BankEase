import { Form, Link } from 'react-router-dom'
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import { checkValidAge, checkValidEmail, checkValidName, checkValidPassword, checkDateOfBirth } from '../helpers';
import ErrorIcon from '@mui/icons-material/Error';
import Alert from '@mui/material/Alert';
import { AlertTitle, FormControl, Stack } from "@mui/material";
import { styled } from '@mui/material/styles'
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import Button from '@mui/material/Button';

export default function Register() {
  const [error, setError] = useState({});
  const [pwMatch, setPWMatch] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [registerFail, setRegisterFail] = useState(false);

  const convertDate = (date) => {
    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
      throw 'Invalid date format';
    }
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];

    return `${month}/${day}/${year}`;
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    let { firstName, lastName, dateOfBirth, email, password, confirmPassword, totalBalance } = e.target.elements;
    dateOfBirth = convertDate(dateOfBirth.value.trim());
    let errors = {};
    setError({});
    setPWMatch('');
    if (password.value !== confirmPassword.value) {
      setPWMatch("Passwords Do Not Match");
      return false;
    } else {
      setPWMatch('');
    }

    try {
      const emailCheck = await axios.post('http://localhost:3000/user/check-email', { email: email.value.trim() }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (emailCheck.data.error) {
        errors.email = emailCheck.data.error;
      }

      let firstNameError = checkValidName(firstName.value.trim(), 'First Name');
      if (firstNameError !== firstName.value.trim()) {
        errors.firstName = firstNameError;
      }
      let lastNameError = checkValidName(lastName.value.trim(), 'Last Name');
      if (lastNameError !== lastName.value.trim()) {
        errors.lastName = lastNameError;
      }
      let dateOfBirthError = checkDateOfBirth(dateOfBirth, "Date of Birth");
      if (dateOfBirthError !== dateOfBirth) {
        errors.dateOfBirth = dateOfBirthError;
      }
      let emailError = checkValidEmail(email.value.trim(), "Email");
      if (emailError !== email.value.trim()) {
        errors.email = emailError;
      }
      let validAge = checkValidAge(dateOfBirth, "Date of Birth");
      if (validAge !== true) {
        errors.validAge = validAge;
      }
      let validPassword = checkValidPassword(password.value.trim(), "Password");
      if (validPassword !== true) {
        errors.validPassword = validPassword;
      }

      if (Object.keys(errors).length > 0) {
        setError(errors);
        setRegisterFail(true);
        return;
      }
      const response = await axios.post('http://localhost:3000/auth/register', {
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        dateOfBirth: dateOfBirth,
        email: email.value.trim(),
        password: password.value.trim(),
        confirmPassword: confirmPassword.value.trim(),
        totalBalance: parseFloat(totalBalance.value),
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
      let errors = { error: e.response.data.error }
      setError(errors);
      setRegisterFail(true);
    }
  };

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

  const RegisterContainer = styled(Stack)(({ theme }) => ({
    minHeight: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
      ...theme.applyStyles('dark', {
        backgroundImage:
          'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
      }),
    },
  }));

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAF3E0] px-4">
      <RegisterContainer>
        <Card variant="outlined">
          {registerFail && (
            <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error" className="mb-4">
              <AlertTitle>Registration Failed</AlertTitle>
              {error.error && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error.error}</h4>}
              {error.firstName && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error.firstName}</h4>}
              {error.lastName && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error.lastName}</h4>}
              {error.dateOfBirth && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error.dateOfBirth}</h4>}
              {error.validAge && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error.validAge}</h4>}
              {error.email && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error.email}</h4>}
              {error.validPassword && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error.validPassword}</h4>}
              {pwMatch && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{pwMatch}</h4>}
            </Alert>
          )}
          <Typography component="h1" variant='h4' className="text-2xl font-bold mb-6 text-center text-[#1A3B5D]">
            Register for BankEase
          </Typography>
          <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} >
            <FormControl>
              <FormLabel htmlFor='FirstName' style={{color: '#1A3B5D'}}>First Name</FormLabel>
              <TextField
                name="firstName"
                required
                fullWidth
                id="firstName"
                placeholder='First Name'
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='LastName' style={{color: '#1A3B5D'}}>Last Name</FormLabel>
              <TextField
                name="lastName"
                required
                fullWidth
                id='lastName'
                placeholder='Last Name'
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='dateOfBirh' style={{color: '#1A3B5D'}}>Date Of Birth</FormLabel>
              <TextField name='dateOfBirth' type='date' required fullWidth id='dateOfBith'/>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='email' style={{color: '#1A3B5D'}}>Email</FormLabel>
              <TextField 
              name="email"
              required
              fullWidth
              id='email'
              placeholder='example@email.com'
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='password' style={{color: '#1A3B5D'}}>Password</FormLabel>
              <TextField name='password' type='password' required fullWidth id='password' placeholder='••••••'/>
            </FormControl>
            <p style={{ fontSize: '0.75rem' }}>Password must be at least 8 characters,  contain at least one capital letter, at least one digit, and at least one special character.</p>
            <FormControl>
              <FormLabel htmlFor='confirmPassword' style={{color: '#1A3B5D'}}>Confirm Password</FormLabel>
              <TextField name='confirmPassword' type='password' required fullWidth id='confirmPassword' placeholder='••••••'/>
            </FormControl>
            <FormControl>
              <FormLabel style={{color: '#1A3B5D'}}>Total Balance</FormLabel>
              <TextField name='totalBalance' type='number' required fullWidth placeholder='$1000.00' />
            </FormControl>
            <Button type='submit' fullWidth variant='contained'  style={{ backgroundColor: '#1A3B5D' }}>Register</Button>
            <p className="mt-4 text-sm text-center">
              Already have an account? <Link to="/" id='register-logIn' style={{color:'#1A3B5D'}}>Log In</Link>
            </p>
          </Box>
        </Card>
      </RegisterContainer>
    </div>
  );
}
