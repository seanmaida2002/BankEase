import Layout from "../components/Layout";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { checkDateOfBirth, checkValidEmail, checkValidName, checkValidAge } from "../helpers";
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import { AlertTitle, FormControl } from "@mui/material";
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [email, setEmail] = useState(user.email || '');
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || '');
  const [error, setError] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateFail, setUpdateFail] = useState(false);
  const [previousData, setPreviousData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    dateOfBirth: user.dateOfBirth
  });

  const convertDateOne = (date) => {
    //YYYY-MM-DD
    if(!date){
      return '';
    }
    const dateParts = date.split('/');
    if (dateParts.length !== 3) {
      throw 'Invalid date format';
    }
    const month = dateParts[0];
    const day = dateParts[1];
    const year = dateParts[2];

    return `${year}-${month}-${day}`;
  }

  const converDateTwo = (date) => {
    //MM/DD/YYYY
    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
      throw 'Invalid date format';
    }
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];

    return `${month}/${day}/${year}`;
  }

  useEffect(() => {
    setDateOfBirth(convertDateOne(user.dateOfBirth));
  }, []);


  const handleEditProfile = async (e) => {
    e.preventDefault();
    setError({});
    let userData = null;
    let id = null;
    try {
      userData = await axios.get(`http://localhost:3000/user/email/${user.email.trim()}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      id = userData.data._id;

    } catch (e) {
      console.log(e);
    }

    try {
      let errors = {};
      let firstNameError = checkValidName(firstName, "First Name");
      if (firstNameError !== firstName) {
        errors.firstname = firstNameError;
      }
      let lastNameError = checkValidName(lastName, "Last Name");
      if (lastNameError !== lastName) {
        errors.lastName = lastNameError;
      }
      let emailError = checkValidEmail(email, "Email");
      if (emailError !== email) {
        errors.email = emailError;
      }
      let dateOfBirthError = checkDateOfBirth(converDateTwo(dateOfBirth), 'dateOfBirth');
      if (dateOfBirthError !== converDateTwo(dateOfBirth)) {
        errors.dateOfBirth = dateOfBirthError;
      }
      let validAge = checkValidAge(converDateTwo(dateOfBirth), "Date of Birth");
      if (validAge !== true) {
        errors.validAge = validAge;
      }
      if (Object.keys(errors).length > 0) {
        setError(errors);
        setFirstName(previousData.firstName || '');
        setLastName(previousData.lastName || '');
        setEmail(previousData.email || '');
        setDateOfBirth(previousData.dateOfBirth ? convertDateOne(previousData.dateOfBirth) : '');
        setUpdateFail(true);
        setTimeout(() => setUpdateFail(false), 4500);
        return;
      }

      const updateUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        dateOfBirth: converDateTwo(dateOfBirth)
      };
      setPreviousData(firstName, lastName, email, dateOfBirth);

      const response = await axios.patch(`http://localhost:3000/user/${id}`, updateUser, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        localStorage.setItem('user', JSON.stringify(response.data));
        setPreviousData({firstName, lastName, email, dateOfBirth: converDateTwo(dateOfBirth)});
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (e) {
      console.log(e);
      setUpdateFail(true);
      setTimeout(() => setUpdateFail(false), 3000);
    }

  };

  return (
    <Layout>
      <div style={{ padding: '0.25rem' }}>
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <Box component="form" onSubmit={handleEditProfile} noValidate sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
          <FormControl>
            <FormLabel htmlFor="firstName" style={{ color: '#1A3B5D' }}>First Name</FormLabel>
            <TextField id='firstName'
              fullWidth
              variant="outlined"
              style={{ backgroundColor: 'white' }}
              value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="lastName" style={{ color: '#1A3B5D' }}>Last Name</FormLabel>
            <TextField id='LastName'
              fullWidth
              variant="outlined"
              style={{ backgroundColor: 'white' }}
              value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="dateOfBirth" style={{ color: '#1A3B5D' }}>Date of Birth</FormLabel>
            <TextField id='dateOfBirth'
              fullWidth
              type="date"
              variant="outlined"
              style={{ backgroundColor: 'white' }}
              value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="email" style={{ color: '#1A3B5D' }}>Email</FormLabel>
            <TextField id='email'
              fullWidth
              type="email"
              variant="outlined"
              style={{ backgroundColor: 'white' }}
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button type="submit" onClick={handleEditProfile} variant="contained" style={{ backgroundColor: '#1A3B5D' }}>
              Save Changes
            </Button>
          </div>
          {updateSuccess && (
            <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" className="mb-4">
              Profile Updated Successfully
            </Alert>
          )}
          {updateFail && (
            <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error" className="mb-4">
              <AlertTitle>Failed to Update Profile</AlertTitle>
              {error.firstName && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error.firstName}</h4>}
              {error.lastName && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error.lastName}</h4>}
              {error.dateOfBirth && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error.dateOfBirth}</h4>}
              {error.validAge && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error.validAge}</h4>}
              {error.email && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error.email}</h4>}
            </Alert>
          )}
        </Box>
      </div>
    </Layout>
  );
}
