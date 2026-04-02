import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: {
    default: "Jerrypicsart Portfolio",
    template: "%s | Jerrypicsart",
  },
  description: "Portfolio photo de Jerrypicsart: fashion week, mariages, eglises et concerts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} antialiased`} suppressHydrationWarning>
        <div className="relative min-h-screen overflow-x-hidden">
          <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_70%_30%,rgba(188,125,79,0.18),transparent_42%)]" />
          <Navbar />
          <PageTransition>
            <main className="w-full pb-16 pt-20">{children}</main>
          </PageTransition>
        </div>
      </body>
    </html>
  );
}
