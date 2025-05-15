import Layout from "../components/Layout";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Typography, CircularProgress, Alert } from '@mui/material';
import StatCard from '../components/StatCard';
import { PieChart } from '@mui/x-charts/PieChart';

export default function Dashboard() {
  const [totalDeposits, setTotalDeposit] = useState(0);
  const [upcomingBills, setUpcomingBills] = useState({});
  const [pieChartData, setPieChartData] = useState([]);
  const [totalMonthlySpending, setTotalMonthlySpending] = useState("0");
  const [initialBalance, setInitialBalance] = useState(0);
  const [hasUpcomingDueSoon, setHasUpcomingDueSoon] = useState(false);
  const [balanceAlertValue, setBalanceAlertValue] = useState(null);
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);

  const convertDate = (date) => {
    const dateParts = date.split('-').map(Number);
    if (dateParts.length !== 3) throw 'Invalid date format';
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    return `${month}/${day}/${year}`;
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user._id;
        const response = await axios.get(`http://localhost:3000/dashboard/${userId}`);
        const data = response.data;

        if (data.upcomingBills.length === 0) {
          setUpcomingBills("No bills due at this time");
        } else {
          let bills = {};
          let hasDueSoon = false;
          const today = new Date();
          data.upcomingBills.forEach(obj => {
            bills[obj.category] = obj.dueDate;
            const dueDate = new Date(obj.dueDate);
            const timeDiff = dueDate.getTime() - today.getTime();
            const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            if (dayDiff >= 0 && dayDiff <= 7) hasDueSoon = true;
          });
          setUpcomingBills(bills);
          setHasUpcomingDueSoon(hasDueSoon);
        }

        setInitialBalance(Number(data.totalBalance));
        if (data.balanceAlert) {
          const alertVal = Number(data.balanceAlert);
          setBalanceAlertValue(alertVal);
          if (Number(data.totalBalance) < alertVal) {
            setShowBalanceWarning(true);
          }
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchPieChartData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user._id;
        const expensesRes = await axios.get(`http://localhost:3000/expenses/userExpenses/${userId}`);
        const billsRes = await axios.get(`http://localhost:3000/bills/userBills/${userId}`);
        const combined = [...expensesRes.data, ...billsRes.data];
        const categories = {};

        combined.forEach(item => {
          const category = item.category || 'Uncategorized';
          const amount = parseFloat(item.amount);
          categories[category] = (categories[category] || 0) + amount;
        });

        const chartData = Object.entries(categories).map(([category, value]) => ({
          id: category,
          value,
          label: category
        }));
        setPieChartData(chartData);
      } catch (e) {
        console.log(e);
      }
    };
    fetchPieChartData();
  }, []);

  useEffect(() => {
    const fetchTotalExpenses = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user._id;
      try {
        const totalExpenses = await axios.get(`http://localhost:3000/expenses/totalExpenses/${userId}`);
        const totalBills = await axios.get(`http://localhost:3000/bills/totalBills/${userId}`);
        const te = totalExpenses.data.totalExpenses;
        const tb = totalBills.data.totalBills;
        const combined = (te || 0) + (tb || 0);
        setTotalMonthlySpending(combined.toString());
      } catch (e) {
        console.log(e);
      }
    };
    fetchTotalExpenses();
  }, []);

  useEffect(() => {
    const fetchTotalDeposits = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user._id;
        const response = await axios.get(`http://localhost:3000/deposits/totalDeposits/${userId}`);
        if (response.data && response.data.totalDeposits !== undefined) {
          setTotalDeposit(response.data.totalDeposits);
        }
      } catch (error) {
        console.error("Error fetching total deposits", error);
      }
    };
    fetchTotalDeposits();
  }, []);

  return (
    <Layout>
      <div className="p-8 bg-[#FAF3E0] min-h-screen">
        {hasUpcomingDueSoon && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You have bills due soon — don’t forget to pay them!
          </Alert>
        )}
        {showBalanceWarning && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Your balance is below the alert threshold of ${balanceAlertValue} — consider reviewing your spending!
          </Alert>
        )}
        {!hasUpcomingDueSoon && !showBalanceWarning && (
          <Alert severity="success" sx={{ mb: 2 }}>
            No upcoming bills or balance issues — nice job staying ahead!
          </Alert>
        )}

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1A3B5D', textAlign: 'center', mt: 7, mb: 7 }}>
          Welcome to BankEase
        </Typography>

        <Grid container spacing={4} direction="row" justifyContent="center" alignItems="stretch">
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard title="Total Balance" value={`$${initialBalance + totalDeposits}`} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard title="Monthly Spending" value={`$${totalMonthlySpending}`} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard title="Upcoming Bills" value={
              Object.entries(upcomingBills).filter(([, dueDate]) => {
                const currentDate = new Date();
                const due = new Date(dueDate);
                const dateDifference = Math.ceil((due - currentDate) / (1000 * 60 * 60 * 24));
                return dateDifference >= 0 && dateDifference <= 30;
              }).length === 0 ? 'No bills due at this time' : (
                Object.entries(upcomingBills).filter(([, dueDate]) => {
                  const currentDate = new Date();
                  const due = new Date(dueDate);
                  const dateDifference = Math.ceil((due - currentDate) / (1000 * 60 * 60 * 24));
                  return dateDifference >= 0 && dateDifference <= 30;
                }).map(([category, dueDate]) => (
                  <div key={category}>
                    <p><u>{category}</u>: {convertDate(dueDate)}</p>
                  </div>
                ))
              )} />
          </Grid>
        </Grid>

        <Grid container direction="column" alignItems="center" sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1A3B5D' }}>
            Spending Breakdown by Category
          </Typography>
          <Grid item>
            {pieChartData.length > 0 ? (
              <PieChart series={[{ data: pieChartData }]} width={200} height={200} />
            ) : (
              <CircularProgress />
            )}
          </Grid>
        </Grid>
      </div>
    </Layout>
  );
}
