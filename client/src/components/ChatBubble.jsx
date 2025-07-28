import React from 'react';
import ReactMarkdown from 'react-markdown';

const ChatBubble = ({ sender, text, source, confidence }) => {
  const isUser = sender === 'user';
  const isWelcomeMessage = text.includes("I'm Asv, your AI assistant");
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`rounded-lg p-3 sm:p-4 ${
        isWelcomeMessage 
          ? 'max-w-2xl lg:max-w-3xl' 
          : 'max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]'
      } ${
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-foreground'
      }`}>
        {isUser ? (
          <p className={`whitespace-pre-wrap break-words ${
            isWelcomeMessage ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
          }`}>
            {text}
          </p>
        ) : (
          <div className={`${
            isWelcomeMessage ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
          }`}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="my-3">
                      <pre className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg overflow-auto font-mono text-sm text-gray-800 dark:text-gray-100">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                strong({ children }) {
                  return <strong className="font-bold">{children}</strong>;
                },
                p({ children }) {
                  return <p className="mb-2 last:mb-0">{children}</p>;
                },
                ul({ children }) {
                  return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
                },
                li({ children }) {
                  return <li className="ml-2">{children}</li>;
                },
                blockquote({ children }) {
                  return <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2 text-gray-600 dark:text-gray-400">{children}</blockquote>;
                },
                h1({ children }) {
                  return <h1 className="text-xl font-bold mb-2">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="text-lg font-bold mb-2">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-base font-bold mb-2">{children}</h3>;
                },
                table({ children }) {
                  return <div className="overflow-hidden my-2"><table className="min-w-full border border-gray-300 dark:border-gray-600">{children}</table></div>;
                },
                th({ children }) {
                  return <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-100 dark:bg-gray-700 font-bold">{children}</th>;
                },
                td({ children }) {
                  return <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{children}</td>;
                }
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;