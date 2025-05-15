import Layout from "../components/Layout"
import { useState, useEffect } from "react"
import Button from '@mui/material/Button';
import { TextField } from "@mui/material";
import FormLabel from '@mui/material/FormLabel';
import { AlertTitle, FormControl } from "@mui/material";
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CheckIcon from '@mui/icons-material/Check';
import { checkAmount, checkString, checkDueDate, converDate } from "../helpers.js";
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import { Form } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';

export default function Bills() {
  const [bills, setBills] = useState([]);
  // const [totalBills, setTotalBills] = useState(0);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertFail, setAlertFail] = useState(false);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const [formError, setFormError] = useState({});

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const userData = await axios.get(`http://localhost:3000/user/email/${user.email.trim()}`);
        const userId = userData.data._id;

        const response = await axios.get(`http://localhost:3000/bills/userBills/${userId}`);
        if (response.status === 200) {
          const bills = Array.isArray(response.data) ? response.data : (response.data.Bills || [])
          setBills(bills);
          // const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
          // setTotalBills(total);
        }
      } catch (error) {
        console.error("Error fetching monthly bills:", error);
      }
    };

    fetchBills();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertSuccess(false);
    setAlertFail(false);
    setError('');
    setFormError({});

    let{amountInput, categoryInput, descriptionInput, dueDateInput} = e.target.elements;
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
      let dueDateError = checkDueDate(dueDateInput.value, 'Due Date');
      if(dueDateError !== dueDateInput.value){
        errors.dueDate = dueDateError;
      }

      if(Object.keys(errors).length > 0){
        setFormError(errors);
        return;

      }
      const response = await axios.post('http://localhost:3000/bills/addBill', {
        userId: userId,
        amount: parseFloat(amountInput.value),
        category: categoryInput.value,
        description: descriptionInput.value,
        createdAt: new Date().toISOString(),
        dueDate: dueDateInput.value
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        // const newExpense = {
        //   amount: parseFloat(amount),
        //   category,
        //   description,
        //   createdAt: new Date().toISOString()

        // };
        const newExpense = response.data;
        setBills(prev => [newExpense, ...prev]);
        // setTotalBills(prevTotal => prevTotal + newExpense.amount);
        setAlertSuccess(true);
        setAmount('');
        setCategory('');
        setDescription('');
        setDueDate('');
        setTimeout(() => setAlertSuccess(false), 2000);
      } else {
        throw new Error("could not add bill");

      }
    } catch (e) {
      console.log(e);
      setAlertFail(true);
      setError('Failed to add bill. Please try again');
    }

  }

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:3000/bills/deleteBill/${id}`);
      if (response.status === 200) {
        setBills(e => e.filter(b => b._id !== id));
        const deletedExpense = bills.find(b => b._id === id);
        if (deletedExpense) {
          // setTotalBills(e => e - deletedExpense.amount);
        } else {
          console.log('failed to delete bill');
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <Layout>
      <div style={{ padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Add Bills</h2>
        <p>Add any monthly bills you may have</p>
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
          <FormControl>
            <FormLabel htmlFor="dueDate" style={{color: '#1A3B5D'}}>Due Date</FormLabel>
            <TextField name="dueDateInput" type='date' variant="outlined" value={dueDate} onChange={(e) => setDueDate(e.target.value)}/>
          </FormControl>
          {formError.dueDate && <h4 className="text-[oklch(57.7%_0.245_27.325)]">{formError.dueDate}</h4>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button type="submit" variant="contained" style={{ backgroundColor: '#1A3B5D' }}>
              Add Bill
            </Button>
          </div>
          {alertSuccess && (
            <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" className="mb-4">
              Bill added successfully!
            </Alert>
          )}
          {alertFail && (
            <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error" className="mb-4">
              <AlertTitle>Failed to add Bill</AlertTitle>
              {error && <h4 className='text-[oklch(57.7%_0.245_27.325)]'>{error}</h4>}
            </Alert>
          )}

        </Box>
        {bills.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3>Recent Bills</h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {bills.map((exp, idx) => (
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
                    <strong>Due Date: </strong>{converDate(exp.dueDate)} <br />
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