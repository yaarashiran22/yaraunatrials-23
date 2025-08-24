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
      
      // Set the complex radial gradient background
      document.body.style.backgroundImage = `radial-gradient(at 24.873658360913208% 93.33467375529382%, hsla(267.14285714285717, 82.3529411764706%, 40%, 1) 0%, hsla(267.14285714285717, 82.3529411764706%, 40%, 0) 100%), radial-gradient(at 68.8921298378994% 90.71955860473285%, hsla(287.18446601941747, 67.3202614379085%, 30%, 1) 0%, hsla(287.18446601941747, 67.3202614379085%, 30%, 0) 100%), radial-gradient(at 26.37003525383701% 93.29963437360692%, hsla(249.90825688073394, 54.77386934673366%, 39.01960784313726%, 1) 0%, hsla(249.90825688073394, 54.77386934673366%, 39.01960784313726%, 0) 100%), radial-gradient(at 50.74922468076072% 46.279858181868185%, hsla(267.14285714285717, 82.3529411764706%, 40%, 1) 0%, hsla(267.14285714285717, 82.3529411764706%, 40%, 0) 100%), radial-gradient(at 83.21389881892594% 57.171466801187464%, hsla(287.18446601941747, 67.3202614379085%, 30%, 1) 0%, hsla(287.18446601941747, 67.3202614379085%, 30%, 0) 100%), radial-gradient(at 88.50199062532992% 16.541426677082903%, hsla(249.90825688073394, 54.77386934673366%, 39.01960784313726%, 1) 0%, hsla(249.90825688073394, 54.77386934673366%, 39.01960784313726%, 0) 100%), radial-gradient(at 19.034645928530146% 66.93592505058797%, hsla(267.14285714285717, 82.3529411764706%, 40%, 1) 0%, hsla(267.14285714285717, 82.3529411764706%, 40%, 0) 100%), radial-gradient(at 29.932335474395742% 33.69771015257139%, hsla(287.18446601941747, 67.3202614379085%, 30%, 1) 0%, hsla(287.18446601941747, 67.3202614379085%, 30%, 0) 100%), radial-gradient(at 63.97575585312731% 18.728728851907395%, hsla(249.90825688073394, 54.77386934673366%, 39.01960784313726%, 1) 0%, hsla(249.90825688073394, 54.77386934673366%, 39.01960784313726%, 0) 100%), radial-gradient(at 38.805273967018486% 36.27212306722477%, hsla(267.14285714285717, 82.3529411764706%, 40%, 1) 0%, hsla(267.14285714285717, 82.3529411764706%, 40%, 0) 100%)`;
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