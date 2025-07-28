import React from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

const Header = ({ onToggleSidebar, sidebarOpen, onSidebarToggle }) => {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-card relative z-50 h-[72px]">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile hamburger menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
        
        {/* Desktop sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          className="hidden lg:flex"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
        
        <span className="font-montserrat font-extrabold text-xl sm:text-2xl tracking-wider bg-gradient-to-r from-blue-500 to-red-500 bg-clip-text text-transparent">
          Ask Asv
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {user?.publicMetadata?.role === 'admin' && (
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
            <a href="/admin">Admin Portal</a>
          </Button>
        )}
        <ModeToggle />
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-6 h-6 sm:w-8 sm:h-8"
            }
          }}
        />
      </div>
    </div>
  );
};

export default Header;