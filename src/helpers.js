//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.
import { ObjectId } from "mongodb";

const exportedMethods = {
  stringCheck(arg) {
    if (arg == undefined) {
      throw `You must provide a string input for your parameter ${arg}`;
    } else if (typeof arg !== "string") {
      throw `${arg} must be a string`;
    } else if (arg.trim().length == 0) {
      throw `string inputs cannot be empty space`;
    }
    return arg.trim();
  },


  inputCheck(username, emailAddress, password) {
    if (!username || !emailAddress || !password) {
      throw "All inputs must be non-empty strings";
    }

    if(typeof username !== "string" || typeof emailAddress !== "string" || typeof password !== "string"){
      throw "All inputs must be a string"
  }

    if (/\s/.test(username)) {
      throw "username cannot contain empty spaces";
    }
    if (/\s/.test(password)) {
      throw "password cannot contain empty spaces";
    }

    username = username.trim();
    emailAddress = emailAddress.trim();
    password = password.trim();

    const nameRegex = /^[A-Za-z0-9]{3}$/;
    if (nameRegex.test(username)) {
      throw "username must be at least 3 characters long and contain no special characters";
    }

    this.passwordValidation(password);

    emailAddress = this.emailValidation(emailAddress);
  },

  usernameValidation(username) {
    this.stringCheck(username);
    if (/\s/.test(username)) {
      throw "username cannot contain empty spaces";
    }
    username = username.trim();
    const nameRegex = /^[A-Za-z0-9]{3}$/;
    if (nameRegex.test(username)) {
      throw "username must be at least 3 characters long and contain no special characters";
    }
    return username;
  },

  emailValidation(email) {
    this.stringCheck(email);
    email = email.trim();
    const emailCheck = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailCheck.test(email)) {
      throw "emailAddress is not a valid email";
    }
    return email;
  },

  passwordValidation(password) {
    if (/\s/.test(password)) {
      throw "password cannot contain empty spaces";
    }
    password = password.trim();
    const passRegex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^\&*\)\(+=._-])[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{8,}$/;
    if (!passRegex.test(password)) {
      throw "password must be at least 8 characters long and contain 1 special character, number, and uppercase letter";
    }
    return password;
  },

  //TODO: pfp validation
  pfpValidation(pfp) {
    return pfp;
  },
};

export default exportedMethods;
