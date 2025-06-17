import { describe, it, expect, vi } from 'vitest'
import fetchWithRefresh from '../../util/fetchWithRefresh.js'

describe('fetchWithRefresh', () => {
    it('returns correct response if first fetch is successful', async () => {
        const mockResponse = { message: 'Success', data: { key: 'value' } }
        const mockFetch = vi.fn().mockResolvedValue({
            status: 200,
            statusText: 'OK',
            json: vi.fn().mockResolvedValue(mockResponse)
        })

        vi.stubGlobal('fetch', mockFetch)

        const fetchResult = await fetchWithRefresh('https://api.example.com')

        expect(fetchResult.status).toBe(200)
        expect(fetchResult.statusText).toBe('OK')
        expect(fetchResult.data).toEqual(mockResponse)
        expect(fetchResult.message).toBe('Success')
        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(mockFetch).toHaveBeenCalledWith('https://api.example.com', {
            method: 'GET',
            headers: {},
            credentials: 'same-origin'
        })

        vi.unstubAllGlobals()
    })

    it('throws an error if the session refresh request fails', async () => {
        const mockFetch = vi.fn()
            .mockResolvedValueOnce({
                status: 401,
                statusText: 'Unauthorized',
                json: vi.fn().mockResolvedValue({})
            })
            .mockResolvedValueOnce({
                status: 500,
                statusText: 'Internal Server Error',
                json: vi.fn().mockResolvedValue({})
            })

        vi.stubGlobal('fetch', mockFetch)

        const fetchResult = await fetchWithRefresh('https://api.example.com')

        expect(fetchResult.status).toBe(500)
        expect(fetchResult.statusText).toBe('Internal server error')
        expect(fetchResult.data).toBeNull()

        vi.unstubAllGlobals()
    })
})
