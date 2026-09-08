// app/layout.js
import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import Footer from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toaster";

export const metadata = {
  title: "OAU Lodge — Student Accommodation Near Campus",
  description:
    "Find, compare, and book verified off-campus accommodation near Obafemi Awolowo University and beyond.",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="h-full antialiased">
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
