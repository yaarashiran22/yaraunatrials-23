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
  const [isNightTime, setIsNightTime] = useState(false);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  useEffect(() => {
    const updateThemeBasedOnTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setCurrentHour(hour);
      
      // Consider it night time between 6 PM (18:00) and 6 AM (06:00)
      const isNight = hour >= 18 || hour < 6;
      setIsNightTime(isNight);

      // Update CSS variables based on time of day
      const root = document.documentElement;
      
      // Set a lighter purple gradient background
      document.body.style.backgroundImage = `linear-gradient(135deg, hsl(280 70% 70%) 0%, hsl(270 80% 55%) 100%)`;
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.minHeight = '100vh';
      
      if (isNight) {
        // Night theme - colors that complement the gradient
        root.style.setProperty('--foreground', '280 30% 15%');
        root.style.setProperty('--card', '280 50% 80%');
        root.style.setProperty('--card-foreground', '280 25% 15%');
        root.style.setProperty('--border', '280 30% 60%');
        root.style.setProperty('--input', '280 30% 70%');
        root.style.setProperty('--muted', '280 35% 75%');
        root.style.setProperty('--muted-foreground', '280 20% 40%');
      } else {
        // Day theme - lighter colors that work with gradient
        root.style.setProperty('--foreground', '280 30% 15%');
        root.style.setProperty('--card', '280 50% 85%');
        root.style.setProperty('--card-foreground', '280 25% 15%');
        root.style.setProperty('--border', '280 30% 65%');
        root.style.setProperty('--input', '280 30% 75%');
        root.style.setProperty('--muted', '280 35% 80%');
        root.style.setProperty('--muted-foreground', '280 20% 35%');
      }
    };

    // Update immediately
    updateThemeBasedOnTime();

    // Update every minute to check for time changes
    const interval = setInterval(updateThemeBasedOnTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TimeThemeContext.Provider value={{ isNightTime, currentHour }}>
      {children}
    </TimeThemeContext.Provider>
  );
};