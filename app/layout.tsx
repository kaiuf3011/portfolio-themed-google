import type { Metadata, Viewport } from "next";
import { Google_Sans_Code, Google_Sans_Flex } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { site } from "@/content/site";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";
import { InlineScript } from "@/components/InlineScript";

const sans = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-gsf",
  axes: ["ROND", "wdth", "opsz", "GRAD"],
  display: "swap",
});

const code = Google_Sans_Code({
  subsets: ["latin"],
  variable: "--font-gsc",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://my-port-dun-one.vercel.app"),
  title: site.title,
  description: site.description,
  openGraph: { title: site.title, description: site.description, images: ["/images/kaiuf-mountain.jpg"] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#131314" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${code.variable}`} suppressHydrationWarning>
      <head>
        <InlineScript html={themeInitScript} />
      </head>
      <body>
        <Providers>
          <div id="app">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
