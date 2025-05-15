import Layout from "../components/Layout"
import { useState, useEffect } from "react"
import Button from '@mui/material/Button';
import { TextField } from "@mui/material";
import FormLabel from '@mui/material/FormLabel';
import { AlertTitle, FormControl } from "@mui/material";
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CheckIcon from '@mui/icons-material/Check';
import { checkBalanceALert } from "../helpers.js";
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';

export default function Alerts() {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [existingBalance, setExistingBalance] = useState(null);
  const [balance, setBalance] = useState('');
  const [alertSucess, setAlertSucess] = useState(false);
  const [alertFail, setAlertFail] = useState(false);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchBalanceAlert = async () => {
      try {
        const userData = await axios.get(`http://localhost:3000/user/email/${user.email.trim()}`);
        const userId = userData.data._id;

        const response = await axios.get(`http://localhost:3000/alerts/balanceAlert/${userId}`);
        if (response.status === 200) {
          setExistingBalance(response.data.balance);

        }
      } catch (error) {
        console.error("No existing balance alert or failed to fetch it:", error);
        setExistingBalance(null);
      }
    };

    fetchBalanceAlert();
  }, [user.email]);

  const handleAlerts = (alertType) => {
    setSelectedAlert(alertType === selectedAlert ? null : alertType);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertSucess(false);
    setAlertFail(false);
    setError('');

    const balanceError = checkBalanceALert(balance);
    if (balanceError !== balance) {
      setError(balanceError);
      setAlertFail(true);
      return;
    }
    try {
      const userData = await axios.get(`http://localhost:3000/user/email/${user.email.trim()}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const userId = userData.data._id;
      const response = await axios.post('http://localhost:3000/alerts/balanceAlert', {
        userId: userId,
        balance: balance,
        alertType: "balanceAlert"
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        setAlertSucess(true);
        setBalance('');
        setExistingBalance(response.data.balance);
        setTimeout(() => setAlertSucess(false), 2000);
      } else {
        setAlertFail(true);
        setError('Failed to set alert. Please try again');
      }
    } catch (e) {
      console.log(e);
      setAlertFail(true);
      setError('Failed to set alert. Please try again');
    }

  }

  return (
    <Layout>
      <div style={{ padding: '1.5rem' }}>
        <Button onClick={() => handleAlerts('balance')}
          variant="contained"
          sx={{
            backgroundColor: selectedAlert === 'balance' ? 'white' : '#1A3B5D',
            color: selectedAlert === 'balance' ? '#1A3B5D' : 'white',
            borderColor: '#1A3B5D',
            '&hover': {
              backgroundColor: selectedAlert === 'balance' ? '#1A3B5D' : '#f5f5f5', borderColor: '#1A3B5D'
            }
          }}
        >
          Balance
        </Button>
        {existingBalance !== null && !isNaN(Number(existingBalance)) && (
          <Alert severity="info" style={{ marginTop: "1rem" }}>
            You have a balance alert set for: ${parseFloat(existingBalance).toFixed(2)}
          </Alert>
        )}

        {selectedAlert === 'balance' && (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
            <p style={{ fontSize: '15pt' }}>Set an alert when your balance goes below a certain amount:</p>
            <FormControl>
              <FormLabel htmlFor="balance" style={{ color: '#1A3B5D' }}>Balance</FormLabel>
              <TextField label={balance ? '' : 'Balance ($)'}
                type="number"
                variant="outlined"
                onChange={(e) => setBalance(e.target.value)}
                required
                value={balance}
              />
            </FormControl>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button type="submit" variant="contained" style={{ backgroundColor: '#1A3B5D' }}>Set Alert</Button>
            </div>
            {alertSucess && (
              <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" className="mb-4">
                Alert Set
              </Alert>
            )}
            {alertFail && (
              <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error" className="mb-4">
                <AlertTitle>Failed to Set Alert</AlertTitle>
                {error && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error}</h4>}
              </Alert>
            )}
          </Box>
        )}
      </div>
    </Layout>
  );
}