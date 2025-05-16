const formatDateForSupabase = (input: string): string | null => {
    const match = input.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return null;
  
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  };


  const formatTodayToYYmmdd = (): string => {
    const today = new Date();
  
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // bulan dimulai dari 0
    const day = String(today.getDate()).padStart(2, '0');
  
    return `${year}${month}${day}`;
  };

  const formatTodayToYYmm = (): string => {
    const today = new Date();
  
    const year = String(today.getFullYear()).slice(2); // take last 2 digits
    const month = String(today.getMonth() + 1).padStart(2, '0');
  
    return `${year}${month}`;
  };
  

  const formatTodayToYYYYmm = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // bulan dimulai dari 0
  
    return `${year}${month}`;
  };

  const formatTodayToYYYYmmdd = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // bulan dimulai dari 0
    const day = String(today.getDate()).padStart(2, '0');
  
    return `${year}${month}${day}`;
  };

  export const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  function formatTanggalHariIni(): string {
    const today = new Date();
    
    // Mendapatkan hari
    const day = String(today.getDate()).padStart(2, '0'); // Pastikan 2 digit
    
    // Mendapatkan bulan dalam format 3 huruf (APR, JAN, dsb.)
    
    const month = monthNames[today.getMonth()];
    
    // Mendapatkan tahun dalam format 2 digit
    const year = String(today.getFullYear()).slice(-2); // Ambil 2 digit terakhir dari tahun
    
    return `${day} ${month} ${year}`;
  }


  function formatFolderInventory(): string {
    const today = new Date();
    
    // Mendapatkan hari
    const day = String(today.getDate()).padStart(2, '0'); // Pastikan 2 digit
    
    // Mendapatkan bulan dalam format 3 huruf (APR, JAN, dsb.)
    const month = monthNames[today.getMonth()];
    
    // Mendapatkan tahun dalam format 2 digit
    const year = String(today.getFullYear()).slice(-2); // Ambil 2 digit terakhir dari tahun
    
    return `${String(today.getMonth()+1).padStart(2, '0')} ${month} ${year}`;
  }

  function formatFolderPurchasing(): string {
    const today = new Date();
    
    // Mendapatkan hari
    const day = String(today.getDate()).padStart(2, '0'); // Pastikan 2 digit
    
    // Mendapatkan bulan dalam format 3 huruf (APR, JAN, dsb.)
    const month = monthNames[today.getMonth()];
    
    // Mendapatkan tahun dalam format 2 digit
    const year = String(today.getFullYear()).slice(-2); // Ambil 2 digit terakhir dari tahun
    
    return `${String(today.getMonth()+1).padStart(2, '0')} ${month}`;
  }

  function formatTanggalHariIniTodDMMyy(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0'); // Menambahkan 0 di depan hari jika kurang dari 10
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Menambahkan 0 di depan bulan jika kurang dari 10
    const year = String(today.getFullYear()).slice(-2); // Mengambil dua digit terakhir dari tahun
  
    // Format menjadi ddmmyy (contoh: 150425)
    return `${day}${month}${year}`;
  }

  function formatTanggalHariIniDdMmYy(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0'); // Menambahkan 0 di depan hari jika kurang dari 10
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Menambahkan 0 di depan bulan jika kurang dari 10
    const year = String(today.getFullYear()).slice(-2); // Mengambil dua digit terakhir dari tahun
  
    // Format menjadi ddmmyy (contoh: 150425)
    return `${day}/${month}/${year}`;
  }
  
  const formattedDate = formatTanggalHariIni();
  console.log(formattedDate); // Output: "04 APR 25" (tergantung pada tanggal hari ini)
  
  


  export {
    formatDateForSupabase,
    formatTodayToYYmmdd,
    formatTodayToYYmm,
    formatTodayToYYYYmmdd,
    formatTodayToYYYYmm,
    formatTanggalHariIni,
    formatTanggalHariIniTodDMMyy,
    formatFolderInventory,
    formatFolderPurchasing,
    formatTanggalHariIniDdMmYy
   };