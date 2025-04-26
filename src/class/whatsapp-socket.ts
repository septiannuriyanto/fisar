// whatsappSocket.ts
import { WASocket } from '@whiskeysockets/baileys';

let sockInstance: WASocket | null = null;

export const setSockInstance = (sock: WASocket) => {
  sockInstance = sock;
};

export const getSockInstance = (): WASocket | null => sockInstance;
