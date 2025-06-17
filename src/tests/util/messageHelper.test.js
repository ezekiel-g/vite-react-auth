import { describe, it, expect, vi } from 'vitest'
import messageHelper from '../../util/messageHelper.jsx'

describe('messageHelper', () => {
    describe('showSuccesses', () => {
        it('returns null if messages array is empty', () => {
            const output = messageHelper.showSuccesses([])

            expect(output).toBeNull()
        })

        it('returns message divs for non-empty messages array', () => {
            const messages = ['Success 1', 'Success 2']
            const output = messageHelper.showSuccesses(messages)

            expect(output).toHaveLength(2)
            expect(output[0].props.children).toBe('Success 1')
            expect(output[1].props.children).toBe('Success 2')
        })
    })

    describe('showErrors', () => {
        it('returns null if messages array is empty', () => {
            const output =
                messageHelper.showErrors([], 'http://example.com')

            expect(output).toBeNull()
        })

        it('returns error message divs with resolution link', () => {
            const messages = ['Error 1', 'Error 2']
            const resolutionLink = 'http://example.com'
            const output =
                messageHelper.showErrors(messages, resolutionLink)

            expect(output).toHaveLength(2)
            expect(output[0].props.children).toContain('Error 1')
            expect(output[1].props.children).toContain('Error 2')

            expect(output[0].props.children).toContain(' — ')
            expect(output[0].props.children).toContain('http://example.com')
            expect(output[1].props.children).toContain(' — ')
            expect(output[1].props.children).toContain('http://example.com')
        })

        it('returns error message divs without link if not provided', () => {
            const messages = ['Error 1', 'Error 2']
            const output = messageHelper.showErrors(messages)

            expect(output).toHaveLength(2)
            expect(output[0].props.children).toContain('Error 1')
            expect(output[1].props.children).toContain('Error 2')
            expect(output[0].props.children).not.toContain(' —')
        })
    })

    describe('setMessagesWithTimeout', () => {
        it('sets messages and clears them after a timeout', () => {
            vi.useFakeTimers()
            
            const setMessages = vi.fn()
            const messages = ['Message 1']

            messageHelper.setMessagesWithTimeout(messages, setMessages)

            expect(setMessages).toHaveBeenCalledWith(messages)

            vi.advanceTimersByTime(2000)
            expect(setMessages).toHaveBeenCalledWith([])

            vi.restoreAllMocks()
        })
    })
})
