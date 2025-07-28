import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModeToggle } from './mode-toggle';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const socialLinks = [
    {
      href: 'https://linkedin.com/in/adadasaivenkat',
      label: 'LinkedIn',
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <path fill="#0077B5" d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.29c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.29h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" />
        </svg>
      )
    },
    {
      href: 'https://github.com/adadasaivenkat',
      label: 'GitHub',
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 0c-6.63 0-12 5.37-12 12 0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.399 3-.404 1.02.005 2.04.137 3 .404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.624-5.475 5.92.43.37.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.218.694.825.576 4.765-1.587 8.2-6.086 8.2-11.385 0-6.63-5.37-12-12-12z" />
        </svg>
      )
    },
    {
      href: 'mailto:adadasaivenkat0109@gmail.com',
      label: 'Gmail',
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 13.065l-8-6.065v10.5c0 .828.672 1.5 1.5 1.5h13c.828 0 1.5-.672 1.5-1.5v-10.5l-8 6.065z" />
          <path fill="#34A853" d="M21.5 4.5h-19c-.828 0-1.5.672-1.5 1.5v.765l10 7.5 10-7.5v-.765c0-.828-.672-1.5-1.5-1.5z" />
          <path fill="#FBBC05" d="M3.5 4.5l8.5 6.375 8.5-6.375h-17z" />
          <path fill="#4285F4" d="M21.5 4.5h-19c-.828 0-1.5.672-1.5 1.5v12c0 .828.672 1.5 1.5 1.5h19c.828 0 1.5-.672 1.5-1.5v-12c0-.828-.672-1.5-1.5-1.5zm0 13.5h-19v-10.5l8.5 6.375c.19.143.42.225.66.225s.47-.082.66-.225l8.5-6.375v10.5z" />
        </svg>
      )
    }
  ];

  const clerkAppearance = {
    elements: {
      card: "bg-card border shadow-lg w-full max-w-md",
      headerTitle: "text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 text-center",
      formButtonPrimary: "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-colors duration-200",
      footerAction: { display: "none" },
      footerActionLink: { display: "none" },
      footer: { display: "none" }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8 pt-16">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      
      <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 w-full max-w-md">
        {isSignUp ? (
          <SignUp
            routing="virtual"
            appearance={clerkAppearance}
            afterSignUpUrl="/"
            redirectUrl="/"
            signInUrl=""
          />
        ) : (
          <SignIn
            routing="virtual"
            appearance={clerkAppearance}
            afterSignInUrl="/"
            redirectUrl="/"
            signUpUrl=""
          />
        )}
        <div className="w-full flex justify-end mt-2">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-muted-foreground hover:text-foreground text-sm sm:text-base"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
        </div>
      </div>
      
      <div className="w-full flex justify-center gap-2 mb-4">
        {socialLinks.map((link, idx) => (
          <div key={link.label} className="relative group">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-muted-foreground hover:text-foreground w-10 h-10 sm:w-12 sm:h-12"
            >
              <a
                href={link.href}
                {...(link.label === 'Gmail' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {React.cloneElement(link.icon, { width: 16, height: 16 })}
              </a>
            </Button>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border">
              {link.label}
            </span>
          </div>
        ))}
      </div>
      
      <div className="text-muted-foreground text-xs sm:text-sm text-center">
        © {new Date().getFullYear()} Ask Asv. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;