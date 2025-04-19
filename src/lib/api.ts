import { WalletGenerateResponse, WalletVerifyResponse, WalletBalancesResponse, TransferResponse, APIResponse } from './types';

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function generateWallet(): Promise<APIResponse<WalletGenerateResponse>> {
  try {
    const response = await fetch(`${API_URL}/api/wallet/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate wallet');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate wallet',
    };
  }
}

export async function verifyWallet(seedPhrase: string): Promise<APIResponse<WalletVerifyResponse>> {
  try {
    const response = await fetch(`${API_URL}/api/wallet/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seedPhrase }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify wallet');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify wallet',
    };
  }
}

export async function getWalletBalances(walletAddress: string, token: string): Promise<APIResponse<WalletBalancesResponse>> {
  try {
    const response = await fetch(`${API_URL}/api/crypto/${walletAddress}/balances`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wallet balances');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch wallet balances',
    };
  }
}

export async function transferCrypto(
  toAddress: string,
  amount: number,
  symbol: string,
  token: string
): Promise<APIResponse<TransferResponse>> {
  try {
    const response = await fetch(`${API_URL}/api/wallet/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        toAddress,
        amount,
        symbol,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initiate transfer');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate transfer',
    };
  }
} 