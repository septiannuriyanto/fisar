import fs from 'fs';
import path from 'path';
import { sendQRViaMailjet } from './mailJet';


export function exportQRCodeToImage(dataUrl: string): void {
  const qrCodePath = path.join(__dirname, 'qrcode.png');

  // Validasi format data URL
  if (!dataUrl.startsWith('data:image/png;base64,')) {
    console.error('❌ Invalid data URL format for QR code.');
    return;
  }

  // Hapus prefix "data:image/png;base64,"
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

  fs.writeFile(qrCodePath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('❌ Failed to save QR code image:', err);
    } else {
      console.log('✅ QR code image saved successfully:', qrCodePath);
      // Kirim QR sebagai attachment via Mailjet
      sendQRViaMailjet(qrCodePath);
    }
  });
}
