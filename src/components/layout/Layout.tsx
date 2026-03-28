import type { ReactNode } from 'react';
import { Header } from './Header/Header';
import { Footer } from './Footer/Footer';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
