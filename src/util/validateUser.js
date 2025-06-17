import bcryptjs from 'bcryptjs'
import validationHelper from './validationHelper.js'

const validateUsername = async (
    input,
    currentValue = null,
    excludeId = null,
    skipDuplicateCheck = null
) => {
    if (!input || input.trim() === '') {
        return { valid: false, message: 'Username required' }
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9._]{2,19}$/.test(input)) {
        return {
            valid: false,
            message: 'Username must be between 3 and 20 characters, start ' +
                     'with a letter or an underscore and contain only ' +
                     'letters, numbers periods and underscores'
        }
    }

    if (!skipDuplicateCheck) {
        const duplicateCheck = await validationHelper.checkForDuplicate(
            { username: input },
            validationHelper.getUsers,
            excludeId
        )
        
        if (duplicateCheck !== 'pass') {
            return { valid: false, message: 'Username taken' }
        }
    }

    return validationHelper.returnSuccess('Username', input, currentValue)
}

const validateEmail = async (
    input,
    currentValue = null,
    excludeId = null,
    skipDuplicateCheck = null
) => {
    if (!input || input.trim() === '') {
        return { valid: false, message: 'Email address required' }
    }
    
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(input)) {
        return {
            valid: false,
            message: 'Email address must contain only letters, numbers, ' +
                     'periods, underscores, hyphens, plus signs and percent ' +
                     'signs before the "@", a domain name after the "@", and ' +
                     'a valid domain extension (e.g. ".com", ".net", ".org") ' +
                     'of at least two letters'
        }
    }
    
    if (!skipDuplicateCheck) {
        const duplicateCheck = await validationHelper.checkForDuplicate(
            { email: input },
            validationHelper.getUsers,
            excludeId
        )
        
        if (duplicateCheck !== 'pass') {
            return { valid: false, message: 'Email address taken' }
        }
    }
    
    return validationHelper.returnSuccess('Email address', input, currentValue)
}

const validatePassword = async (
    input,
    currentValue,
    userId = null
) => {
    if (!input) {
        return { valid: false, message: 'Password required' }
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{16,}$/.test(input)) {
        return {
            valid: false,
            message: 'Password must be at least 16 characters and include at ' +
                     'least one lowercase letter, one capital letter, one ' +
                     'number and one symbol (!@#$%^&*)'
        }
    }

    if (userId) {
        if (await bcryptjs.compare(input, currentValue)) {
            return {
                valid: false,
                message: 'New password same as current password'
            }
        }
    }
    
    return validationHelper.returnSuccess('Password', input, currentValue)
}

const validateUser = async (
    inputObject,
    excludeId = null,
    skipDuplicateCheck = null    
) => {
    const { username, email, password, reEnteredPassword } = inputObject
    const validationErrors = []
    const successfulUpdates = []
    let currentDetails = null
    
    if (excludeId) {
        excludeId = Number(excludeId)
        const users = await validationHelper.getUsers()
        currentDetails = users.find(row => row.id === excludeId)
    }

    const usernameValid = await validateUsername(
        username,
        currentDetails?.username,
        excludeId,
        skipDuplicateCheck
    )

    if (!usernameValid.valid) {
        validationErrors.push(usernameValid.message)
    } else {
        if (usernameValid.message) {
            successfulUpdates.push(usernameValid.message) 
        }
    }
    
    const emailValid = await validateEmail(
        email,
        currentDetails?.email,
        excludeId,
        skipDuplicateCheck
    )

    if (!emailValid.valid) {
        validationErrors.push(emailValid.message)
    } else {
        if (emailValid.message) {
            successfulUpdates.push(emailValid.message) 
        }
    }

    const passwordValid = await validatePassword(
        password,
        currentDetails?.password,
        excludeId
    )

    if (!passwordValid.valid) {
        if (!(excludeId && !password && !reEnteredPassword)) {
            validationErrors.push(passwordValid.message)
        }
    } else {
        if (passwordValid.message) {
            successfulUpdates.push(passwordValid.message) 
        }
    }

    if (
        password !== reEnteredPassword &&
        !(excludeId && !password && !reEnteredPassword)
    ) {
        validationErrors.push('Passwords must match')
    }

    if (
        excludeId &&
        validationErrors.length === 0 &&
        successfulUpdates.length === 0
    ) {
        validationErrors.push('No changes detected')
    }
    
    if (validationErrors.length > 0) {
        return { valid: false, validationErrors }
    }

    return { valid: true } 
}

export default validateUser
