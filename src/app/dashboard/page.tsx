'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getWalletBalances, logoutWallet } from '@/lib/api';
import { TransferModal } from '@/components/wallet/TransferModal';
import type { WalletBalancesResponse, CryptoBalance, APIError } from '@/lib/types';

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function formatPercent(num: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num));
  return (num >= 0 ? '+' : '-') + formatted + '%';
}

function CryptoCard({ balance, onRefresh }: { balance: CryptoBalance; onRefresh: () => void }) {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const priceChangeColor = balance.metrics.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500';

  const getCryptoIcon = (symbol: string) => {
    switch (symbol.toUpperCase()) {
      case 'BTC':
        return (
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#F7931A"/>
            <path d="M14.5 8.5L13.5 8.5L13.5 7.5L12.5 7.5L12.5 8.5L11.5 8.5L11.5 9.5L12.5 9.5L12.5 11.5L11.5 11.5L11.5 12.5L12.5 12.5L12.5 13.5L13.5 13.5L13.5 12.5L14.5 12.5L14.5 11.5L13.5 11.5L13.5 9.5L14.5 9.5L14.5 8.5Z" fill="white"/>
          </svg>
        );
      case 'ETH':
        return (
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#627EEA"/>
            <path d="M12 3L6 12L12 9.5V3Z" fill="#C0CBF6" fillOpacity="0.8"/>
            <path d="M12 3L18 12L12 9.5V3Z" fill="white"/>
            <path d="M12 16.5V21L18 13L12 16.5Z" fill="#C0CBF6" fillOpacity="0.8"/>
            <path d="M12 16.5V21L6 13L12 16.5Z" fill="white"/>
          </svg>
        );
      default:
        return <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{symbol[0]}</span>;
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center w-full sm:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mr-3 sm:mr-4">
              {getCryptoIcon(balance.symbol)}
            </div>
            <div className="flex-1 sm:flex-none">
              <h3 className="text-xl sm:text-2xl font-bold">{balance.symbol}</h3>
              <div className="flex items-center">
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Amount: {formatNumber(balance.amount)}</p>
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="ml-2 text-blue-500 hover:text-blue-600 text-xs sm:text-sm underline"
                >
                  {showDetails ? 'Less' : 'More'} details
                </button>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-auto text-left sm:text-right">
            <p className="text-xl sm:text-2xl font-bold">{formatCurrency(balance.value)}</p>
            <p className={`${priceChangeColor} text-sm font-medium flex items-center sm:justify-end`}>
              {balance.metrics.priceChange24h >= 0 ? (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              {formatPercent(balance.metrics.priceChange24h)}
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 space-y-3 border-t dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Price</p>
                <p className="text-base sm:text-lg font-semibold">{formatCurrency(balance.priceUsd)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">24h Volume</p>
                <p className="text-base sm:text-lg font-semibold">{formatCurrency(balance.metrics.volume24h)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Liquidity</p>
                <p className="text-base sm:text-lg font-semibold">{formatCurrency(balance.metrics.liquidity)}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4">
              <button
                onClick={() => setShowTransferModal(true)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send {balance.symbol}
              </button>
              <button
                onClick={onRefresh}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        balance={balance}
      />
    </>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [balances, setBalances] = useState<WalletBalancesResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalances = useCallback(async () => {
    const token = localStorage.getItem('wallet_token');
    const walletAddress = localStorage.getItem('wallet_address');

    if (!token || !walletAddress) {
      console.error('Missing token or wallet address');
      setError('Please import your wallet first');
      router.push('/');
      return;
    }

    try {
      const response = await getWalletBalances(walletAddress, token);
      
      if (!response.success) {
        const errorResponse = response as APIError;
        if (errorResponse.error?.includes('Authentication failed')) {
          // Clear invalid token and redirect to home
          localStorage.removeItem('wallet_token');
          localStorage.removeItem('wallet_address');
          setError('Session expired. Please import your wallet again.');
          router.push('/');
          return;
        }
        setError(errorResponse.error || 'Failed to fetch wallet balances');
        return;
      }

      setBalances(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching balances:', error);
      setError('Failed to fetch wallet balances');
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBalances();
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('wallet_token');
    const walletAddress = localStorage.getItem('wallet_address');

    if (!token || !walletAddress) {
      router.push('/');
      return;
    }

    try {
      const response = await logoutWallet(walletAddress, token);
      
      if (!response.success) {
        const errorResponse = response as APIError;
        // If session expired or permission denied, clear localStorage anyway
        if (errorResponse.error?.includes('Session expired') || errorResponse.error?.includes('permission')) {
          localStorage.removeItem('wallet_token');
          localStorage.removeItem('wallet_address');
          router.push('/');
          return;
        }
        setError(errorResponse.error || 'Failed to logout');
        return;
      }

      // Clear localStorage and redirect to home
      localStorage.removeItem('wallet_token');
      localStorage.removeItem('wallet_address');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear localStorage even if there's an error
      localStorage.removeItem('wallet_token');
      localStorage.removeItem('wallet_address');
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-8 shadow-lg mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Wallet</h1>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
              <div className="w-full sm:w-auto text-left sm:text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Portfolio Value</p>
                <p className="text-2xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(balances?.totalValue || 0)}
                </p>
                <div className="flex items-center space-x-4 mt-4">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 flex items-center"
                  >
                    <svg className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {balances?.balances.map((balance) => (
              <CryptoCard 
                key={balance._id} 
                balance={balance}
                onRefresh={handleRefresh}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 