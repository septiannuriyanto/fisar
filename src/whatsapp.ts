// src/whatsapp.ts
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { handleMessage } from './handlers/messageHandler';
import { isWithinShift } from './scheduler';
import * as qrcode from 'qrcode-terminal';
import { GROUP_WHITELIST } from './group-whitelist';

export const startWhatsAppBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      // ⬇️ Ini dia bagian yang kamu butuhin
      qrcode.generate(qr, { small: true });
      console.log('🔑 Scan QR di atas untuk login...');
    }
  
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Connection closed. Reconnecting...', shouldReconnect);
      if (shouldReconnect) startWhatsAppBot();
    } else if (connection === 'open') {
      console.log('✅ Bot connected to WhatsApp!');
    }
  });


  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
  
    const remoteJid = msg.key.remoteJid;
  
    // ✅ Ambil semua nilai dari object whitelist (bukan key-nya)
    const allowedGroups = Object.values(GROUP_WHITELIST);
  
    // ✅ Cek kalau bukan grup atau tidak ada di whitelist
    if (!remoteJid?.endsWith('@g.us') || !allowedGroups.includes(remoteJid)) {
      console.log(`⛔ Grup tidak di-whitelist: ${remoteJid}`);
      return;
    }
  
    const messageText =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      '';
  
    const timestamp =
      parseInt(msg.messageTimestamp?.toString()!) || Date.now();
  
    if (!isWithinShift()) {
      console.log('⛔ Bot is outside of shift hours');
      return;
    }
  
    console.log(`💬 New message from ${remoteJid}:`, messageText);
  
    try {
      await handleMessage(messageText, timestamp);
    } catch (err) {
      console.error('❌ Error handling message:', err);
    }
  });
  
};

