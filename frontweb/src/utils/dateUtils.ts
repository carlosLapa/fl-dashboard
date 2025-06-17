/**
 * Formats a date string to a localized format
 * @param dateString The date string to format
 * @param locale The locale to use (defaults to 'pt-PT')
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  locale: string = 'pt-PT'
): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original if formatting fails
  }
};

/**
 * Formats a date string to include time
 * @param dateString The date string to format
 * @param locale The locale to use (defaults to 'pt-PT')
 * @returns Formatted date and time string
 */
export const formatDateTime = (
  dateString: string,
  locale: string = 'pt-PT'
): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return dateString; // Return original if formatting fails
  }
};
