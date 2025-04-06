import { AuthProvider } from "./providers";
import ReactRouter from "@/components/ReactRouter";
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
          <ReactRouter>
            {children}
          </ReactRouter>
        </AuthProvider>
      </body>
    </html>
  );
}