import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import type { ChatListItem } from '../types';
import { Message } from '../components/Message/Message';
import { DaysDivider } from '../components/DaysDivider/DaysDivider';
import { store } from '../../store';
import { AuthContext } from '../../context/AuthContext';

export function measureChatItems(items: ChatListItem[], width: number, username?: string): Promise<Record<string, number>> {
  if (items.length === 0) return Promise.resolve({});

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.visibility = 'hidden';
  container.style.width = `${width}px`;
  container.style.top = '-9999px';
  container.style.left = '0';
  document.body.appendChild(container);

  const root = createRoot(container);

  const dummyAuthValue = {
    isAuthenticated: false,
    userId: null,
    userProfile: null,
    preferredCurrency: null,
    username: username || 'measure-user',
    roles: [],
    publicChatId: null,
    isBanned: false,
    banReason: null,
    bannedAt: null,
    bannedUntil: null,
    loading: false,
    login: async () => {},
    logout: () => {},
    refreshSession: async () => {},
    setPreferredCurrency: () => {},
  };

  return new Promise((resolve) => {
    const MeasureComponent = () => {
      useEffect(() => {
        // Use a small timeout to ensure everything (including Markdown) is rendered and styled
        const timer = setTimeout(() => {
          const heights: Record<string, number> = {};
          const children = container.querySelectorAll('.measure-item');
          children.forEach((child, index) => {
            const item = items[index];
            if (!item) return;
            const h = (child as HTMLElement).offsetHeight;
            heights[item.id] = h > 0 ? h : 50;
          });
          
          root.unmount();
          document.body.removeChild(container);
          resolve(heights);
        }, 150); // Increased timeout a bit more for Markdown and layout settle
        return () => clearTimeout(timer);
      }, []);

      return (
        <AuthContext.Provider value={dummyAuthValue as React.ContextType<typeof AuthContext>}>
          <Provider store={store}>
            <MemoryRouter>
              {items.map((item) => (
                <div key={item.id} className="measure-item">
                  {item.type === 'DAYS-DIVIDER' ? (
                    <DaysDivider date={item.timestamp} />
                  ) : (
                    <Message {...item} />
                  )}
                </div>
              ))}
            </MemoryRouter>
          </Provider>
        </AuthContext.Provider>
      );
    };

    root.render(<MeasureComponent />);
  });
}
