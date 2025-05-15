import {ObjectId} from 'mongodb';
import {alerts} from "../config/mongoCollections.js";
import { users } from '../config/mongoCollections.js';
import { checkID, checkString } from '../helpers.js';

export const createAlert = async (
    userID, alertType
) => {
    if(userID === undefined || alertType === undefined){
        throw `Error: all fields need to be supplied`;
    }
    userID = checkID(userID, 'userID');
    checkString(alertType, 'alertType');
    alertType = alertType.trim();
    if(alertType !== 'balanceAlert'){
        throw `Invalid alert type`;
    }

    const alertCollection = await alerts();
    let alert = {
        userID: userID,
        alertType: alertType,
        alerts: []
    };
    const insertInfo = await alertCollection.insertOne(alert);
    alert._id = insertInfo.insertedId.toString();
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw `Error: could not add alert`;
    }

    const userCollection = await users();
    const user = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(userID)},
        {$push: {alerts: alert._id}},
        {returnDocument: "after"}
    );
    if(user === null){
        throw `No user found with that id`;
    }

    return alert;

};