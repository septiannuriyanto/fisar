import { WASocket } from "@whiskeysockets/baileys";

export interface MessageHandlerParams {
  groupId: string;
  header?: string | null;
  message: string;
  sock?: WASocket | null;
}

