import { Outfit, Space_Grotesk, Recursive, Poppins } from "next/font/google";
import "./globals.css";
import "swiper/css";
import "swiper/css/pagination";
import React from "react";
import dynamic from "next/dynamic";
import { HeroUIProvider } from "@heroui/react";
// import ReduxProvider from "./redux-provider";
import { Metadata } from "next";
import { SEO_CONFIG } from "@/components/utils/seoContants";
import ReduxProviders from "@/redux/Provider";
import RainbowProvider from "@/providers/RainbowProvider";
import { ToastContainer } from "react-toastify";
const HashPackProvider = dynamic(
  () => import("@/providers/HashPackProvider").then((mod) => mod.HashPackProvider),
  { ssr: false }
);

const { description, keywords, title, url } = SEO_CONFIG.default;
export const metadata: Metadata = {
  title: title,
  description: description,
  keywords: keywords,
  robots: {
    index: true,
  },
  openGraph: {
    images: [
      {
        url: "",
      },
    ],
    url: url,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="">
      <body className={`mx-auto relative bg-black-100`}>
        <RainbowProvider>
          <HashPackProvider>
          <ReduxProviders>
            <HeroUIProvider>
              <ToastContainer />
              {children}
            </HeroUIProvider>
          </ReduxProviders>
          </HashPackProvider>
        </RainbowProvider>
      </body>
    </html>
  );
}
