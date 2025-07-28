import React from 'react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

// Import modularized components
import LoginPage from './components/LoginPage';
import ChatUI from './components/ChatUI';
import AdminPortal from './components/AdminPortal';

const App = () => {
  const { user } = useUser();

  return (
    <Router>
      <div className="min-h-screen w-full bg-background text-foreground">
        <SignedOut>
          <div className="absolute top-0 left-0 w-full z-10 flex items-start justify-start bg-transparent p-0">
            <span className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-wider bg-gradient-to-r from-blue-500 to-red-500 bg-clip-text text-transparent mt-3 sm:mt-5 ml-4 sm:ml-6 md:ml-10">
              Ask Asv
            </span>
          </div>
          <LoginPage />
        </SignedOut>
        <SignedIn>
          <Routes>
            <Route path="/" element={user && <ChatUI userId={user.id} />} />
            <Route path="/admin" element={<AdminPortal />} />
          </Routes>
        </SignedIn>
      </div>
    </Router>
  );
};

export default App;