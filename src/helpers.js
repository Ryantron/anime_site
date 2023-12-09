//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.
import { ObjectId } from "mongodb";
/**
 * Errors
 * TypeError (wrong type) -> 400
 * RangeError (bad value provided by user even though type is correct) -> 400
 * DBError (Database errors) -> 500
 * ResourcesError (resources not found) -> 404
 */

export class DBError extends Error {
  constructor(msg) {
    super(msg);
  }
}
export class ResourcesError extends Error {
  constructor(msg) {
    super(msg);
  }
}

export function errorToStatus(error) {
  switch (error.name) {
    case "TypeError":
    case "RangeError":
      return 400;
    case "ResourcesError":
      return 404;
    case "DBError":
    default:
      return 500;
  }
}

export function createOptionalObject(name, value) {
  return value ? { [name]: value } : {};
}

const exportedMethods = {
  integerCheck(arg, { min = -Infinity, max = Infinity } = {}) {
    if (arg == undefined)
      throw new TypeError(`No value passed to integerCheck: ${arg}`);
    if (typeof arg !== "number") throw new TypeError(`${arg} must be a number`);
    if (!Number.isInteger(arg))
      throw new RangeError(`${arg} is not an integer`);
    if (arg < min)
      throw new RangeError(`${arg} is below min allowed value (${min})`);
    if (arg > max)
      throw new RangeError(`${arg} is above max allowed value (${max})`);

    return arg;
  },
  stringCheck(arg) {
    if (arg == undefined) {
      throw new TypeError(
        `You must provide a string input for your parameter ${arg}`
      );
    } else if (typeof arg !== "string") {
      throw new TypeError(`${arg} must be a string`);
    } else if (arg.trim().length == 0) {
      throw new RangeError(`string inputs cannot be empty space`);
    }
    return arg.trim();
  },

  inputCheck(username, emailAddress, password) {
    if (!username || !emailAddress || !password) {
      throw new TypeError("All inputs must be non-empty strings");
    }

    if (
      typeof username !== "string" ||
      typeof emailAddress !== "string" ||
      typeof password !== "string"
    ) {
      throw new TypeError("All inputs must be a string");
    }

    if (/\s/.test(username)) {
      throw new RangeError("username cannot contain empty spaces");
    }
    if (/\s/.test(password)) {
      throw new RangeError("password cannot contain empty spaces");
    }

    username = username.trim();
    emailAddress = emailAddress.trim();
    password = password.trim();

    const nameRegex = /^[A-Za-z0-9]{3}$/;
    if (nameRegex.test(username)) {
      throw new RangeError(
        "username must be at least 3 characters long and contain no special characters"
      );
    }

    this.passwordValidation(password);

    emailAddress = this.emailValidation(emailAddress);
  },

  usernameValidation(username) {
    this.stringCheck(username);
    if (/\s/.test(username)) {
      throw new RangeError("username cannot contain empty spaces");
    }
    username = username.trim();
    const nameRegex = /^[A-Za-z0-9]{3}$/;
    if (nameRegex.test(username)) {
      throw new RangeError(
        "username must be at least 3 characters long and contain no special characters"
      );
    }
    return username;
  },

  emailValidation(email) {
    this.stringCheck(email);
    email = email.trim();
    const emailCheck = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailCheck.test(email)) {
      throw new RangeError("emailAddress is not a valid email");
    }
    return email;
  },

  passwordValidation(password) {
    if (/\s/.test(password)) {
      throw new RangeError("password cannot contain empty spaces");
    }
    password = password.trim();
    const passRegex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^\&*\)\(+=._-])[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{8,}$/;
    if (!passRegex.test(password)) {
      throw new RangeError(
        "password must be at least 8 characters long and contain 1 special character, number, and uppercase letter"
      );
    }
    return password;
  },

  //TODO: pfp validation
  pfpValidation(pfp) {
    return pfp;
  },
};

export default exportedMethods;
