"use client";

import React from "react";
export default function Home() {
  return (

      <main className="min-h-screen px-2 py-0 pb-12 flex-1 flex flex-col items-center bg-white" style={{ backgroundImage: 'url(/propellor.gif)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center' }}>
        <header className="w-full py-4 flex justify-center items-center">
          <div
            className="w-full rounded overflow-hidden shadow-lg bg-white"
            style={{ maxWidth: "1200px", zIndex: 100 }}
            
          >
    
            <div className="flex w-full  justify-between items-center pt-4 pb-4 px-2">
              <w3m-network-button />
              <w3m-button size="sm" label="connect" />
            </div>
          </div>
        </header>
      </main>
  );
}
