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
      
      // Set the gradient background for all times
      document.body.style.backgroundImage = `radial-gradient(at 5.472551278054583% 77.6940494641994%, hsla(214.05405405405406, 65.68047337278107%, 33.13725490196079%, 1) 0%, hsla(214.05405405405406, 65.68047337278107%, 33.13725490196079%, 0) 100%), radial-gradient(at 46.16895314956162% 98.02136190474828%, hsla(286.9767441860465, 84.31372549019606%, 30.000000000000004%, 1) 0%, hsla(286.9767441860465, 84.31372549019606%, 30.000000000000004%, 0) 100%), radial-gradient(at 53.74719405375307% 57.09507727582264%, hsla(214.05405405405406, 65.68047337278107%, 33.13725490196079%, 1) 0%, hsla(214.05405405405406, 65.68047337278107%, 33.13725490196079%, 0) 100%), radial-gradient(at 83.4302741694132% 63.25320120431477%, hsla(286.9767441860465, 84.31372549019606%, 30.000000000000004%, 1) 0%, hsla(286.9767441860465, 84.31372549019606%, 30.000000000000004%, 0) 100%)`;
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.minHeight = '100vh';
      
      if (isNight) {
        // Night theme - keep darker foreground
        root.style.setProperty('--foreground', '240 10% 90%');
        root.style.setProperty('--card', '240 20% 18%');
        root.style.setProperty('--card-foreground', '240 10% 88%');
      } else {
        // Day theme - adjust for better contrast with gradient
        root.style.setProperty('--foreground', '240 10% 95%');
        root.style.setProperty('--card', '240 20% 15%');
        root.style.setProperty('--card-foreground', '240 10% 90%');
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