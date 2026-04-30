import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Doctor Appointment System",
  description: "Book appointments with specialist doctors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-gray-800 text-white p-4 text-center">
            <p>&copy; 2024 Doctor Appointment System. All rights reserved.</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}