import type { Metadata } from "next";
import { Roboto } from "next/font/google";


import "./globals.css";
import "../assets/globalStyles.css";
import WrapperLayout from "@/components/WrapperLayout";

const poppins = Roboto({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Benjy parking Web app",
  description: " Parking Dashboard"
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  

  return (
    <html lang="en">
      <body className={poppins.className}>
        <WrapperLayout>{children}</WrapperLayout>
      </body>
    </html>
  );
}
