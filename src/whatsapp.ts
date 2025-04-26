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

let sockInstance: WASocket | null = null;

// EventEmitter untuk mengelola status
const eventEmitter = new EventEmitter();


export const createSockInstance = async (): Promise<WASocket> => {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
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

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log('🔑 Scan QR di atas untuk login...');
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Connection closed. Reconnecting...', shouldReconnect);
      if (shouldReconnect) {
        sockInstance = null; // Reset sockInstance untuk rekoneksi
        await startWhatsAppBot();
      }
    } else if (connection === 'open') {
      // Emit event bahwa koneksi terbuka
      console.log('✅ WhatsApp terhubung.');
      eventEmitter.emit('sockReady', true);  // Memastikan event dipicu
      setSockInstance(sock); 
      const lsock = await waitUntilSockInRedux();

          if (lsock) {
            await lsock.sendMessage(GROUP_LIST.TEST, { text: 'Sudah konek bwaaangg' });
          } else {
            console.warn('Sock belum masuk Redux');
          }

    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

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

const waitUntilSockInRedux = async (timeoutMs = 5000): Promise<WASocket | null> => {
  const intervalMs = 100;
  const maxTries = timeoutMs / intervalMs;
  let tries = 0;

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const state = store.getState();
      const sock = state.whatsapp.sock;

      if (sock) {
        clearInterval(interval);
        resolve(sock);
      } else if (++tries >= maxTries) {
        clearInterval(interval);
        console.warn('Timeout waiting for sock in Redux');
        resolve(null);
      }
    }, intervalMs);
  });
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


