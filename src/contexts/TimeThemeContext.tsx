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
      
      if (isNight) {
        // Night theme - darker purple-blue
        root.style.setProperty('--background', '240 25% 15%');
        root.style.setProperty('--foreground', '240 10% 90%');
        root.style.setProperty('--card', '240 20% 18%');
        root.style.setProperty('--card-foreground', '240 10% 88%');
      } else {
        // Day theme - lighter bright colors
        root.style.setProperty('--background', '220 40% 98%');
        root.style.setProperty('--foreground', '240 20% 20%');
        root.style.setProperty('--card', '0 0% 100%');
        root.style.setProperty('--card-foreground', '215 25% 27%');
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