import "./globals.css";

export const metadata = {
  title: "APOS",
  description: "AI Personal Operating System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-slate-50 to-blue-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}