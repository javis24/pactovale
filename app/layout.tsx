// app/layout.tsx
import Provider from "./components/SessionProvider"; 
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {/* Envolver los children con el Provider */}
        <Provider>
            {children}
        </Provider>
      </body>
    </html>
  );
}