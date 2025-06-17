const fetchFromBackEnd = async (
    url,
    method = 'GET',
    headers = {},
    credentials = 'same-origin',
    body = null
) => {
    try {
        let safeHeaders = {}

        if (typeof headers === 'string') {
            safeHeaders['Content-Type'] = headers
        } else {
            safeHeaders = Object.assign({}, headers)
        }

        if (body && !safeHeaders['Content-Type']) {
            safeHeaders['Content-Type'] = 'application/json'
        }

        const options = {
            method,
            headers: safeHeaders,
            credentials
        }

        if (body) options.body = JSON.stringify(body)

        const response = await fetch(url, options)
        const responseData = await response.json().catch(() => ({}))

        return {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
            message: responseData.message ||
                     `HTTP ${response.status}: ${response.statusText}`
        }
    } catch (error) {
        console.error('Error:', error.message)
        
        return {
            status: 500,
            statusText: 'Internal server error',
            data: null,
            message: error.message || 'Unable to fetch data'
        }
    }
}

export default fetchFromBackEnd
