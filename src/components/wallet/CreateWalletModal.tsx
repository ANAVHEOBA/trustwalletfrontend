import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { generateWallet, verifyWallet } from '@/lib/api';
import type { WalletGenerateResponse, APIError } from '@/lib/types';

interface CreateWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWalletModal({ isOpen, onClose }: CreateWalletModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'welcome' | 'terms' | 'generating' | 'seedPhrase' | 'verify' | 'confirm'>('welcome');
  const [walletData, setWalletData] = useState<WalletGenerateResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [seedPhraseConfirmed, setSeedPhraseConfirmed] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [verificationWords, setVerificationWords] = useState<string[]>([]);
  const [selectedWordIndexes] = useState(() => {
    const indexes = new Set<number>();
    while (indexes.size < 3) {
      indexes.add(Math.floor(Math.random() * 12));
    }
    return Array.from(indexes).sort((a, b) => a - b);
  });

  const handleCreateWallet = async () => {
    setStep('generating');
    setError(null);

    const response = await generateWallet();
    
    if (!response.success) {
      setError((response as APIError).error);
      setStep('welcome');
      return;
    }

    setWalletData(response.data);
    setStep('seedPhrase');
  };

  const handleVerification = async () => {
    if (!walletData) return;

    const originalWords = walletData.seedPhrase.split(' ');
    const isCorrect = selectedWordIndexes.every(
      (index, i) => originalWords[index] === verificationWords[i]
    );

    if (!isCorrect) {
      setError('Incorrect words entered. Please try again.');
      setVerificationWords([]);
      return;
    }

    const response = await verifyWallet(walletData.seedPhrase);
    
    if (!response.success) {
      setError((response as APIError).error);
      return;
    }
    
    // Store the token and wallet address
    localStorage.setItem('wallet_token', response.data.token);
    localStorage.setItem('wallet_address', response.data.walletAddress);
    
    setStep('confirm');
  };

  const handleWordInput = (index: number, word: string) => {
    const newWords = [...verificationWords];
    newWords[index] = word.toLowerCase().trim();
    setVerificationWords(newWords);
  };

  const handleStartUsingWallet = () => {
    onClose();
    router.push('/dashboard');
  };

  const renderContent = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center">
            <div className="mb-8">
              <svg className="w-20 h-20 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className="text-2xl font-bold mb-4">Welcome to Trust Wallet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create a new wallet to start managing your crypto assets securely.
              </p>
            </div>
            {error && (
              <p className="text-red-500 mb-4">{error}</p>
            )}
            <button
              onClick={() => setStep('terms')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        );

      case 'terms':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Terms & Conditions</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 h-48 overflow-y-auto text-sm">
              <p className="mb-4">By creating a wallet, you agree to:</p>
              <ul className="list-disc pl-4 space-y-2">
                <li>Securely store your recovery phrase</li>
                <li>Take full responsibility for your funds</li>
                <li>Understand that lost recovery phrases cannot be recovered</li>
                <li>Accept that Trust Wallet cannot recover your wallet</li>
              </ul>
            </div>
            <label className="flex items-center mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">I understand and accept the terms</span>
            </label>
            <button
              onClick={handleCreateWallet}
              disabled={!termsAccepted}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Create New Wallet
            </button>
          </div>
        );

      case 'generating':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <p className="text-lg">Generating your secure wallet...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        );

      case 'seedPhrase':
        return walletData ? (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Your Secret Recovery Phrase</h3>
              <p className="text-red-500 text-sm mb-4">{walletData.message}</p>
              <div className="relative">
                <div className={`bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 ${!showSeedPhrase ? 'blur-sm' : ''}`}>
                  <div className="grid grid-cols-3 gap-2">
                    {walletData.seedPhrase.split(' ').map((word, index) => (
                      <div key={index} className="bg-white dark:bg-gray-600 p-2 rounded text-center">
                        <span className="text-gray-400 text-xs">{index + 1}.</span> {word}
                      </div>
                    ))}
                  </div>
                </div>
                {!showSeedPhrase && (
                  <button
                    onClick={() => setShowSeedPhrase(true)}
                    className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-lg"
                  >
                    <span className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                      Click to Reveal
                    </span>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Your wallet address:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg break-all font-mono text-sm">
                {walletData.walletAddress}
              </div>
            </div>
            <label className="flex items-center mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={seedPhraseConfirmed}
                onChange={(e) => setSeedPhraseConfirmed(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">I have safely stored my recovery phrase</span>
            </label>
            <button
              onClick={() => setStep('verify')}
              disabled={!seedPhraseConfirmed || !showSeedPhrase}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        ) : null;

      case 'verify':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Verify Your Recovery Phrase</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please enter the following words from your recovery phrase to verify you&apos;ve saved it correctly:
            </p>
            {error && (
              <p className="text-red-500 mb-4">{error}</p>
            )}
            <div className="space-y-4 mb-6">
              {selectedWordIndexes.map((originalIndex, i) => (
                <div key={originalIndex} className="flex items-center">
                  <span className="w-8 text-gray-500">#{originalIndex + 1}</span>
                  <input
                    type="text"
                    value={verificationWords[i] || ''}
                    onChange={(e) => handleWordInput(i, e.target.value)}
                    placeholder={`Enter word #${originalIndex + 1}`}
                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleVerification}
              disabled={verificationWords.length !== 3 || verificationWords.some(word => !word)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Verify & Complete
            </button>
          </div>
        );

      case 'confirm':
        return (
          <div className="text-center">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-xl font-bold mb-4">Wallet Created Successfully!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your wallet is ready to use. Remember to keep your recovery phrase safe.
            </p>
            <button
              onClick={handleStartUsingWallet}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Using Wallet
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Trust Wallet"
    >
      {renderContent()}
    </Modal>
  );
} 