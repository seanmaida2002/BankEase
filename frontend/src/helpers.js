/* eslint-disable no-useless-escape */
export function checkValidEmail(email) {
  if (email.trim().length <= 0) {
    return "Email not provided";
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;

  if (!emailPattern.test(email)) {
    return `Invalid Email`;
  }

  return email;
}

export function checkValidName(param, name) {
  const nameRegex = /[^a-zA-Z-]/;
  if (param.trim().length === 0 || param.trim() === "") {
    return `${name} not provided`;
  }

  if (nameRegex.test(param)) {
    return `Invalid ${name}`;
  }

  return param;
}

export function checkYear(year) {
  //year must be passed in as a number, Number(year), not as a string

  if (!year) {
    return `Year not provided`;
  }
  if (typeof year !== "number") {
    return `Year must be a number`;
  }
  const currentYear = new Date().getFullYear();
  if (year > currentYear || year < 1400 || year <= 0) {
    return `Invalid Year`;
  }
}

export function checkDate(date, varName) {
  date = date.trim();
  if (date.length === 0 || date === "") {
    return `${varName} not provided`;
  }

  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!regex.test(date)) {
    return `Invalid Date`;
  }

  const [month, day, year] = date.split("/");
  if (month === "02") {
    if (day === "30") {
      return `Invalid Date`;
    }
    if (!((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
      if (day === "29") {
        return `Invalid Date`;
      }
    }
  }
  if (month === "04" || month === "06" || month === "09" || month === "11") {
    if (day === "31") {
      return `Invalid Date`;
    }
  }
  checkYear(Number(year));

  return date;
}

export function checkDateOfBirth(dob, varName) {
  if (!dob) {
    return `${varName} not provided`;
  }
  checkDate(dob, varName);

  return dob;
}

export function checkValidAge(dateOfBirth, varName) {
  if (!dateOfBirth) {
    throw `${varName} not provided`;
  }
  if (typeof dateOfBirth !== "string") {
    throw `${varName} must be a string`;
  }

  const [month, day, year] = dateOfBirth.split("/");
  const dob = new Date(year + "-" + month + "-" + day);
  const currentDate = new Date();
  let age = currentDate.getFullYear() - dob.getFullYear();
  const monthDifference = currentDate.getMonth() - dob.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && currentDate.getDate() < dob.getDate())
  ) {
    age--;
  }
  if (age < 18) {
    return "You must at least 18 years old to use this website.";
  }
  return true;
}

export function checkValidPassword(password, name) {
  if (password.trim().length <= 0) {
    return "Password not provided";
  }
  if (password.length <= 7) {
    return `${name} must be at least eight characters long.`;
  }

  const uppercaseRegex = /[A-Z]/;
  const digitRegex = /\d/;
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

  if (!uppercaseRegex.test(password)) {
    return `${name} must contain at least one capital letter, at least one digit, and at least one special character.`;
  }

  if (!digitRegex.test(password)) {
    return `${name} must contain at least one capital letter, at least one digit, and at least one special character.`;
  }

  if (!specialCharRegex.test(password)) {
    return `${name} must contain at least one capital letter, at least one digit, and at least one special character.`;
  }

  return true;
}

export function checkBalanceALert(balance) {
  if (balance.trim().length <= 0) {
    return "Balance not provided";
  }
  if (isNaN(balance)) {
    return "Balance must be a valid number";
  }
  balance = balance.trim();
  let num = Number(balance);
  if (num <= 0) {
    return "Balance must be greater than 0";
  }
  if (balance.includes(".")) {
    if (balance.split(".")[1].length > 2) {
      return "Balance must be a valid number";
    }
  }
  return balance;
}

export function converDate(date, name){
    //MM/DD/YYYY
    if(!date || date.trim().length <= 0){
        throw `${name} must be provided`;
    }
    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
      return 'Invalid date format';
    }
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];

    return `${month}/${day}/${year}`;
  }

export function checkDueDate(dueDate, name){
    if(!dueDate || dueDate.trim().length <= 0){
        return `${name} must be provided`;
    }
    let newDueDate = converDate(dueDate.trim(), name);
    if(!newDueDate.includes('/')){
        return 'Invalid Date';
    }
    checkDate(newDueDate, name);
    newDueDate = newDueDate.trim();
    let currentDate = new Date();
    let dd = new Date(newDueDate);
    currentDate.setHours(0, 0, 0, 0);
    dd.setHours(0,0,0,0);
    if(dd < currentDate){
        return `Invalid Due Date`;
    }
    return dueDate;
  }

export function checkAmount(amount) {
  if (!amount) {
    return `Amount not provided`;
  }
  if (amount <= 0) {
    return `Amount must be greater than 0`;
  }
  let x = amount.toString();
  if (x.includes(".")) {
    if (x.split(".")[1].length > 2) {
      return `Amount must be a valid number`;
    }
  }
  return amount;
}

export function checkString(param, name){
    if(!param || param.trim().length <= 0){
        return `${name} not provided`;
    }
    return param.trim();
}
