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
      
      // Set consistent theme colors that work with the blue-purple gradient
      const root = document.documentElement;
      root.style.setProperty('--foreground', '240 30% 15%');
      root.style.setProperty('--card', '260 40% 85%');
      root.style.setProperty('--card-foreground', '240 25% 15%');
      root.style.setProperty('--border', '250 30% 70%');
      root.style.setProperty('--input', '250 30% 75%');
      root.style.setProperty('--muted', '250 35% 80%');
      root.style.setProperty('--muted-foreground', '240 20% 35%');
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