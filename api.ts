
import { CoinMarketData, MarketChartData, CacheEntry } from './types';

const CACHE_TTL = 60 * 1000; // 60 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry<T>(url: string, retries = MAX_RETRIES): Promise<T> {
  // Check cache first
  const cached = sessionStorage.getItem(url);
  if (cached) {
    const entry: CacheEntry<T> = JSON.parse(cached);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.data;
    }
  }

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        if (i === retries - 1) {
          throw new Error('API Rate Limit Exceeded. CoinGecko limits free tier requests. Please wait a minute.');
        }
        await sleep(RETRY_DELAY * (i + 1));
        continue;
      }

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      sessionStorage.setItem(url, JSON.stringify({ data, timestamp: Date.now() }));
      return data;
    } catch (error: any) {
      if (i === retries - 1) {
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          throw new Error('Network Connection Error. Check your internet or ad-blocker (CoinGecko might be blocked).');
        }
        throw error;
      }
      await sleep(RETRY_DELAY * (i + 1));
    }
  }
  throw new Error('Maximum retries reached.');
}

export const getTopCoins = (perPage = 50, category?: string): Promise<CoinMarketData[]> => {
  let url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`;
  if (category) {
    url += `&category=${category}`;
  }
  return fetchWithRetry<CoinMarketData[]>(url);
};

export const getCategories = (): Promise<{ category_id: string; name: string }[]> => {
  return fetchWithRetry<{ category_id: string; name: string }[]>(
    'https://api.coingecko.com/api/v3/coins/categories/list'
  );
};

export const getExchanges = (perPage = 50): Promise<any[]> => {
  return fetchWithRetry<any[]>(
    `https://api.coingecko.com/api/v3/exchanges?per_page=${perPage}&page=1`
  );
};

export const getCoinDetails = (id: string): Promise<CoinMarketData[]> => {
  return fetchWithRetry<CoinMarketData[]>(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}&sparkline=true&price_change_percentage=1h,24h,7d`
  );
};

export const getMarketChart = (id: string, days: number): Promise<MarketChartData> => {
  return fetchWithRetry<MarketChartData>(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`
  );
};
