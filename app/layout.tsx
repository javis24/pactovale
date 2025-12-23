import "./globals.css";
import SessionProvider from "@/app/components/SessionProvider";

export const viewport = {
  themeColor: '#ff5aa4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};


export const metadata = {
  metadataBase: new URL('https://www.pactovale.com'), 

  title: {
    default: 'Pactovale | Préstamos Personales',
    template: '%s | Pactovale'
  },

  description: 'Solicita tu préstamo en línea rápido y seguro. Entra a tu portal y gestiona tu dinero.',

  openGraph: {
    title: 'Pactovale - Tu dinero seguro hoy mismo 💰',
    description: 'Créditos rápidos y 100% digitales. Entra al portal.',
    url: 'https://www.pactovale.com/portal',
    siteName: 'Pactovale',
    locale: 'es_MX',
    type: 'website',
  },
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