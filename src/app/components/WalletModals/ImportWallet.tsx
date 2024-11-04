import { encrypt } from "@/app/utils/encryption";
import { useSecureStorage } from "@/app/utils/useSecureStorage";
import React, { useState } from "react";
import { FaLock, FaInfoCircle } from "react-icons/fa";

interface ImportWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportWalletModal: React.FC<ImportWalletModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [password, setPassword] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const secureLocalStorage = useSecureStorage()
  const storeData  = secureLocalStorage?.storeData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    if (!privateKey) return;
    if(!storeData) return
    try {
      storeData("password", password);

      const enctyptedPrivatekey = encrypt(privateKey, password);
      storeData("encryptedPrivateKey", enctyptedPrivatekey);
    } catch (e) {
      const error = e as { message: string } | undefined
      console.error(error?.message);
      secureLocalStorage.lock();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <FaLock className="text-2xl text-gray-700" />
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Private Key
            </label>
            <input
              type="text"
              required
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="flex items-center">
            <FaInfoCircle className="text-blue-500 mr-2" size={52} />
            <span className="text-xs text-gray-500">
              Your private key will be encrypted with your password and stored
              in your local storage. We will not store your password or private
              key. If you lose your private key, it will be lost forever.
            </span>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Import Wallet
          </button>
        </form>
      </div>
    </div>
  );
};
