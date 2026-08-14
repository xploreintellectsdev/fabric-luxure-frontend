import type { Metadata } from "next";


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
    <div className="min-h-full flex flex-col">
      {children}
    </div>
  );
}
