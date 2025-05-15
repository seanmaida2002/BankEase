import {ObjectId} from 'mongodb';
import {alerts, users} from "../config/mongoCollections.js";
import { checkID, checkString } from '../helpers.js';

export const createBalanceAlert = async (
    userID, alertID, balance
) => {
    if(userID === undefined || alertID === undefined || balance === undefined){
        throw `Error: all fields need to be supplied`;
    }
    userID = checkID(userID, 'userID')
    alertID = checkID(alertID, 'alertID');
    balance = balance.trim();
    checkString(balance, 'balance');

    const alertCollection = await alerts();
    const alert = await alertCollection.findOne({_id: new ObjectId(alertID)});
    if(alert === null){
        throw `No alert with that id`;
    }
    const userCollection = await users();
    const user = await userCollection.findOne({_id: new ObjectId(userID)});
    if(user === null){
        throw `No user found with that id`;
    }
    let balanceAlert = {
        _id: new ObjectId(),
        alertId: alertID,
        userId: userID,
        balance: balance
    }
    alert.alerts.push(balanceAlert);
    await alertCollection.findOneAndUpdate(
        {_id: new ObjectId(alertID)},
        {$set: {alerts: alert.alerts}}
    );
    return `Balance alert set with balance ${balance}`;
};

export const getBalanceAlert = async (userId) => {
    userId = checkID(userId, 'userId');
    const alertCollection = await alerts();
    const userAlerts = await alertCollection.findOne({userID: userId});

    if(!userAlerts || !userAlerts.alerts){
        return null;
    }

    const balanceAlert = userAlerts.alerts.find(a => a.userId === userId && a.balance !== undefined);
    if(!balanceAlert){
        throw `No alert found`;
    }

    return balanceAlert || null;
}
