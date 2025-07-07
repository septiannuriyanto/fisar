import { EventEmitter } from 'events';
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  WASocket,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as qrcode from 'qrcode-terminal';
import { handleMessage } from './handlers/messageHandler';
import { DEV_MODE } from './handlers/messageHandler';
import { GROUP_LIST, GROUP_WHITELIST } from './group-whitelist';
import { isWithinShift } from './scheduler';
import store from './store';
import { getSockInstance, setSockInstance } from './class/whatsapp-socket';
import pino from 'pino';
import path from 'path';
import QRCode from 'qrcode';
import { sendQRViaMailjet } from './utils/mailJet';

let sockInstance: WASocket | null = null;

// EventEmitter untuk mengelola status
const eventEmitter = new EventEmitter();


export const createSockInstance = async (): Promise<WASocket> => {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const logger = pino({ level: 'silent' });

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger,
  });

  // Menyimpan kredensial ketika terjadi perubahan
  sock.ev.on('creds.update', saveCreds);

// Menyimpan sockInstance ke Redux store
  return sock;
};

// Membuat instans WhatsApp jika belum ada
const initializeSock = async (): Promise<WASocket> => {
  if (sockInstance) {
    console.log('WhatsApp sudah terkoneksi.');
    return sockInstance;
  }

  const sock = await createSockInstance();

let lastSentQR: string | null = null;

sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
  if (qr) {
    // Cegah ngirim QR yang sama berkali-kali
    if (qr === lastSentQR) return;

    lastSentQR = qr; // Tandai QR terakhir yang sudah dikirim

    qrcode.generate(qr, { small: true });
    console.log('🔑 Scan QR di atas untuk login...');

    // const filePath = path.join(__dirname, "qrcode.png");
    // QRCode.toFile(filePath, qr, {}, (err: any) => {
    //   if (err) return console.error(err);
    //   sendQRViaMailjet(filePath);
    // });
  }


    if (connection === 'close') {
  const error = lastDisconnect?.error as Boom;

  const statusCode = error?.output?.statusCode;
  const reasonMessage = error?.output?.payload?.message || error?.message || 'Unknown reason';

  console.log('❌ Connection closed.');
  console.log('📴 Disconnect reason status code:', statusCode);
  console.log('📝 Message:', reasonMessage); // <== tampilkan pesan error aslinya

  // Gunakan switch seperti sebelumnya
  switch (statusCode) {
    case DisconnectReason.badSession:
      console.log('🚫 Bad Session File. Delete session and scan again.');
      break;
    case DisconnectReason.connectionClosed:
      console.log('📴 Connection closed, reconnecting...');
      break;
    case DisconnectReason.connectionLost:
      console.log('📡 Connection lost from server, reconnecting...');
      break;
    case DisconnectReason.connectionReplaced:
      console.log('🔄 Connection replaced. Another device logged in.');
      break;
    case DisconnectReason.loggedOut:
      console.log('🔐 Logged out. Scan QR again.');
      break;
    case DisconnectReason.restartRequired:
      console.log('🔁 Restart required. Reconnecting...');
      break;
    case DisconnectReason.timedOut:
      console.log('⏱️ Connection timed out. Reconnecting...');
      break;
    default:
      console.log('❓ Unknown disconnect status. Will still attempt reconnect.');
  }

  const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

  if (shouldReconnect) {
    sockInstance = null;
    await startWhatsAppBot();
  }
}
 else if (connection === 'open') {
      // Emit event bahwa koneksi terbuka
      console.log('✅ WhatsApp terhubung.');
      eventEmitter.emit('sockReady', true);  // Memastikan event dipicu
      setSockInstance(sock); 
    console.log('✅ WhatsApp connected.');
    lastSentQR = null;
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    // if (!msg.message || msg.key.fromMe) return;
    if (!msg.message) return;

    const remoteJid = msg.key.remoteJid;
    const allowedGroups = Object.values(GROUP_WHITELIST);

    if (!DEV_MODE && (!remoteJid?.endsWith('@g.us') || !allowedGroups.includes(remoteJid))) {
      return;
    }

    const messageText =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      '';

    const timestamp = parseInt(msg.messageTimestamp?.toString()!) || Date.now();

    try {
      await handleMessage(messageText, timestamp, remoteJid!);
    } catch (err) {
      console.error('❌ Error handling message:', err);
    }
  });

  return sock;
};




// Memulai WhatsApp Bot
export const startWhatsAppBot = async (): Promise<void> => {
  const sock = await initializeSock(); // Menyambung jika belum ada koneksi
  setSockInstance(sock); // Simpan instans ke Redux store

  sockInstance = sock; // Simpan instans ke variabel global
  // console.log('[DISPATCH] Dispatching sock instance to Redux...');
  // store.dispatch(setSockInstance(sock));
  // console.log('[DISPATCH] Done.');
};



// Menunggu hingga WhatsApp terhubung sebelum melanjutkan.
export const waitForWhatsAppConnection = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    console.log('⏳ Menunggu koneksi WhatsApp...');
    // Menunggu event 'sockReady' yang menandakan koneksi berhasil
    eventEmitter.once('sockReady', () => {
      console.log('✅ WhatsApp terhubung, melanjutkan...');
      resolve();
    });

    // Timeout untuk jika koneksi gagal
    setTimeout(() => {
      reject(new Error("Timeout menunggu koneksi WhatsApp"));
    }, 60000); // Tunggu maksimal 60 detik
  });
};


export const sendMessage = async (jid: string, text: string) => {
  const sock = getSockInstance();
  if(sock){
    console.log('Sending message to:', jid);
    await sock.sendMessage(jid, { text });
    return;
  }
  throw new Error('Sock instance is not available');
  
};


