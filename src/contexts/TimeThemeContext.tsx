import React, { createContext, useContext, useState, useEffect } from 'react';

interface TimeThemeContextType {
  isNightTime: boolean;
  currentHour: number;
}

const TimeThemeContext = createContext<TimeThemeContextType | undefined>(undefined);

export const useTimeTheme = () => {
  const context = useContext(TimeThemeContext);
  if (context === undefined) {
    throw new Error('useTimeTheme must be used within a TimeThemeProvider');
  }
  return context;
};

export const TimeThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  useEffect(() => {
    const updateTheme = () => {
      const now = new Date();
      setCurrentHour(now.getHours());
      
      // Set beautiful blue-purple gradient background
      document.body.style.backgroundImage = `linear-gradient(135deg, hsl(260 80% 65%) 0%, hsl(280 70% 55%) 50%, hsl(240 75% 45%) 100%)`;
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.minHeight = '100vh';
      
      // Set consistent theme colors with maximum text contrast
      const root = document.documentElement;
      root.style.setProperty('--foreground', '0 0% 0%'); // Pure black text
      root.style.setProperty('--card', '0 0% 100%'); // Pure white cards
      root.style.setProperty('--card-foreground', '0 0% 0%'); // Pure black text on cards
      root.style.setProperty('--border', '240 20% 70%'); // Visible borders
      root.style.setProperty('--input', '0 0% 100%'); // White input backgrounds
      root.style.setProperty('--muted', '0 0% 95%'); // Light muted areas
      root.style.setProperty('--muted-foreground', '0 0% 0%'); // Black muted text
    };

    // Update immediately
    updateTheme();

    // Update every minute
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TimeThemeContext.Provider value={{ isNightTime: false, currentHour }}>
      {children}
    </TimeThemeContext.Provider>
  );
};