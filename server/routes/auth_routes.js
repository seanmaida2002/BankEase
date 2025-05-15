import { Router } from "express";
import { createUser, loginUser } from "../data/users.js";

import {
    checkString,
    checkValidName,
    checkValidEmail,
    checkDateOfBirth,
    checkValidPassword,
} from "../helpers.js";
import xss from "xss";

const router = Router();

router.route("/register").post(async (req, res) => {
    const addUserFormData = req.body;
    let firstName = xss(addUserFormData.firstName);
    firstName = firstName.trim();
    let lastName = xss(addUserFormData.lastName);
    lastName = lastName.trim();
    let email = xss(addUserFormData.email);
    email = email.trim();
    let dateOfBirth = xss(addUserFormData.dateOfBirth);
    dateOfBirth = dateOfBirth.trim();
    let password = xss(addUserFormData.password);
    let confirmPassword = xss(addUserFormData.confirmPassword);
    let totalBalance = xss(addUserFormData.totalBalance);
    let monthlySpending = xss(addUserFormData.monthlySpending);
    let upcomingBills = xss(addUserFormData.upcomingBills);

    try{
        checkString(firstName, 'firstName');
        firstName = firstName.trim();
        checkValidName(firstName, 'firstName');
    } catch(e){
        return res.status(404).json({ error: "" });
    }
    try{
        checkString(lastName, 'Last Name');
        lastName = lastName.trim();
        checkValidName(lastName, 'Last Name');
    } catch(e){
        return res.status(404).json({ error: "Last name" });
    }
    try{
        checkValidEmail(email, 'Email');
        email = email.trim();
    } catch(e){
        return res.status(404).json({ error: "email" });
    }
    try{
        checkValidPassword(password, 'password');
        password = password.trim();
    } catch(e){
        return res.status(404).json({ error: "password" });
    }
    try {
        checkDateOfBirth(dateOfBirth, 'dateOfBirth');
        dateOfBirth = dateOfBirth.trim();
    } catch (e) {
        return res.status(404).json({ error: e.toString() });
    }

    try {
        let newUser = await createUser(
            firstName,
            lastName,
            dateOfBirth,
            email,
            password,
            totalBalance,
            monthlySpending,
            upcomingBills
        );

        if (newUser) {
            return res.status(200).json({
                _id:newUser._id,
                firstName:newUser.firstName,
                lastName: newUser.lastName,
                email:newUser.email,
                dateOfBirth:newUser.dateOfBirth,
                totalBalance: newUser.totalBalance,
                monthlySpending: newUser.monthlySpending,
                upcomingBills: newUser.upcomingBills

            });
        }
        else {
            return res.status(400).json({ error: "Unable to create user" });
        }
    } catch (e) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
router.route("/login").get((req,res)=>{
    res.redirect('Post to /auth/login from frontend');

})


router.route("/login").post(async (req, res) => {
    const loginFormData = req.body;
    let email = xss(loginFormData.email);
    email = email.trim().toLowerCase();
    let password = xss(loginFormData.password);

    let badFields = [];
    try{
        checkValidEmail(email, 'email');
    } catch(e){
        badFields.push("email");
    }

    try{
        checkString(password, 'password');
    } catch(e){
        badFields.push('password');
    }

    if(badFields.length !== 0){
        return res.status(400).json({error: "Invalid Email or Password"});
    }

    try{
        let login = await loginUser(email, password);
        console.log('logged in user :', login);
        if(login && login.firstName !== undefined){
            return res.status(200).json({
                _id:login._id,
                firstName: login.firstName,
                lastName: login.lastName,
                email: login.email,
                dateOfBirth: login.dateOfBirth,
            });
        } else{
            return res.status(500).json({error: "Internal Server Error"});
        }
    }
    catch(e){
        return res.status(404).json({error: e});
    }
});


export default router;
