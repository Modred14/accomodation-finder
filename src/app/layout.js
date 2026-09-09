// app/layout.js
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import Footer from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toaster";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  
};


export const metadata = {
  title: "Abodé — Student Accommodation Near Campus",
  description:
    "Find, compare, and book verified off-campus accommodation near Obafemi Awolowo University and beyond.",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`h-full antialiased ${bricolage.variable}`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <ToastProvider>
          <Navbar user={user} />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileTabBar user={user} />
        </ToastProvider>
      </body>
    </html>
  );
}