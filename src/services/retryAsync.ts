export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries = 10,
  delayMs = 1000
): Promise<T> {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔁 Attempt ${attempt}...`);
      return await fn(); // kalau berhasil, langsung return
    } catch (err) {
      lastError = err;
      if (err instanceof Error) {
        console.warn(`⚠️ Attempt ${attempt} failed:`, err.message);
      } else {
        console.warn(`⚠️ Attempt ${attempt} failed with an unknown error.`);
      }
      if (attempt < maxRetries) await new Promise(res => setTimeout(res, delayMs));
    }
  }

  console.error(`❌ All ${maxRetries} attempts failed.`);
  throw lastError;
}