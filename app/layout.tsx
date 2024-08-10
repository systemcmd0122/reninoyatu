import DesignProvider from '@/common/providers/design_provider'

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "例のやつ.com",
  description: "例のやつのホームページです。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='ja'>
      <body>
        <DesignProvider>{children}</DesignProvider>
      </body>
    </html>
  )
}