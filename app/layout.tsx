import { AuthProvider } from "./providers";
import "./globals.css";

export const metadata = {
  title: "Book Review App",
  description: "Review your favorite books",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}