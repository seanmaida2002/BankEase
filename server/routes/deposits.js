import { Router } from "express";
import { getUser } from "../data/users.js";
import xss from "xss";
const router = Router();
import {
  createDeposits,
  deleteDeposit,
  getAllDeposits,
  totalDeposits,
} from "../data/deposits.js";
import { deposits } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { checkID, checkAmount, checkString } from "../helpers.js";


router.route("/addDeposits").post(async (req, res) => {
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
    const newDeposit = await createDeposits({
      userId: cleanUserId,
      amount: cleanAmount,
      category: cleanCategory,
      description: cleanDescription,
      createdAt: new Date(),
    });
    return res.status(200).json(newDeposit);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to add deposit" });
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

router.route("/deleteDeposit/:id").delete(async (req, res) => {
  const depositId = req.params.id;
  try {
    const deletedDeposit = await deleteDeposit(depositId);
    return res.status(200).json({ message: "Successfully deleted deposit" });
  } catch (e) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/userDeposits/:userId").get(async (req, res) => {
  const userId = req.params.userId;
  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const depositCollection = await deposits();
    const userDeposits = await depositCollection
      .find({ userId: new ObjectId(userId), isTotal: { $ne: true } })
      .sort({ createdAt: -1 })
      .toArray();
    if (!userDeposits) {
      return res.status(404).json({ error: "No deposits found for this user" });
    }
    return res.status(200).json(userDeposits);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch deposits" });
  }
});

router.route("/totalDeposits/:userId").get(async (req, res) => {
  const userId = req.params.userId;
  try {
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    const totalAmount = await totalDeposits(userId);
    if(!totalAmount || totalAmount < 0){
        return res.status(200).json({totalDeposits: 0});
    }
    return res.status(200).json({totalDeposits: totalAmount});
  } catch (e) {
    return res.status(500).json({error: "Internal Server Error"});
  }
});

router.route("/:id").get(async (req, res) => {
    const { id } = req.params;
    try {
      checkID(id, "depositId");
    } catch (e) {
      return res.status(400).json({ error: "Invalid id" });
    }
    try {
      const depositCollection = await getAllDeposits();
      const deposit = await depositCollection.find(
        (e) => e._id.toString() === id
      );
      if (deposit === null) {
        return res
          .status(200)
          .json({ deposit: 0});
      }
      return res.status(200).json({ deposit: deposit });
    } catch (e) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

export default router;
