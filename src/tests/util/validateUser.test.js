import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import validateUser from '../../util/validateUser.js'
import validationHelper from '../../util/validationHelper.js'

vi.mock('../../util/validationHelper.js')

describe('validateEmployee', () => {
    const defaultInput = {
        username: 'User1',
        email: 'user1@example.com',
        password: 'Password&123456789',
        reEnteredPassword: 'Password&123456789'
    }

    const existingUsers = [
        {
            id: 1,
            username: 'User1',
            email: 'user1@example.com',
            password: 'Password&123456789'
        },
        {
            id: 2,
            username: 'User2',
            email: 'user2@example.com',
            password: 'Password&987654321'
        }
    ]

    let inputObject

    beforeEach(() => {
        inputObject = Object.assign({}, defaultInput)
        validationHelper.checkForDuplicate.mockResolvedValue('pass')
        validationHelper.returnSuccess
            .mockReturnValue({ valid: true, message: '' })
        vi.spyOn(validationHelper, 'getUsers').mockResolvedValue(existingUsers)
    })

    afterEach(() => { vi.clearAllMocks() })

    it('returns validation error for empty username', async () => {
        inputObject.username = ''
        const validationResult = await validateUser(inputObject)

        expect(validationResult).toEqual({
            valid: false,
            validationErrors: ['Username required']
        })
    })

    it('returns validation error for invalid username format', async () => {
        inputObject.username = 'User&'
        const validationResult = await validateUser(inputObject)

        expect(validationResult).toEqual({
            valid: false,
            validationErrors:
                expect.arrayContaining([expect.stringContaining('must be')])
        })
    })

    it('returns validation error for empty email', async () => {
        inputObject.email = ''
        const validationResult = await validateUser(inputObject)

        expect(validationResult).toEqual({
            valid: false,
            validationErrors: ['Email address required']
        })
    })

    it('returns validation error for invalid email format', async () => {
        inputObject.email = 'user1&example.com'
        const validationResult = await validateUser(inputObject)

        expect(validationResult).toEqual({
            valid: false,
            validationErrors:
                expect.arrayContaining([expect.stringContaining('must contai')])
        })
    })

    it('returns validation error for duplicates', async () => {
        validationHelper.checkForDuplicate.mockResolvedValue('fail')
        const validationResult = await validateUser(inputObject)
        
        expect(validationResult).toEqual({
            valid: false,
            validationErrors:
                expect.arrayContaining([expect.stringContaining('taken')])
        })
    })

    it('returns validation error for invalid password format', async () => {
        inputObject.password = 'badpassword'
        const validationResult = await validateUser(inputObject)

        expect(validationResult).toEqual({
            valid: false,
            validationErrors:
                expect.arrayContaining([expect.stringContaining('must be')])
        })
    })

    it('returns validation error if password not re-entered', async () => {
        inputObject.reEnteredPassword = ''
        const validationResult = await validateUser(inputObject)
        console.log(inputObject)
        expect(validationResult).toEqual({
            valid: false,
            validationErrors:
                expect.arrayContaining(['Passwords must match'])
        })
    })

    it('returns error when no changes are detected', async () => {
        const validationResult = await validateUser(inputObject, 1)

        expect(validationResult).toEqual({
            valid: false,
            validationErrors: ['No changes detected']
        })
    })

    it('returns { valid: true } if no validation errors', async () => {
        const validationResult = await validateUser(inputObject)

        expect(validationResult.valid).toEqual(true)
    })
})
