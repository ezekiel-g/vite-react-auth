const formatDateAndTime = (utcString, dateOrDatetime = null) => {
    if (!utcString) return 'Invalid date'

    const utcDate = new Date(utcString)
    const dateOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }
    const localDate = utcDate.toLocaleString('en-US', dateOptions)
    const [datePart, timePart] = localDate.split(', ')
    const [month, day, year] = datePart.split('/')
    
    if (dateOrDatetime === 'date') {
        return `${year}-${month}-${day}`
    }
    
    const [hour, minute, period] = timePart.split(/[: ]/)
    const formattedHour = hour.startsWith('0') ? hour[1] : hour
    const formattedDateAndTime =
        `${year}-${month}-${day} at ${formattedHour}:${minute} ${period}`

    return formattedDateAndTime
}

export default formatDateAndTime
