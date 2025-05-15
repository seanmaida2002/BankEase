import { Router } from "express";
import xss from "xss";
const router = Router();


import { getUser, createUser, getUserByEmail, updateUser, deleteUser, getAllUsers } from '../data/users.js';
import { checkString, checkValidEmail, checkValidAge, checkID, checkValidName, checkValidPassword, checkDateOfBirth } from "../helpers.js";
import { users } from "../config/mongoCollections.js";

router.route('/check-email').post(async (req, res) => {
    //checks to see if an email is taken
    const email = req.body.email.trim().toLowerCase();
    try {
        const userCollection = await users();
        const existingUser = await userCollection.findOne({ email: email });
        if (existingUser !== null) {
            return res.status(400).json({ error: "Email already in use" });
        }
        return res.status(200).json({ message: 'Email available' });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.route('/:id').get(async (req, res) => {
    //get user with provided id
    try {
        const id = req.params.id;
        const user = await getUser(id);
        if (user) {
            return res.status(200).json(user);
        }
        else {
            return res.status(500).json({ error: "Internal server error" });
        }
    } catch (e) {
        return res.status(404).json({ error: "User not found" });
    }
});

router.route('/email/:email').get(async (req, res) => {
    //get user with provided email
    try{
        const email = req.params.email;
        const user = await getUserByEmail(email);
        if(user){
            return res.status(200).json(user);
        }
        else{
            return res.status(500).json({error: "Internal server error"});
        }
    } catch(e){
        return res.status(404).json({error: "User not found"});
    }
});

router.route("/:id").patch(async (req, res) => {
    //edit user
    const userId = req.params.id;
    const updateData = req.body;
    let firstName = xss(updateData.firstName);
    firstName = firstName.trim();
    let lastName = xss(updateData.lastName);
    lastName = lastName.trim();
    let email = xss(updateData.email);
    email = email.trim().toLowerCase();
    let dateOfBirth = xss(updateData.dateOfBirth);
    dateOfBirth = dateOfBirth.trim();
    let password = xss(updateData.password);
    password = password.trim();
    let confirmPassword = xss(updateData.confirmPassword);
    confirmPassword = confirmPassword.trim();

    try {
        let updateObj = {};
        if (firstName) {
            checkString(firstName, 'firstName');
            checkValidName(firstName, 'firstName');
            updateObj.firstName = firstName;
        }
        if (lastName) {
            checkString(lastName, 'firstName');
            checkValidName(lastName, 'firstName');
            updateObj.lastName = lastName;
        }
        if (email) {
            checkValidEmail(email, 'email');
            updateObj.email = email;
        }
        if (dateOfBirth) {
            checkDateOfBirth(dateOfBirth, 'dateOfBirth');
            updateObj.dateOfBirth = dateOfBirth;
        }
        if (password) {
            checkValidPassword(password, 'password');
            updateObj.password = password;
        }

        const updatedUser = await updateUser(userId, updateObj);
        if (updatedUser) {
            return res.status(200).json(updatedUser);
        }
        else {
            return res.status(500).json({ error: "Internal Server error" });
        }
    } catch (e) {
        return res.status(404).json({ error: 'User not found' });
    }
});

export default router;