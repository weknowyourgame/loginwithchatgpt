import type { ReactNode } from "react";

export const metadata = {
  title: "Login with ChatGPT — Demo",
  description: "Power your app's AI with your users' own ChatGPT subscription.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0a0a", color: "#fafafa", fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
