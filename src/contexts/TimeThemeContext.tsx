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
      
      // Set the beautiful purple-blue gradient background
      document.body.style.backgroundImage = `linear-gradient(135deg, hsl(250 60% 65%) 0%, hsl(280 70% 45%) 100%)`;
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.minHeight = '100vh';
      
      if (isNight) {
        // Night theme - colors that complement the gradient
        root.style.setProperty('--foreground', '280 30% 95%');
        root.style.setProperty('--card', '260 40% 20%');
        root.style.setProperty('--card-foreground', '280 25% 90%');
        root.style.setProperty('--border', '260 30% 35%');
        root.style.setProperty('--input', '260 30% 25%');
        root.style.setProperty('--muted', '260 35% 25%');
        root.style.setProperty('--muted-foreground', '280 20% 70%');
      } else {
        // Day theme - lighter colors that work with gradient
        root.style.setProperty('--foreground', '280 30% 95%');
        root.style.setProperty('--card', '260 50% 25%');
        root.style.setProperty('--card-foreground', '280 25% 92%');
        root.style.setProperty('--border', '260 30% 40%');
        root.style.setProperty('--input', '260 30% 30%');
        root.style.setProperty('--muted', '260 35% 30%');
        root.style.setProperty('--muted-foreground', '280 20% 75%');
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