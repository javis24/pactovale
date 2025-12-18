import "./globals.css";
import SessionProvider from "@/app/components/SessionProvider";

export const metadata = {
  title: "Pactovale",
  description: "Sistema de préstamos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}