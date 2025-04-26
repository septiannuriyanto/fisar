import { parentPort, workerData } from 'worker_threads';
import { insertOilUsageWithRetry } from '../services/oilUsage/oilUsageServices';

(async () => {
  try {
    const { entry } = workerData;
    const result = await insertOilUsageWithRetry(entry);
    parentPort?.postMessage({ success: true, data: result });
  } catch (error: any) {
    parentPort?.postMessage({ success: false, error: error.message });
  }
})();
