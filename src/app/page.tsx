"use client";

import React, { useEffect, useState } from "react";
import { WalletButton } from "./components/WalletButton";
import { FaLock, FaWallet } from "react-icons/fa";
import { IconWithText } from "./components/IconWithText";
import { ImportWalletModal } from "./components/WalletModals/ImportWallet";
import { CreateWalletModal } from "./components/WalletModals/CreateWallet";
import { secureLocalStorage } from "./utils/secureStorage";
import WalletAddress from "./components/WaletAddress";

export default function Home() {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(
    secureLocalStorage.address
  );

  useEffect(() => {
    secureLocalStorage.subscribe({
      key: "wallet_address",
      callback: (secureStorage) => {
        setWalletAddress(secureStorage.address);
      },
    });
  }, []);

  const renderWalletButtons = () => {
    if (!walletAddress) {
      return (
        <div className="flex flex-col justify-end items-end pt-4 pb-4 px-2">
          <div className="py-2">
            <WalletButton
              label="Import Wallet"
              onClick={() => setIsImportOpen((isOpen) => !isOpen)}
            />
          </div>
          <div className="py-2">
            <WalletButton
              label="Create Wallet"
              onClick={() => setIsCreateOpen((isOpen) => !isOpen)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-end items-end pt-4 pb-4 px-2">
        <div className="py-2">
          <WalletButton
            label="lock"
            onClick={secureLocalStorage.lock}
            icon={
              <FaLock
                className="text-2xl text-gray-700 fill-white mr-4"
                size={16}
              />
            }
          />
        </div>
      </div>
    );
  };
  return (
    <main className="min-h-screen py-0 pb-12 flex-1 flex flex-col items-center bg-white">
      <header className="w-full py-4 flex justify-center items-center">
        <div className="flex w-full rounded justify-between items-center overflow-hidden shadow-lg bg-white px-4">
          <IconWithText
            icon={
              <FaWallet
                size={64}
                className={walletAddress ? `fill-blue-500` : `fill-gray-400`}
              />
            }
            text={
              walletAddress ? (
                <WalletAddress address={walletAddress} />
              ) : (
                "Not Connected"
              )
            }
            hasData={Boolean(walletAddress)}
          />
          {renderWalletButtons()}
        </div>
      </header>
      <ImportWalletModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
      <CreateWalletModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </main>
  );
}
