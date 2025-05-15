import { Router } from "express";
import { updateUserDashboardData } from '../data/dashboard.js';
import { checkID } from '../helpers.js';
import { getAllUsers } from "../data/users.js";
import { getAllBills } from "../data/bills.js";
import { getBalanceAlert } from "../data/balanceAlert.js";

const router = Router();

router.patch('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedData = req.body; 
    const updatedUser = await updateUserDashboardData(userId, updatedData);
    res.json(updatedUser);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    checkID(userId, 'userId');
  } catch (e) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const userCollection = await getAllUsers();
    const existingUser = await userCollection.find(user => user._id.toString() === userId);
    if (existingUser === null) {
      return res.status(404).json({ error: "No user found with provided id" });
    }

    const userBills = await getAllBills(userId);
    const balanceAlertObj = await getBalanceAlert(userId);

    const balanceAlert = balanceAlertObj ? balanceAlertObj.balance : null;

    return res.status(200).json({
      totalBalance: existingUser.totalBalance,
      monthlySpending: existingUser.monthlySpending,
      upcomingBills: userBills === 'Provided user does not have any bills' ? [] : userBills,
      balanceAlert: balanceAlert  
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
