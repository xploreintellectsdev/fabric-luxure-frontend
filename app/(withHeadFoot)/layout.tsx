import type { Metadata } from "next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";


export const metadata: Metadata = {
  title: "Fabric Luxure",
  description:
    "a brand that offers a curated selection of premium fabrics and textiles, catering to the needs of fashion designers, tailors, and sewing enthusiasts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
