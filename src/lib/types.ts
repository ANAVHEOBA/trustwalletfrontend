export interface WalletGenerateResponse {
  success: boolean;
  data: {
    seedPhrase: string;
    walletAddress: string;
    message: string;
  };
}

export interface WalletVerifyResponse {
  success: boolean;
  data: {
    token: string;
    walletAddress: string;
    message: string;
  };
}

export interface TransferRequestDetails {
  fromAddress: string;
  toAddress: string;
  amount: number;
  symbol: string;
  timestamp: string;
}

export interface TransferResponse {
  success: boolean;
  data: {
    message: string;
    contactEmail: string;
    emailSubject: string;
    requestDetails: TransferRequestDetails;
  };
}

export interface CryptoMetrics {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  liquidity: number;
}

export interface CryptoBalance {
  symbol: string;
  amount: number;
  priceUsd: number;
  value: number;
  lastUpdated: string;
  metrics: CryptoMetrics;
  _id: string;
}

export interface WalletBalancesResponse {
  success: boolean;
  data: {
    balances: CryptoBalance[];
    totalValue: number;
  };
}

export interface APIError {
  success: false;
  error: string;
}

export type APIResponse<T> = T | APIError; 