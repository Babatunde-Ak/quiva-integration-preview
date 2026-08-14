/**
 * Formats a number into shorthand notation with appropriate suffix
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "1.2K", "3.5M", "1.1B")
 *
 * @example
 * formatNumberShorthand(1234) // "1.2K"
 * formatNumberShorthand(1234567) // "1.2M"
 * formatNumberShorthand(1234567890) // "1.2B"
 * formatNumberShorthand(999) // "999"
 * formatNumberShorthand(1500, 2) // "1.50K"
 */
export function formatNumberShorthand(value : number, decimals : number = 1) : string {
    if(value < 1000) {
        return value.toString()
    }

    const suffixes = ['', 'K', 'M', 'B', 'T']
    const tier = Math.floor(Math.log10(Math.abs(value)) / 3)
    if (tier === 0) {
        return value.toString()
    }

    const suffix = suffixes[tier]
    const scale = Math.pow(10, tier * 3)
    const scaled = value / scale 
    return scaled.toFixed(decimals) + suffix
}

/**
 * Formats a number with commas as thousand separators
 * @param value - The number to format
 * @returns Formatted string with commas (e.g., "1,234,567")
 *
 * @example
 * formatNumberWithCommas(1234567) // "1,234,567"
 * formatNumberWithCommas(999) // "999"
 */
export function formatNumberWithCommas(value : number) : string {
    return value
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Formats a number into compact notation using Intl.NumberFormat
 * @param value - The number to format
 * @param locale - The locale to use (default: 'en-US')
 * @param notation - The notation style (default: 'compact')
 * @returns Formatted string
 *
 * @example
 * formatNumberCompact(1234) // "1.2K"
 * formatNumberCompact(1234567) // "1.2M"
 * formatNumberCompact(1234567, 'en-US', 'standard') // "1,234,567"
 */
export function formatNumberCompact(value : number, locale : string = 'en-US', notation : 'compact' | 'standard' = 'compact') : string {
    return new Intl
        .NumberFormat(locale, {
        notation: notation,
        maximumFractionDigits: 1
    })
        .format(value)
}