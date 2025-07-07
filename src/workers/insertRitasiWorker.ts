import { parentPort, workerData } from 'worker_threads';
import { insertRitasiWithRetryRPCNew } from '../services/ritasi/ritasiRecordServiceNew';

(async () => {
  try {
    const payload = workerData.payload;

    console.log('🔄 Payload masuk worker :', payload);
    

    const result = await insertRitasiWithRetryRPCNew(payload);
    parentPort?.postMessage({ success: true, data: result });
  } catch (error: any) {
    console.error('❌ Error di worker:', error);
    parentPort?.postMessage({ success: false, error: error.message });
  }
})();
