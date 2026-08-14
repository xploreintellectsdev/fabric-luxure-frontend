import type { Metadata } from "next";
import { Square_Peg } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({
  src: "../public/font/Satoshi-Regular.woff2",
  variable: "--font-sathoshi",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const squarePeg = Square_Peg({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-square-peg",
});

export const metadata: Metadata = {
  title: "Fabric Luxure",
  description:
    "a brand that offers a curated selection of premium fabrics and textiles, catering to the needs of fashion designers, tailors, and sewing enthusiasts.",
};

import { WishlistProvider } from "../context/wishlistContext";
import { CartProvider } from "../context/cartContext";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

import GlobalModal from "../components/GlobalModal";

import { WebsitePagesProvider } from "../context/websitePagesContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${squarePeg.variable} ${cormorantGaramond.variable} antialiased`}
    >
      <body className="flex flex-col overflow-x-hidden">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <WebsitePagesProvider>
            <WishlistProvider>
              <CartProvider>
                {children}
                <Toaster position="top-right" toastOptions={{
                  style: {
                    background: '#08142c',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '12px',
                    marginTop: '60px'
                  },
                }} />
                <GlobalModal />
              </CartProvider>
            </WishlistProvider>
          </WebsitePagesProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
