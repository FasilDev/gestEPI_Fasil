import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formats a date string into dd/MM/yyyy format
 * @param dateStr Date string or Date object to format
 * @returns Formatted date string or fallback character if date is invalid
 */
export const formatDate = (dateStr: any): string => {
  if (!dateStr) return '-';

  // Si c'est un objet vide 
  if (typeof dateStr === 'object' && Object.keys(dateStr).length === 0) {
    console.log('Objet date vide détecté');
    return '-';
  }
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return '-'; // Invalid date
    }
    return format(date, 'dd/MM/yyyy', { locale: fr });
  } catch (e) {
    console.error('Error formatting date:', dateStr, e);
    return '-';
  }
}; 