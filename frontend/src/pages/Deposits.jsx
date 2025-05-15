import Layout from "../components/Layout"
import { useState, useEffect } from "react"
import Button from '@mui/material/Button';
import { TextField } from "@mui/material";
import FormLabel from '@mui/material/FormLabel';
import { AlertTitle, FormControl } from "@mui/material";
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import { checkAmount, checkString } from "../helpers.js";


export default function Deposits() {
  const [deposit, setDeposits] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertFail, setAlertFail] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState({});
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const userData = await axios.get(`http://localhost:3000/user/email/${user.email.trim()}`);
        const userId = userData.data._id;

        const response = await axios.get(`http://localhost:3000/deposits/userDeposits/${userId}`);
        if (response.status === 200) {
          setDeposits(response.data);
        }
      } catch (error) {
        console.error("Error fetching monthly deposits:", error);
      }
    };

    fetchDeposits();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertSuccess(false);
    setAlertFail(false);
    setError('');
    setFormError({});

    let{amountInput, categoryInput, descriptionInput} = e.target.elements;
    let errors = {};

    try {
      const userData = await axios.get(`http://localhost:3000/user/email/${user.email.trim()}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const userId = userData.data._id;
      let amountError = checkAmount(amountInput.value);
      if(amountError !== amountInput.value){
        errors.amount = amountError;
      }
      let categoryError = checkString(categoryInput.value, "Category");
      if(categoryError !== categoryInput.value.trim()){
        errors.category = categoryError;
      }
      if(Object.keys(errors).length > 0){
        setFormError(errors);
        return;
      }
      const response = await axios.post('http://localhost:3000/deposits/addDeposits', {
        userId: userId,
        amount: parseFloat(amountInput.value),
        category: categoryInput.value,
        description: descriptionInput.value,
        createdAt: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        const newDeposit = response.data;
        setDeposits(prev => [newDeposit, ...prev]);
        setAlertSuccess(true);
        setAmount('');
        setCategory('');
        setDescription('');
        setTimeout(() => setAlertSuccess(false), 2000);
      } else {
        throw new Error("could not add deposit");

      }
    } catch (e) {
      console.log(e);
      setAlertFail(true);
      setError('Failed to add deposit. Please try again');
    }

  }

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:3000/deposits/deleteDeposit/${id}`);
      if (response.status === 200) {
        setDeposits(e => e.filter(exp => exp._id !== id));
        const deletedDeposit = deposit.find(exp => exp._id === id);
        if (!deletedDeposit) {
          console.log('failed to delete deposit');
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <Layout>
      <div style={{ padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Add Deposit</h2>
        <p>Add funds to your current balance</p>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
        >
          <FormControl>
            <FormLabel htmlFor="amount" style={{ color: '#1A3B5D' }}>Amount</FormLabel>
            <TextField
              type="number"
              variant="outlined"
              value={amount}
              name="amountInput"
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Amount"
            />
          </FormControl>
          {formError.amount && <h4 className="text-[oklch(57.7%_0.245_27.325)]">{formError.amount}</h4>}
          <FormControl>
            <FormLabel htmlFor="category" style={{ color: '#1A3B5D' }}>Category</FormLabel>
            <TextField
              variant="outlined"
              value={category}
              name="categoryInput"
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Food,Bills,Travel"
              required
            />
          </FormControl>
          {formError.category && <h4 className="text-[oklch(57.7%_0.245_27.325)]">{formError.category}</h4>}
          <FormControl>
            <FormLabel htmlFor="description" style={{ color: '#1A3B5D' }}>Description</FormLabel>
            <TextField
              variant="outlined"
              value={description}
              name="descriptionInput"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter Description"
            />
          </FormControl>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button type="submit" variant="contained" style={{ backgroundColor: '#1A3B5D' }}>
              Add Deposit
            </Button>
          </div>
          {alertSuccess && (
            <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" className="mb-4">
              Expense added successfully!
            </Alert>
          )}
          {alertFail && (
            <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error" className="mb-4">
              <AlertTitle>Failed to add Expense</AlertTitle>
              {error && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error}</h4>}
            </Alert>
          )}

        </Box>
        {deposit.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3>Recent Deposits</h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {deposit.map((exp, idx) => (
                <li key={idx} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  backgroundColor: '#f9f9f9'

                }}>
                  <div>
                    <strong>Amount: </strong>${exp.amount.toFixed(2)} <br />
                    <strong>Category: </strong>{exp.category} <br />
                    <strong>Description: </strong>{exp.description} <br />
                    <small>{new Date(exp.createdAt).toLocaleString()}</small>
                  </div>
                    <Button
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(exp._id)}
                      style={{
                        color: 'red', bottom: '-10px', right: '20px'
                      }}
                    />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}