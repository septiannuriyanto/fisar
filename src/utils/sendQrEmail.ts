import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
  dotenv.config();

const filePath = path.join(__dirname, 'qrcode.png');

export async function sendQrFromTerminal(qrText:string): Promise<void> {
  // 1. Tampilkan QR ke terminal (ASCII)
  qrcodeTerminal.generate(qrText, { small: true });

  // 2. Buat file gambar dari QR
  await QRCode.toFile(filePath, qrText, {
    color: {
      dark: '#000',
      light: '#fff'
    }
  });

  // 3. Kirim lewat email
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,          // Gunakan 465 untuk SSL
    secure: true,       // true wajib untuk port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: '"FISAR Auth Transponder 👋" <' + process.env.EMAIL_USER + '>',
    to: process.env.EMAIL_TO,
    subject: 'QR Code dari Terminal',
    text: 'Berikut QR Code yang tampil di terminal, kini dikirim dalam bentuk gambar.',
    html: '<p>QR Code terlampir dalam bentuk gambar.</p>',
    attachments: [
      {
        filename: 'qrcode.png',
        path: filePath
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    fs.unlinkSync(filePath); // hapus file setelah terkirim
  } catch (err) {
    console.error('Error sending email:', err);
  }
}
