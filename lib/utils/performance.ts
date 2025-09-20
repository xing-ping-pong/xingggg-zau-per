export function measurePerformance<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  label: string
) {
  return async (...args: T): Promise<R> => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const end = performance.now();
      console.log(`⚡ ${label}: ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`❌ ${label} failed after ${(end - start).toFixed(2)}ms:`, error);
      throw error;
    }
  };
}

export function addPerformanceHeaders(response: Response, startTime: number) {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
  response.headers.set('X-Processed-At', new Date().toISOString());
  
  return response;
}
