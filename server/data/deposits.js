import { deposits} from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { checkAmount, checkID, checkString } from "../helpers.js";

export async function createDeposits({
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
  const depositCollection = await deposits();

  const deposit = {
    userId: new ObjectId(userId),
    amount,
    category,
    description,
    createdAt,
  };

  const insertResult = await depositCollection.insertOne(deposit);
  if (!insertResult.acknowledged) {
    throw new Error("Could not insert deposit");
  }
  // const filter = { userId: new ObjectId(userId), isTotal: true };

  // const updateResult = await depositCollection.updateOne(
  //   filter,
  //   {
  //     $inc: { totalDeposits: amount },
  //     $setOnInsert: { isTotal: true, createdAt: new Date() },
  //   },

  //   { upsert: true }
  // );
  // if (!updateResult.acknowledged) {
  //   throw new Error("Could not update deposit");
  // }

  return deposit;
}

export async function getAllDeposits(){
    const depositCollection = await deposits();
    return depositCollection.find({}).toArray();
}

export const deleteDeposit = async (id) => {
    if (id === undefined){
        throw `Error: id not provided`;
    }
    checkString(id, "depositId");
    id = id.trim();
    if(!ObjectId.isValid(id)){
        throw `Error: id is not a valid object id`;
    }

    const depositCollection = await deposits();

    let deleteInfo = await depositCollection.findOneAndDelete({_id: new ObjectId(id)});
    if(!deleteInfo){
        throw `Error: Could not delete deposit with id of ${id}`;
    }
    return `Successfully deleted deposit with id ${id}`;
};

export const totalDeposits = async (userId) => {
  if(!userId){
    throw `User ID not provided`;
  }
  checkString(userId, 'userId');
  userId = userId.trim();
  checkID(userId, 'userId');

  const depositCollection = await deposits();
  const userDeposits = await depositCollection.find({userId: new ObjectId(userId)}).toArray();
  if(!userDeposits){
    throw `No deposits found for provided user`;
  }
  let totalAmount = 0;
  for(const obj of userDeposits){
    totalAmount = totalAmount + obj.amount;
  }
  return totalAmount;
};

