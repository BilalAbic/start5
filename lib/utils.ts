export function formatDate(date: Date | string): string {
  const d = new Date(date);
  
  // Format as Turkish date: 10 Ocak 2023
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return d.toLocaleDateString('tr-TR', options);
} 