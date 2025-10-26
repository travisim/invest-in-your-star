import React, { ReactNode } from 'react';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { Footer } from '../Footer';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="page-layout">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
};
