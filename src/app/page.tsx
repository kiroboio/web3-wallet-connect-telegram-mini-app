"use client";

import React from "react";
import { WalletButton } from "./components/WalletButton";
import { FaWallet } from "react-icons/fa";
import { IconWithText } from "./components/IconWithText";

export default function Home() {
  return (
    <main className="min-h-screen py-0 pb-12 flex-1 flex flex-col items-center bg-white">
      <header className="w-full py-4 flex justify-center items-center">
        <div className="flex w-full rounded justify-between items-center overflow-hidden shadow-lg bg-white px-4">
          <IconWithText
            icon={<FaWallet size={64} className="fill-gray-400" />}
            text={"Not Connected"}
          />

          <div className="flex flex-col justify-end items-end pt-4 pb-4 px-2">
            <div className="py-2">
              <WalletButton
                label="Import Wallet"
                onClick={() => console.log("import wallet")}
                icon
              />
            </div>
            <div className="py-2">
              <WalletButton
                label="Connect Wallet"
                onClick={() => console.log("connect wallet")}
                icon
              />
            </div>
          </div>
        </div>
      </header>
    </main>
  );
}
