import { bills } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import {
  checkString,
  checkID,
  checkAmount,
  checkDate,
  checkDueDate,
} from "../helpers.js";

export async function createBills({
  userId,
  amount,
  category,
  description,
  createdAt,
  dueDate,
}) {
  checkString(userId, "userId");
  userId = userId.trim();
  checkID(userId, "userId");
  checkAmount(amount, "amount");
  description = description.trim();
  checkDueDate(dueDate, "dueDate");
  dueDate = dueDate.trim();

  const billCollection = await bills();

  const bill = {
    userId: new ObjectId(userId),
    amount,
    category,
    description,
    createdAt,
    dueDate,
  };

  const insertResult = await billCollection.insertOne(bill);
  if (!insertResult.acknowledged) {
    throw new Error("Could not insert bill");
  }
  // const filter = { userId: new ObjectId(userId), isTotal: true };

  // const updateResult = await billCollection.updateOne(
  //   filter,
  //   {
  //     $inc: { totalBills: amount },
  //     $setOnInsert: { isTotal: true, createdAt: new Date() },
  //   },

  //   { upsert: true }
  // );
  // if (!updateResult.acknowledged) {
  //   throw new Error("Could not update bill");
  // }
  return bill;
}

export const deleteBill = async (id) => {
  if (id === undefined) {
    throw `Error: id not provided`;
  }
  checkString(id, "billId");
  id = id.trim();
  if (!ObjectId.isValid(id)) {
    throw `Error: id is not a valid object id`;
  }

  const billCollection = await bills();

  let deleteInfo = await billCollection.findOneAndDelete({
    _id: new ObjectId(id),
  });
  if (!deleteInfo) {
    throw `Error: Could not delete bill with id of ${id}`;
  }
  return `Successfully deleted bill with id ${id}`;
};

export const totalBills = async (userId) => {
  if (!userId) {
    throw `User ID not provided`;
  }
  checkString(userId, "userId");
  userId = userId.trim();
  checkID(userId, "userId");
  const billsCollection = await bills();
  const userBills = await billsCollection
    .find({ userId: new ObjectId(userId) })
    .toArray();
  if (!userBills || userBills.length === 0) {
    return 0;
  }

  let totalAmount = 0;
  for (const obj of userBills) {
    totalAmount = totalAmount + obj.amount;
  }
  return totalAmount;
};

export const getAllBills = async (userId) => {
  if (!userId) {
    throw `User ID not provided`;
  }
  checkString(userId, "userId");
  userId = userId.trim();
  checkID(userId, "userId");
  const billsCollection = await bills();
  const userBills = await billsCollection
    .find({ userId: new ObjectId(userId) })
    .toArray();
    if (!userBills || userBills.length === 0) {
      return `Provided user does not have any bills`;
    }
    return userBills;
};
