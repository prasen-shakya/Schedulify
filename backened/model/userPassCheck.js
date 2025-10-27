// this module contains general funuctions that might be used elsewhere


/**
 * checkPassword checks a given password to see if it meets requirements
 * @param password string
 * @returns {boolean} for whether it passes
 */
function checkPassword(password) {
    if (password.length < 8) {
        return false;
    }
    else if (!hasSpecChar(string)) {
        return false;
    }
    else if (!hasCap(password)) {
        return false;
    }
    else return hasNum(string);
}

/**
 * hasCap checks a string to see if it contains a capital letter
 * @param string
 * @returns {boolean}
 */
function hasCap(string) {
    return /[A-Z]/.test(string);
}

/**
 * hasNum checks a string to see if it contains a capital letter
 * @param string
 * @returns {boolean}
 */
function hasNum(string) {
    return /[0-9]/.test(string);
}

/**
 * hasSpecChar checks a string to see if it contains a special character
 * @param string
 * @returns {boolean}
 */
function hasSpecChar(string) {
    return /[^a-zA-Z0-9\s]/.test(string);

}

export default userPassCheck;