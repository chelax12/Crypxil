
export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface MarketChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export type SortKey = 'market_cap' | 'current_price' | 'price_change_percentage_24h' | 'market_cap_rank';
export type SortOrder = 'asc' | 'desc';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
