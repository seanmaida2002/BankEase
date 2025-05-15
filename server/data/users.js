import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import bcrypt from "bcrypt";

import {
  checkString,
  checkValidEmail,
  checkID,
  checkValidName,
  checkDateOfBirth,
  checkValidAge,
  checkValidPassword,
} from "../helpers.js";

export const createUser = async (
  firstName,
  lastName,
  dateOfBirth,
  email,
  password,
  totalBalance,
) => {
  checkString(firstName, "firstName");
  firstName = firstName.trim();
  checkString(lastName, "lastname");
  lastName = lastName.trim();
  checkValidEmail(email, "email");
  email = email.trim().toLowerCase();
  checkDateOfBirth(dateOfBirth, "dateOfBirth");
  dateOfBirth = dateOfBirth.trim();
  checkValidPassword(password, "password");
  password = password.trim();
  if (isNaN(totalBalance) || totalBalance < 0) throw "Invalid totalBalance";

  let overSeventeen = false;
  if (checkValidAge(dateOfBirth, "dateOfBirth") > 17) {
    overSeventeen = true;
  }

  /////// HASHING THE PASSWORD ////////
  const saltRounds = 10;
  let hashedPassword = await bcrypt.hash(password, saltRounds);

  let newUser = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: hashedPassword,
    dateOfBirth: dateOfBirth,
    overSeventeen: overSeventeen,
    alerts: [],
    totalBalance
  };

  const userCollection = await users();

  const foundUser = await userCollection.findOne({email: email});
  if(foundUser) throw "Email already in use";

  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not add user";

  const user = await userCollection.findOne({ _id: insertInfo.insertedId });

  return user;
};

export const getUser = async (id) => {
    checkString(id, "id");
    id = id.trim();
    if(!ObjectId.isValid(id)){
        throw "Invalid Object ID";
    }

    const userCollection = await users();
    const user = await userCollection.findOne({_id: new ObjectId(id)});
    if(user === null){
        throw "No user found with that id";
    }

    user._id = user._id.toString();
    return user;
};

export const getUserByEmail = async (email) => {
    checkValidEmail(email, 'email');
    email = email.trim();

    const userCollection = await users();
    const user = await userCollection.findOne({email: email});

    if(user === null){
        throw `No user found with email "${email}"`;
    }

    return user;
};

export const deleteUser = async (id) => {
    checkString(id, 'id');

    id = id.trim();

    if(!ObjectId.isValid(id)){
        throw "Invlaid Object ID";
    }

    const userCollection = await users();
    const user = await userCollection.findOneAndDelete({_id: new ObjectId(id)});

    if(user === null){
        throw "No user found with that id";
    }

    return `Successfully deleted user with id ${id}`;
};

export const updateUser = async(id, obj) => {
    checkID(id, "id");
    id = id.trim();

    if (!ObjectId.isValid(id)) {
        throw "invalid object ID";
    }
    const userCollection = await users();
    let user = await userCollection.findOne({_id: new ObjectId(id)});
    if(user === null){
        throw `No user found with id: ${id}`;
    }

    if(obj.firstName){
        checkString(obj.firstName, "firstName");
        checkValidName(obj.firstName.trim());
        user.firstName = obj.firstName.trim();
    }
    if (obj.lastName) {
        checkString(obj.lastName, "lastName");
        checkValidName(obj.lastName.trim());
        user.lastName = obj.lastName.trim();
    }
    if (obj.dateOfBirth) {
        checkDateOfBirth(obj.dateOfBirth, 'dateOfBirth');
        user.dateOfBirth = obj.dateOfBirth.trim();
    }
    if (obj.email) {
        checkValidEmail(obj.email, 'email');
        user.email = obj.email.trim();
    }
    if(obj.password){
        checkString(obj.password.trim(), "updatePassword");
        checkValidPassword(obj.password.trim(), "updatePassword");
        user.password = await bcrypt.hash(obj.password.trim(), 10);
    }
    if (obj.totalBalance !== undefined) {
        user.totalBalance = parseFloat(obj.totalBalance);
    }

    await userCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {$set: user},
        {returnDocument: "after"}
    );

    if(user === null){
        throw `Error: no user found with that id`;
    }
    user._id = user._id.toString();
    return user;
};

export const loginUser = async(email, password) => {
    if(email === undefined || password === undefined) throw "Email or password not provided";
    if(typeof email !== "string" || typeof password !== "string") throw 'Either the email or password is incorrect';
    
    email = email.trim().toLowerCase();
    const userCollection = await users();
    const foundUser = await userCollection.findOne({email: email});
    if(!foundUser) throw "Either the email of password is incorrect";

    if(foundUser){
        let compareToUser = false;
        try{
            compareToUser = await bcrypt.compare(password, foundUser.password);
        } catch(e){}
        if(compareToUser){
            return {
                _id:foundUser._id.toString(),
                firstName: foundUser.firstName,
                lastName: foundUser.lastName,
                email: foundUser.email,
                dateOfBirth: foundUser.dateOfBirth
            };
        }
        else {
            throw "Either the email or password is incorrect";
        }
    }
};

export const getAllUsers = async () => {
    const userCollection = await users();
    return userCollection.find({}).toArray();
}
