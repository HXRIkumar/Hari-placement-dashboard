import './globals.css';

export const metadata = {
  title: 'PIOS - Placement Intelligence',
  description: 'Placement Intelligence Operating System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased text-zinc-900 bg-zinc-50">{children}</body>
    </html>
  );
}
