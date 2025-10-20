// src/workers/insertFilterChangeWorker.ts
import { parentPort, workerData } from 'worker_threads';
import { insertFilterChangeWithRetry } from '../services/filterChange/filterChangeServices';

(async () => {
  try {
    const { entry } = workerData;
    const result = await insertFilterChangeWithRetry(entry);
    parentPort?.postMessage({ success: true, data: result });
  } catch (error: any) {
    parentPort?.postMessage({ success: false, error: error.message });
  }
})();
