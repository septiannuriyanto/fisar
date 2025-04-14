// src/index.ts

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { handleMessage } from './handlers/messageHandler';
import { isWithinShift } from './scheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware buat baca JSON body
app.use(express.json());

app.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  const body = req.body;

  const messageText: string = body?.message || '';
  const timestamp: number = body?.timestamp || Date.now();

  if (!messageText) {
    res.status(400).json({ error: 'No message provided.' });
    return;
  }

  if (!isWithinShift()) {
    console.log('⛔ Bot is outside of shift hours');
    res.status(200).json({ message: 'Bot inactive during this time.' });
    return;
  }

  try {
    await handleMessage(messageText, timestamp, null);
    res.status(200).json({ message: 'Message processed successfully.' });
  } catch (err) {
    console.error('❌ Failed to process message:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});



// import { startBaileys } from './baileysClient';

// startBaileys().then(() => {
//   console.log('✅ Baileys started');
// }).catch((err) => {
//   console.error('❌ Baileys error:', err);
// });

import { startWhatsAppBot } from './whatsapp';

startWhatsAppBot();