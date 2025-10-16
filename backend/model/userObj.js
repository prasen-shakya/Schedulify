// module is for the User Class
//


const generalFunc = require("./userPassCheck");
const stringSearch = require("./userPassCheck");
const hasCap = require("./userPassCheck");
const hasNum = require("./userPassCheck");
const hasSpecChar = require("./userPassCheck");
const AvailObj = require("./availObj");
const idSize = 10000000;


class User {
    constructor(name, email, password) {
        this.name = name;

        this.email = email;

        this.password = password;

        this.userID = this.generateID();

        this.availability = [];
    }

    /**
    Checks if email already exists
     */
    checkEmail(email) {
        return true; // CHANGE THIS
    }

    /**
    checkPasswoerd checks if a password is valid
    - one special character !@#$%^&*
    - one capitalized character
    - one number
    - at least 8 characters in length
     */
    checkPassword(password) {
        if (password.length < 8) {
            return false;
        }
        else if (!hasSpecChar(string)) {
            return false;
        }
        else if (!hasCap(password)) {
            return false;
        }
        else if (!hasNum(string)) {
            return false;
        }
        else {
            return true;
        }
        return true;
    }

    /**
     * generateID creates a unique
     * identifier for a user
     */
    generateID() {
        var temp = Math.random() * idSize;

        // check that no other ID's like this exist

        return temp;
    }
}

module.exports = User;

