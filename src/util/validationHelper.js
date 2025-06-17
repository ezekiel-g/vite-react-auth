import fetchFromBackEnd from './fetchFromBackEnd.js'

const backEndUrl = import.meta.env.VITE_BACK_END_URL

const getUsers = async () => {
    const fetchResult =
        await fetchFromBackEnd(`${backEndUrl}/api/v1/users`)
    return fetchResult.data
}

const checkForDuplicate = async (
    entryObject,
    fetchFunction,
    excludeIdForUpdate = null
) => {
    const fetchResult = await fetchFunction()

    if (fetchResult.length === 0 || !Array.isArray(fetchResult)) return 'pass'
    
    const [columnNameCamel] = Object.keys(entryObject)
    const columnNameSnake =
        columnNameCamel.replace(/([A-Z])/g, '_$1').toLowerCase()
    
    const rowValue = entryObject[columnNameCamel] 
        ? entryObject[columnNameCamel].toLowerCase() 
        : ''
    
    const hasDuplicate = fetchResult.some(row => {
        return row[columnNameSnake]?.toLowerCase() === rowValue && 
        row.id !== excludeIdForUpdate
    })
    
    return hasDuplicate ? 'fail' : 'pass'
}

const returnSuccess = (label, input, currentValue = null) => {
    if (
        currentValue !== null &&
        currentValue !== undefined &&
        input !== currentValue
    ) {
        return { valid: true, message: `${label} updated successfully` }
    }
    
    return { valid: true, message: null }
}

export default {
    getUsers,
    checkForDuplicate,
    returnSuccess
}
