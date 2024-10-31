import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { config } from "./config";
import { Web3ModalProvider } from "./context";

export const metadata: Metadata = {
  title: "AppKit Example App",
  description: "AppKit by reown",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = (await headers()).get("cookie");
  const initialState = cookieToInitialState(config, cookie);
  return (
    <html lang="en">
      <body>
          <Web3ModalProvider initialState={initialState}>
            {children}
          </Web3ModalProvider>
      </body>
    </html>
  );
}
