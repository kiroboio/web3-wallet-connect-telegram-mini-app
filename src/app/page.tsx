"use client";

// import { useAccount } from "wagmi";

export default function Home() {
  // const { isConnected } = useAccount();
  return (
    <main className="min-h-screen px-8 py-0 pb-12 flex-1 flex flex-col items-center bg-white">
      <header className="w-full py-4 flex justify-between items-center">
        <div className="flex items-center w-full h-full justify-between items-center">
          <w3m-network-button />
          <w3m-button size="md" label="connect" />
        </div>
      </header>
    </main>
  );
}
