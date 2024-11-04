import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { SecureStorageProvider } from "./context/SecureStorageProvider";
import { Spinner } from "./components/Spinner";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AppKit Example App",
  description: "Powered by Reown",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<Spinner size={24} />}>
          <SecureStorageProvider>
            {children}
          </SecureStorageProvider>
        </Suspense>
      </body>
    </html>
  );
}
