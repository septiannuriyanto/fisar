export function extractDatesFromReport(report: string): string[] {
  const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g;
  const dates: string[] = [];
  let match;

  while ((match = dateRegex.exec(report)) !== null) {
    const [_, day, month, yearRaw] = match;
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    dates.push(formattedDate);
  }

  return dates;
}
