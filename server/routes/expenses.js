import { Router } from "express";
import { getUser } from "../data/users.js";
import xss from "xss";
const router = Router();
import {
  createExpense,
  deleteExpense,
  getAllExpenses,
  totalExpenses,
} from "../data/expenses.js";
import { expenses } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { checkAmount, checkID, checkString } from "../helpers.js";

router.route("/:id").get(async (req, res) => {
  const { id } = req.params;
  try {
    checkID(id, "expenseId");
  } catch (e) {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    const expenseCollection = await getAllExpenses();
    const expense = await expenseCollection.find(
      (e) => e._id.toString() === id
    );
    if (expense === null) {
      return res
        .status(404)
        .json({ error: "No expense found with provided id" });
    }
    return res.status(200).json({ expense: expense });
  } catch (e) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/addExpense").post(async (req, res) => {
  const { userId, amount, category, description } = req.body;

  const cleanUserId = xss(userId).trim();
  const cleanAmount = parseFloat(xss(amount));
  const cleanCategory = xss(category).trim();
  const cleanDescription = xss(description || "").trim();

  try{
    checkString(cleanUserId, 'userId');
    checkID(cleanUserId, 'userId');
  } catch(e){
    return res.status(400).json({error: "Invalid User Id"});
  }
  try{
    checkAmount(cleanAmount, 'amount');
  } catch(e){
    return res.status(400).json({error: "Invalid Amount"});
  }
  try{
    checkString(cleanCategory, 'category');
  } catch(e){
    return res.status(400).json({error: "Invalid Category"});
  }

  try {
    const user = await getUser(cleanUserId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const newExpense = await createExpense({
      userId: cleanUserId,
      amount: cleanAmount,
      category: cleanCategory,
      description: cleanDescription,
      createdAt: new Date(),
    });
    return res.status(200).json(newExpense);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to add expense" });
  }
});

// router.route("/totalExpenses/:userId").get(async (req, res) => {
//   const userId = req.params.userId;
//   try {
//     const expenseCollection = await expenses();
//     const totalExpenseDoc = await expenseCollection.findOne({
//       userId: new ObjectId(userId),
//       isTotal: true,
//     });
//     if (totalExpenseDoc) {
//       const monthlySpending = totalExpenseDoc.totalExpenses || 0;
//       return res.status(200).json({ monthlySpending });
//     } else {
//       return res.status(404).json({ error: "Total expenses not found" });
//     }
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });

router.route("/deleteExpense/:id").delete(async (req, res) => {
  const expenseId = req.params.id;
  try {
    const deletedExpense = await deleteExpense(expenseId);
    return res.status(200).json({ message: "Successfully deleted expense" });
  } catch (e) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/userExpenses/:userId").get(async (req, res) => {
  const userId = req.params.userId;
  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const expenseCollection = await expenses();
    const userExpenses = await expenseCollection
      .find({ userId: new ObjectId(userId), isTotal: { $ne: true } })
      .sort({ createdAt: -1 })
      .toArray();
    if (!userExpenses) {
      return res.status(404).json({ error: "No expenses found for this user" });
    }
    return res.status(200).json(userExpenses);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

router.route("/totalExpenses/:userId").get(async (req, res) => {
  const userId = req.params.userId;
  try {
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    const totalAmount = await totalExpenses(userId);
    if(!totalAmount){
        return res.status(400).json({error: 'Could not get total expenses'});
    }
    return res.status(200).json({totalExpenses: totalAmount});
  } catch (e) {
    return res.status(500).json({error: "Internal Server Error"});
  }
});

export default router;
