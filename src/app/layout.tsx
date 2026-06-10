import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JBD Digital Commerce Prototype",
  description:
    "Executive prototype for JBD digital commerce covering storefront, admin, operations, CRM, finance, analytics, and AI layers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
