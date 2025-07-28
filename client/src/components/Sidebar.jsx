import React, { useEffect } from 'react';
import { Plus, MessageSquare, X, User, Download } from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Sidebar = ({
  isOpen,
  onClose,
  chatSessions,
  currentSessionId,
  onSelectSession,
  onCreateNewChat,
  search,
  onSearchChange,
  onDownloadChat,
  messages
}) => {
  const { openUserProfile } = useClerk();
  const { user } = useUser();

  // Simple scroll prevention without interfering with mobile keyboard
  useEffect(() => {
    if (isOpen) {
      // For mobile, we'll use a different approach that doesn't interfere with keyboard
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const filteredSessions = chatSessions.filter(session => {
    const userMsgs = session.messages.filter(m => m.sender === 'user');
    let summary = session.title;
    if (userMsgs.length > 0) {
      summary = userMsgs.slice(0, 3).map(m => m.text).join(', ').slice(0, 40) + (userMsgs.length > 3 ? '...' : '');
    }
    return summary.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      {/* Mobile/Tablet Overlay Sidebar */}
      {isOpen && (
        <div 
          className="fixed top-0 left-0 w-full z-[100] flex lg:hidden"
          style={{ 
            height: '100vh',
            height: 'calc(var(--vh, 1vh) * 100)',
            maxHeight: '-webkit-fill-available'
          }}
        >
          {/* Backdrop that closes sidebar */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose} // Closes sidebar when clicked outside
          />

          {/* Mobile Sidebar Content */}
          <div
            className="relative z-[101] w-4/5 max-w-sm bg-card border-r border-border transform transition-transform duration-300 ease-in-out flex flex-col"
            style={{ 
              height: '100vh',
              height: 'calc(var(--vh, 1vh) * 100)',
              maxHeight: '-webkit-fill-available',
              transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
            }}
            onClick={(e) => e.stopPropagation()} // Prevents backdrop from triggering onClick when clicking inside sidebar
          >
            {/* Mobile Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b lg:hidden flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close sidebar"
                tabIndex={0}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* New Chat Button */}
            <div className="p-4 border-b flex-shrink-0">
              <Button
                className="w-full justify-start"
                onClick={onCreateNewChat}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onCreateNewChat())}
                tabIndex={0}
                aria-label="Create new chat"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>

            {/* Chat Search */}
            <div className="p-4 text-sm font-medium text-muted-foreground flex-shrink-0">Chats</div>
            <div className="px-4 pb-4 flex-shrink-0">
              <Input
                type="text"
                placeholder="Search chats..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                tabIndex={0}
                aria-label="Search chat sessions"
              />
            </div>

            {/* Chat Sessions List */}
            <div className="flex-1 overflow-y-auto px-4 space-y-2" role="listbox" aria-label="Chat sessions">
              {filteredSessions.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  No chats found
                </div>
              ) : (
                filteredSessions.map(session => {
                  const userMsgs = session.messages.filter(m => m.sender === 'user');
                  let summary = session.title;
                  if (userMsgs.length > 0) {
                    summary = userMsgs.slice(0, 3).map(m => m.text).join(', ').slice(0, 30) + (userMsgs.length > 3 ? '...' : '');
                  }
                  return (
                    <Button
                      key={session._id}
                      variant={currentSessionId === session._id ? "secondary" : "ghost"}
                      className="w-full justify-start h-auto p-3 text-left"
                      onClick={() => onSelectSession(session._id)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelectSession(session._id))}
                      tabIndex={0}
                      role="option"
                      aria-selected={currentSessionId === session._id}
                      aria-label={`Chat session: ${summary}`}
                    >
                      <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate flex-1 text-sm">{summary}</span>
                    </Button>
                  );
                })
              )}
            </div>

            {/* Download Chat Button */}
            <div className="p-4 border-t flex-shrink-0">
              <Button
                variant="outline"
                className="w-full"
                onClick={onDownloadChat}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onDownloadChat())}
                disabled={!messages.length}
                tabIndex={0}
                aria-label={messages.length ? "Download chat as PDF" : "No messages to download"}
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Download Chat as PDF</span>
                <span className="sm:hidden">Download PDF</span>
              </Button>
            </div>

            {/* User Profile Section */}
            <div className="p-4 border-t flex-shrink-0">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => openUserProfile()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), openUserProfile())}
                tabIndex={0}
                role="button"
                aria-label="Open user profile"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 flex-shrink-0">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="User" className="w-6 h-6 rounded-full" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    {user?.firstName || user?.lastName
                      ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                      : user?.primaryEmailAddress?.emailAddress || user?.emailAddress || ''
                    }
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <div className={`hidden lg:flex fixed left-0 top-0 h-full z-40 bg-card border-r border-border transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64 xl:w-72' : 'w-0'
      } overflow-hidden`}>
        <div className="w-64 xl:w-72 flex flex-col h-full">
          {/* New Chat Button */}
          <div className="p-4 border-b flex-shrink-0">
            <Button
              className="w-full justify-start"
              onClick={onCreateNewChat}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onCreateNewChat())}
              tabIndex={0}
              aria-label="Create new chat"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Chat Search */}
          <div className="p-4 text-sm font-medium text-muted-foreground flex-shrink-0">Chats</div>
          <div className="px-4 pb-4 flex-shrink-0">
            <Input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              tabIndex={0}
              aria-label="Search chat sessions"
            />
          </div>

          {/* Chat Sessions List */}
          <div className="flex-1 overflow-y-auto px-4 space-y-2" role="listbox" aria-label="Chat sessions">
            {filteredSessions.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No chats found
              </div>
            ) : (
              filteredSessions.map(session => {
                const userMsgs = session.messages.filter(m => m.sender === 'user');
                let summary = session.title;
                if (userMsgs.length > 0) {
                  summary = userMsgs.slice(0, 3).map(m => m.text).join(', ').slice(0, 30) + (userMsgs.length > 3 ? '...' : '');
                }
                return (
                  <Button
                    key={session._id}
                    variant={currentSessionId === session._id ? "secondary" : "ghost"}
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={() => onSelectSession(session._id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelectSession(session._id))}
                    tabIndex={0}
                    role="option"
                    aria-selected={currentSessionId === session._id}
                    aria-label={`Chat session: ${summary}`}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate flex-1 text-sm">{summary}</span>
                  </Button>
                );
              })
            )}
          </div>

          {/* Download Chat Button */}
          <div className="p-4 border-t flex-shrink-0">
            <Button
              variant="outline"
              className="w-full"
              onClick={onDownloadChat}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onDownloadChat())}
              disabled={!messages.length}
              tabIndex={0}
              aria-label={messages.length ? "Download chat as PDF" : "No messages to download"}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Chat as PDF
            </Button>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-t flex-shrink-0">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => openUserProfile()}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), openUserProfile())}
              tabIndex={0}
              role="button"
              aria-label="Open user profile"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 flex-shrink-0">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="User" className="w-6 h-6 rounded-full" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="text-sm font-medium truncate">
                  {user?.firstName || user?.lastName
                    ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                    : user?.primaryEmailAddress?.emailAddress || user?.emailAddress || ''
                  }
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>

    </>
  );
};

export default Sidebar;
