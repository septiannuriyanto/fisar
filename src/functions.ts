const formatDateForSupabase = (input: string): string | null => {
    const match = input.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return null;
  
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  };


  export { formatDateForSupabase };