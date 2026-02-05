import { useState, useCallback } from 'react';

export function useRetry(maxRetries = 3) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setIsRetrying(true);

    try {
      const result = await fn();
      setRetryCount(0);
      return result;
    } catch (error) {
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
        setRetryCount(prev => prev + 1);
        return retry(fn);
      }
      throw error;
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return { retry, retryCount, isRetrying, reset };
}
