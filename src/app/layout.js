import { Inter } from "next/font/google";
import "./game.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Turista Guitar Game",
  description: "By Jordan, Madison, Ashes, and Cody",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
