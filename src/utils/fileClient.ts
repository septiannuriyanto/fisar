import fs from 'fs';
import path from 'path';
import { formatFolderInventory, formatFolderPurchasing, formatTanggalHariIni, formatTanggalHariIniTodDMMyy } from '../functions';
import { readExcelAndFilter221 } from '../jobs/readExcel221';
import { syncPoFuelDataWithRetry } from '../services/updatePo/updatePoService';

// Fungsi untuk memastikan direktori tujuan ada, jika tidak buat
function ensureDirectoryExists(directory: string): void {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Fungsi untuk menyalin file dari direktori sumber ke direktori lokal
export function copyFiles(sourceFile: string, targetDirectory: string) {
    const fileName = path.basename(sourceFile); // Ambil nama file dari path sumber
    const destinationPath = path.join(targetDirectory, fileName);
  
    // Pastikan direktori tujuan ada
    if (!fs.existsSync(targetDirectory)) {
      fs.mkdirSync(targetDirectory, { recursive: true });
    }
  
    // Salin file
    fs.copyFileSync(sourceFile, destinationPath);
  }


  //==================================================================================================================Remote Directory
  export function  generateSourceDirectoryInventory(): string {
    return `S:\\8. Inventory\\01 17RA`;
  }
  export function generateSourceDirectoryPurchasing(): string {
    return `S:\\9. Purchasing\\01 OST PO`;
  }

  export function generateSourceDirectory17RA(): string {
    return `${generateSourceDirectoryInventory()}\\${new Date().getFullYear()}\\${formatFolderInventory()}`;
  }
  export function generateSourceDirectory221(): string {
    return `${generateSourceDirectoryPurchasing()}\\${new Date().getFullYear()}\\${formatFolderPurchasing()}`;
  }

  //==================================================================================================================File Naming Convention
  export function generate17RAFileName(): string {
    return `17RA ${formatTanggalHariIniTodDMMyy()}.xlsx`;
  }
  export function generate221FileName(): string {
    return `OST PO ${formatTanggalHariIniTodDMMyy()}.xlsx`;
  }
  //==================================================================================================================File Path

  export function findSourceFile17RA(): string {
    const namaFile = generate17RAFileName();
    const sourceDirectory = `${generateSourceDirectory17RA()}\\${namaFile}`;
    return sourceDirectory;
  }

  export function findSourceFile221(): string {
    const namaFile = generate221FileName();
    const sourceDirectory = `${generateSourceDirectory221()}\\${namaFile}`;
    return sourceDirectory;
  }

  //==================================================================================================================Local Directory
  export function generateLocalDirectory(): string {
    const localDirectory = 'D:\\DATA\\Download'; // Gantilah dengan folder lokal tujuan
    return localDirectory;
  }
  export function generateLocalDirectory17RA(): string {
    const localDirectory = 'D:\\DATA\\Download\\17RA'; // Gantilah dengan folder lokal tujuan
    return localDirectory;
  }
  export function generateLocalDirectory221(): string {
    const localDirectory = 'D:\\DATA\\Download\\221'; // Gantilah dengan folder lokal tujuan
    return localDirectory;
  }

  export function generateToday17RAFilePath():string{
    const localDirectory = generateLocalDirectory17RA()
    const namaFile = generate17RAFileName();
    const today17RAFilePath = path.join(localDirectory, namaFile);
    return today17RAFilePath;
  }

  export function generateToday221FilePath():string{
    const localDirectory = generateLocalDirectory221()
    const namaFile = generate221FileName();
    const today221FilePath = path.join(localDirectory, namaFile);
    return today221FilePath;
  }

//==================================================================================================================Export functions
export function copy17Ra(){
    //Define file path
    const sourceFile = findSourceFile17RA(); // Sumber file dari server
    const localDirectory = generateLocalDirectory17RA(); // Folder lokal tujuan
    // Menjalankan fungsi untuk menyalin file
    copyFiles(sourceFile, localDirectory);
}

export async function copy221(){
    //Define file path
    const sourceFile = findSourceFile221(); // Sumber file dari server
    const localDirectory = generateLocalDirectory221(); // Folder lokal tujuan
    // Menjalankan fungsi untuk menyalin file
    copyFiles(sourceFile, localDirectory);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate async operation
    const data = readExcelAndFilter221(generateToday221FilePath());
    console.log('Data 221 : ', data);
    await syncPoFuelDataWithRetry(data);
}

//S:\8. Inventory\01 17RA\2025\04 APR 25
//S:\8. Inventory\01 17RA\2025\04 APR 25\17 RA 150425.xlsx