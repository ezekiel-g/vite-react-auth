import fetchFromBackEnd from './fetchFromBackEnd.js'

const fetchWithRefresh = async (
    url,
    method = 'GET',
    headers = {},
    credentials = 'same-origin',
    body = null
) => {
    const fetchResult =
        await fetchFromBackEnd(url, method, headers, credentials, body)

    if (fetchResult && fetchResult.status !== 401) return fetchResult

    const backEndUrl = import.meta.env.VITE_BACK_END_URL
    const refreshData = await fetchFromBackEnd(
        `${backEndUrl}/api/v1/sessions/refresh-session`,
        'POST',
        'application/json',
        'include'
    )

    if (refreshData.status >= 200 && refreshData.status < 300) {
        window.location.href = '/sign-in'
        throw new Error('No active session')
    }

    const refreshedData =
        await fetchFromBackEnd(url, method, headers, credentials, body)

    return refreshedData
}

export default fetchWithRefresh
