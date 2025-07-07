import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import emailjs from 'emailjs-com'; // ✅ gunakan ini untuk Node.js
import dotenv from 'dotenv';

dotenv.config();

const serviceID = process.env.EMAILJS_SERVICE!;
const templateID = process.env.EMAILJS_TEMPLATE!;
const publicKey = process.env.EMAILJS_PUBLIC!;
const toEmail = process.env.EMAIL_TO!;

export async function sendQRByEmailJS(qrCode: string) {
  const qrPath = path.join(__dirname, 'qr.png');

  try {
    // Validasi variabel environment
    if (!serviceID || !templateID || !publicKey || !toEmail) {
      throw new Error('EmailJS environment variables are not properly set.');
    }

    // 1. Generate QR code as image file
    await QRCode.toFile(qrPath, qrCode);

    // 2. Convert image to base64 string
    const imageBase64 = fs.readFileSync(qrPath).toString('base64');

    // 3. Send email via EmailJS
    const result = await emailjs.send(
      serviceID,
      templateID,
      {
        to_email: toEmail,
        message: qrCode,
        qr_image: `data:image/png;base64,${imageBase64}`,
      },
      publicKey
    );

    console.log('✅ QR sent via EmailJS!', result.status);
  } catch (err) {
    console.error('❌ Failed to send QR via EmailJS:', err);
  } finally {
    // 4. Cleanup temporary file
    if (fs.existsSync(qrPath)) {
      fs.unlinkSync(qrPath);
    }
  }
}
