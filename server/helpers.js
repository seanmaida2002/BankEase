import { ObjectId } from "mongodb";


export function checkString(param, name) {
    if (param === undefined || typeof param !== "string") {
        throw `${name} cannot be undefined and must be a string`;
    }

    if (param.trim() === "") {
        throw `${name} cannot be an empty string`;
    }

    return param.trim();
}

export function checkAmount(amount, name){
    if(!amount){
        throw `Error: You must provide an amount`;
    }
    if(amount <= 0){
        throw `${name} must be greater than 0`;
    }
    let x = amount.toString();
    if(x.includes('.')){
        if(x.split('.')[1].length > 2){
            throw `${name} must be a valid number`
        }
    }
    return amount;
}

export function checkValidEmail(email, name) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;

    if (!emailPattern.test(email)) {
        throw `${name} cannot be an invalid email.`;
    }

    return email;
}

export function checkValidName(param, name) {
    const nameRegex = /[^a-zA-Z-]/;

    if (nameRegex.test(param)) {
        throw `${name} must only contain letters and the '-' character.`;
    }

    return param;
}

export function checkID(id, varName) {
    if (!id) throw `Error: You must provide a ${varName}`;
    if (typeof id !== "string") throw `Error:${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
        throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
    return id;
}

export function checkYear(year){ 
    //year must be passed in as a number, Number(year), not as a string

    if(!year){
        throw `Error: Year not provided`;
    }
    if(typeof year !== 'number'){
        throw `Error: Year must be a number`;
    }
    const currentYear = new Date().getFullYear();
    if(year > currentYear || year < 1400 || year <=0){
        throw `Error: Invalid Year`;
    }
}

export function checkDate (date, varName){
    if(!date){
        throw `Error: ${varName} not supplied`;
    }
    if(typeof date !== 'string'){
        throw `Error: ${varName} must be a string`;
    }
    date = date.trim();
    
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if(!regex.test(date)){
        throw `Error: ${varName} must be in the correct MM/DD/YYYY format`;
    }

    const [month, day, year] = date.split('/');
    if(month === "02"){
        if(day === "30"){
            throw `Error: Invalid Date`;
        }
        if(!((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0))){
            if(day === "29"){
                throw `Error: Invalid Date`;
            }
        }
    }
    if(month === '04' || month === '06' || month === '09' || month === '11'){
        if (day === '31'){
            throw`Error: Invalid Date`;
        }
    }
    checkYear(Number(year));

}

export function checkValidAge(dateOfBirth, varName) {
    if(!dateOfBirth){
        throw `Error: ${varName} not provided`;
    }
    if(typeof dateOfBirth !== 'string'){
        throw `Error: ${varName} must be a string`;
    }

    const [month, day, year] = dateOfBirth.split('/');
    const dob = new Date(year + "-" + month + "-" + day);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - dob.getFullYear();
    const monthDifference = currentDate.getMonth() - dob.getMonth();

    if(monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < dob.getDate())){
        age--;
    }
    if (age < 18) {
        throw "Error: You must be at least 18 years old to use this website.";
    } 
    return age;
}

export function checkDateOfBirth(dob, varName){
    if(!dob){
        throw `Error: ${varName} not provided`;
    }
    checkDate(dob, varName);
    checkValidAge(dob, varName);
}

export function checkValidPassword(password, name) {
    if (password.length <= 7) {
      throw `${name} must be at least eight characters long.`;
    }
  
    const uppercaseRegex = /[A-Z]/;
    const digitRegex = /\d/;
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  
    if (!uppercaseRegex.test(password)) {
      throw `${name} must contain at least one capital letter.`;
    }
  
    if (!digitRegex.test(password)) {
      throw `${name} must contain at least one digit.`;
    }
  
    if (!specialCharRegex.test(password)) {
      throw `${name} must contain at least one special character.`;
    }
  
    return password;
  }

  export function converDate(date){
    //MM/DD/YYYY
    if(!date || date.trim().length <= 0){
        throw `date must be provided`;
    }
    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
      throw 'Invalid date format';
    }
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];

    return `${month}/${day}/${year}`;
  }

  export function checkDueDate(dueDate, name){
    let newDueDate = converDate(dueDate.trim());
    checkDate(newDueDate, name);
    newDueDate = newDueDate.trim();
    let currentDate = new Date();
    let dd = new Date(newDueDate);
    currentDate.setHours(0, 0, 0, 0);
    dd.setHours(0,0,0,0);
    if(dd < currentDate){
        throw `Invalid Due Date`;
    }
  }