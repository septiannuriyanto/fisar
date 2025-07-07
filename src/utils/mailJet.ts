import mailjet from 'node-mailjet';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const mj = mailjet.apiConnect(
  process.env.MAILJET_API_KEY!,
  process.env.MAILJET_API_SECRET!
);

export async function sendQRViaMailjet(filePath: string): Promise<void> {
  try {
    // Pastikan file ada
    if (!fs.existsSync(filePath)) {
      throw new Error(`QR code file not found at: ${filePath}`);
    }

    const imageBuffer = fs.readFileSync(filePath);
    const imageBase64 = imageBuffer.toString('base64');
    const filename = path.basename(filePath); // misalnya "qrcode.png"

    const response = await mj.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_FROM!,
            Name: 'FISAR Surfers',
          },
          To: [
            {
              Email: process.env.EMAIL_TO!,
              Name: 'Admin',
            },
          ],
          Subject: 'Verifikasi Ulang Bot FISAR – QR Code Login',
          HTMLPart: `
            <p>Bot FISAR mengalami cold restart.</p>
            <p>Scan QR code di bawah ini untuk autentikasi ulang.</p>
            <p>Jika Anda tidak mengenali aktivitas ini, abaikan email ini.</p>

            <img src="cid:qrcode@fisar" alt="QR Code" />

          `,
          Attachments: [
            {
              ContentType: 'image/png',
              Filename: filename,
              Base64Content: imageBase64,
              ContentID: 'qrcode@fisar',
              ContentDisposition: 'inline',
            },
          ],
        },
      ],
    });

    console.log('✅ Email sent via Mailjet:', response.body);
  } catch (err) {
    console.error('❌ Failed to send QR via Mailjet:', err);
  } finally {
    // Auto-clean QR code file
    // if (fs.existsSync(filePath)) {
    //   fs.unlinkSync(filePath);
    //   console.log('🧹 QR file cleaned up:', filePath);
    // }
  }
}
