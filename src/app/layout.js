import "./globals.css";

export const metadata = {
  title: "Task List",
  description: "Manage and prioritize tasks efficiently.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className="antialiased bg-[#f5f5f5] text-black transition-colors duration-300"
      >
        {children}
      </body>
    </html>
  );
}
