import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { MobileNav } from './MobileNav';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Sidebar for Desktop & Mobile Slide-Over Drawer */}
      <Sidebar
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area — Offset for Desktop Sidebar */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:ml-20' : 'md:ml-72'
        }`}
      >
        {/* Unified Top Navigation */}
        <TopNav
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          isCollapsed={isCollapsed}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav onOpenDrawer={() => setIsOpenMobile(true)} />
    </div>
  );
};
