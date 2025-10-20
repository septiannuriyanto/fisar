// src/baileysClient.ts

import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys';
import axios from 'axios';

export async function startBaileys() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const timestamp = msg.messageTimestamp?.toString() || Date.now();

    try {
      await axios.post('http://localhost:3000/webhook', {
        message: text,
        timestamp: timestamp,
      });
      console.log(`📩 Forwarded message: ${text}`);
    } catch (err) {
      console.error('❌ Failed to send to webhook:', err);
    }
  });
}
