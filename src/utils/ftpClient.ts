import { Client } from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import { formatTodayToYYmmdd } from '../functions';

const localDir = 'D:/DATA/Download';
const remoteDir = '/prd/printout/';
const baseFilename = `PMR17R-BRCG-${formatTodayToYYmmdd()}.csv`;

const remoteFullPath = path.posix.join(remoteDir, baseFilename); // FTP pakai posix (forward slash)
const localFullPath = path.join(localDir, baseFilename);         // Lokal pakai OS default separator

export async function downloadFileFromFtp() {

    console.log(`📥 Downloading ${remoteFullPath} to ${localFullPath}...`);
    

  const client = new Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: '10.2.34.145',
      user: 'p61122356',
      password: 'Persada55',
      secure: false, // Ganti ke true jika pakai FTPS
    });

    console.log(`📥 Downloading ${remoteFullPath} to ${localFullPath}...`);
    await client.downloadTo(localFullPath, remoteFullPath);
    console.log(`✅ Downloaded to ${localFullPath}`);
  } catch (err) {
    console.error('❌ FTP error:', err);
    throw err;
  } finally {
    client.close();
  }
}
