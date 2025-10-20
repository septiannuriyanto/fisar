// src/index.ts

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { handleMessage } from './handlers/messageHandler';

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


async function cacheTeraTangkiFromCSV() {
  try {
    await loadTeraCacheFromCSV('./assets/tera_tangki.csv');
    console.log('✅ Tera cache ready. Starting server...');

    // Lanjut start server, bot, listener, dll
  } catch (err) {
    console.error('❌ Failed during startup:', err);
    process.exit(1);
  }
}


// import { startBaileys } from './baileysClient';

// startBaileys().then(() => {
//   console.log('✅ Baileys started');
// }).catch((err) => {
//   console.error('❌ Baileys error:', err);
// });

import { startWhatsAppBot } from './whatsapp';
import { loadTeraCacheFromCSV } from './utils/teraCache';
import { startCronJobs } from './scheduler/index';


startWhatsAppBot();
startCronJobs();
cacheTeraTangkiFromCSV().then(() => {
  console.log('✅ Tera cache loaded and server started');
}).catch((err) => {
  console.error('❌ Error starting server:', err);
});