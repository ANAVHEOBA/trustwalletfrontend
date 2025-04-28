import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { importWallet } from '@/lib/api';
import type { WalletImportResponse, APIError } from '@/lib/types';

interface ImportWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportWalletModal({ isOpen, onClose }: ImportWalletModalProps) {
  const router = useRouter();
  const [seedPhrase, setSeedPhrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    const trimmedSeedPhrase = seedPhrase.trim();
    if (!trimmedSeedPhrase) {
      setError('Please enter your seed phrase');
      return;
    }

    // Validate seed phrase format (12 words)
    const words = trimmedSeedPhrase.split(/\s+/);
    if (words.length !== 12) {
      setError('Seed phrase must contain exactly 12 words');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await importWallet(trimmedSeedPhrase);
      
      if (!response.success) {
        const errorResponse = response as APIError;
        setError(errorResponse.error || 'Failed to import wallet');
        return;
      }

      const { token, walletAddress } = (response as WalletImportResponse).data;
      
      try {
        // Store the token in localStorage
        localStorage.setItem('wallet_token', token);
        localStorage.setItem('wallet_address', walletAddress);
        
        // Verify the token was stored
        const storedToken = localStorage.getItem('wallet_token');
        const storedAddress = localStorage.getItem('wallet_address');
        
        if (!storedToken || !storedAddress) {
          throw new Error('Failed to store wallet information');
        }
        
        // Only redirect after successful storage
        router.push('/dashboard');
      } catch (storageError) {
        setError('Failed to store wallet information. Please try again.');
        console.error('Storage error:', storageError);
      }
    } catch (err) {
      setError('Failed to import wallet. Please try again.');
      console.error('Import error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Wallet">
      <div className="space-y-4">
        <div>
          <label htmlFor="seedPhrase" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Seed Phrase
          </label>
          <textarea
            id="seedPhrase"
            value={seedPhrase}
            onChange={(e) => setSeedPhrase(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={3}
            placeholder="Enter your 12-word seed phrase"
          />
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Importing...' : 'Import Wallet'}
          </button>
        </div>
      </div>
    </Modal>
  );
} 