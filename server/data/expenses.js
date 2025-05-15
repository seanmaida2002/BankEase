import { expenses } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { checkID, checkString, checkAmount } from "../helpers.js";

export async function createExpense({
  userId,
  amount,
  category,
  description,
  createdAt,
}) {
  checkString(userId, 'userId');
  userId = userId.trim();
  checkID(userId, 'userId');
  checkAmount(amount, 'amount');
  checkString(category, 'category');
  category = category.trim();
  if(description){description = description.trim();}
  const expenseCollection = await expenses();

  const expense = {
    userId: new ObjectId(userId),
    amount,
    category,
    description,
    createdAt,
  };

  const insertResult = await expenseCollection.insertOne(expense);
  if (!insertResult.acknowledged) {
    throw new Error("Could not insert expense");
  }
  // const filter = { userId: new ObjectId(userId), isTotal: true };

  // const updateResult = await expenseCollection.updateOne(
  //   filter,
  //   {
  //     $inc: { totalExpenses: amount },
  //     $setOnInsert: { isTotal: true, createdAt: new Date() },
  //   },

  //   { upsert: true }
  // );
  // if (!updateResult.acknowledged) {
  //   throw new Error("Could not update expense");
  // }

  return expense;
}

export async function getAllExpenses(){
    const expensesCollection = await expenses();
    return expensesCollection.find({}).toArray();
}

export const deleteExpense = async (id) => {
    if (id === undefined){
        throw `Error: id not provided`;
    }
    checkString(id, "expenseId");
    id = id.trim();
    if(!ObjectId.isValid(id)){
        throw `Error: id is not a valid object id`;
    }

    const expenseCollection = await expenses();

    let deleteInfo = await expenseCollection.findOneAndDelete({_id: new ObjectId(id)});
    if(!deleteInfo){
        throw `Error: Could not delete expense with id of ${id}`;
    }
    return `Successfully deleted expense with id ${id}`;
};

export const totalExpenses = async (userId) => {
  if(!userId){
    throw `User ID not provided`;
  }
  checkString(userId, 'userId');
  userId = userId.trim();
  checkID(userId, 'userId');

  const expensesCollection = await expenses();
  const userExpenses = await expensesCollection.find({userId: new ObjectId(userId)}).toArray();
  if(!userExpenses){
    throw `No expenses found for provided user`;
  }
  let totalAmount = 0;
  for(const obj of userExpenses){
    totalAmount = totalAmount + obj.amount;
  }
  return totalAmount;
};

