'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreateWalletModal } from '@/components/wallet/CreateWalletModal';
import { ImportWalletModal } from '@/components/wallet/ImportWalletModal';

export default function Home() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    // Check if user already has a wallet
    const token = localStorage.getItem('wallet_token');
    const walletAddress = localStorage.getItem('wallet_address');
    if (token && walletAddress) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6">Trust Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Your Gateway to the World of Cryptocurrency
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Wallet
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="w-full px-6 py-3 text-lg font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-700"
            >
              Import Existing Wallet
            </button>
          </div>
        </div>
      </div>

      <CreateWalletModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      <ImportWalletModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
}
