"use client";

import React, { useEffect, useState } from "react";
import { WalletButton } from "./components/WalletButton";
import { FaLock, FaWallet } from "react-icons/fa";
import { IconWithText } from "./components/IconWithText";
import { ImportWalletModal } from "./components/WalletModals/ImportWallet";
import { CreateWalletModal } from "./components/WalletModals/CreateWallet";

import { WalletInfo } from "./components/WalletInfo";
import { SocketProvider } from "./context/SocketProvider";
import { useSearchParams } from "next/navigation";
import { HandleWalletEvents } from "./components/HandleWalletEvents";
import { useSecureStorage } from "./context/SecureStorageProvider";
import { Spinner } from "./components/Spinner";
import { TriggersList } from "./components/Triggers/List";

export default function Home() {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const secureLocalStorage = useSecureStorage();
  const [walletAddress, setWalletAddress] = useState(
    secureLocalStorage?.address
  );
  const [vaultAddress, setVaultAddress] = useState(
    secureLocalStorage?.vault
  );

  const searchParams = useSearchParams();

  const userId = searchParams.get("userId");

  console.log({ vault: secureLocalStorage?.vault, vaultAddress })
  useEffect(() => {
    setWalletAddress(secureLocalStorage?.address);
    setVaultAddress(secureLocalStorage?.vault);
    secureLocalStorage?.subscribe({
      key: "wallet_address",
      callback: (secureStorage) => {
        setWalletAddress(secureStorage.address);
        setVaultAddress(secureStorage.vault);
      },
    });
  }, [secureLocalStorage]);

  const renderWalletButtons = () => {
    if (!secureLocalStorage) return <Spinner size={24} />;
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
          {secureLocalStorage ? (
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
          ) : null}
        </div>
      </div>
    );
  };

  const getWalletInfo = () => {
    if (!secureLocalStorage) {
      return <Spinner size={24} />;
    }

    if (!walletAddress) return "Not Connected";
    if (!vaultAddress) return "Runner Not Connected";
    return (
      <WalletInfo
        address={walletAddress}
        vault={vaultAddress}
        privateKey={secureLocalStorage.privateKey}
      />
    );
  };
  return (
    <SocketProvider userId={Number(userId)}>
      <main className="min-h-screen py-0 pb-12 flex flex-col items-center bg-white">
        <header className="w-full flex justify-center items-center">
          <div className="flex w-full  justify-between items-center overflow-hidden  bg-white px-4">
            <IconWithText
              icon={
                <FaWallet
                  size={64}
                  className={walletAddress ? `fill-blue-500` : `fill-gray-400`}
                />
              }
              text={getWalletInfo()}
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
        <TriggersList />
      </main>
      <HandleWalletEvents userId={userId} />
    </SocketProvider>
  );
}
