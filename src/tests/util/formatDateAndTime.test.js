import { describe, it, expect } from 'vitest'
import formatDateAndTime from '../../util/formatDateAndTime'

describe('formatDateAndTime', () => {
    it('returns formatted date without time if "date" is passed in', () => {
        const formattedDateAndTime =
            formatDateAndTime('2024-05-01T00:00:00', 'date')

        expect(formattedDateAndTime).toBe('2024-05-01')
    })

    it('returns formatted datetime if second argument is not "date"', () => {
        const formattedDateAndTime =
            formatDateAndTime('2024-05-01T15:30:00', 'datetime')

        expect(formattedDateAndTime).toBe('2024-05-01 at 3:30 PM')
    })

    it('returns "Invalid date" for empty input', () => {
        const formattedDateAndTime = formatDateAndTime('')

        expect(formattedDateAndTime).toBe('Invalid date')
    })

    it('returns "Invalid date" for null input', () => {
        const formattedDateAndTime = formatDateAndTime(null)

        expect(formattedDateAndTime).toBe('Invalid date')
    })
})
