import { ObjectId } from 'mongodb';
import { users } from '../config/mongoCollections.js';
import { checkID } from '../helpers.js';

export const updateUserDashboardData = async (userId, newData) => {
  userId = checkID(userId, 'userId');
  const userCollection = await users();

  const update = {};
  if (newData.totalDeposits !== undefined) update.totalDeposits = parseFloat(newData.totalDeposits);
  if (newData.monthlySpending !== undefined) update.monthlySpending = parseFloat(newData.monthlySpending);
  if (newData.upcomingBills !== undefined) update.upcomingBills = parseFloat(newData.upcomingBills);

  const result = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: update },
    { returnDocument: 'after' }
  );

  if (!result.value) throw 'Failed to update user dashboard data';
  return result.value;
};
