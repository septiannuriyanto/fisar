import { WASocket } from "@whiskeysockets/baileys";

// actions/whatsappActions.ts
export const setSockInstance = (sock: WASocket) => ({
  type: 'SET_SOCK_INSTANCE',
  payload: sock,
});export const clearSockInstance = () => ({
  type: 'CLEAR_SOCK_INSTANCE',
  payload: null,
});
