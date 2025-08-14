import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

export type Market = 'israel' | 'argentina';
export type Language = 'he' | 'es' | 'en';

interface MarketContextType {
  currentMarket: Market;
  currentLanguage: Language;
  isDetecting: boolean;
  setMarket: (market: Market) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  detectLocationAndMarket: () => Promise<void>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

// Country to market mapping
const COUNTRY_TO_MARKET: Record<string, Market> = {
  'IL': 'israel',
  'PS': 'israel', // Palestine
  'AR': 'argentina',
  'UY': 'argentina', // Uruguay (close neighbor)
  'CL': 'argentina', // Chile (close neighbor)
};

// Market to language mapping
const MARKET_TO_LANGUAGE: Record<Market, Language> = {
  'israel': 'he',
  'argentina': 'es',
};

// Neighborhoods by market
export const NEIGHBORHOODS = {
  israel: [
    'תל אביב מרכז',
    'פלורנטין',
    'נווה צדק',
    'יפו העתיקה',
    'רמת אביב',
    'דיזנגוף',
    'רוטשילד',
    'שוק הכרמל',
    'נמל תל אביב',
    'צפון תל אביב'
  ],
  argentina: [
    'Palermo',
    'Recoleta',
    'San Telmo',
    'Puerto Madero',
    'Villa Crespo',
    'Belgrano',
    'Caballito',
    'Barracas',
    'La Boca',
    'Microcentro'
  ]
};

export const MarketProvider = ({ children }: { children: ReactNode }) => {
  const [currentMarket, setCurrentMarket] = useState<Market>('israel');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('he');
  const [isDetecting, setIsDetecting] = useState(false);
  const { user } = useAuth();

  // Detect user's location using IP geolocation
  const detectLocationAndMarket = async (): Promise<void> => {
    setIsDetecting(true);
    
    try {
      // Use ipapi.co for free IP geolocation
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.country_code) {
        const detectedMarket = COUNTRY_TO_MARKET[data.country_code] || 'israel';
        const detectedLanguage = MARKET_TO_LANGUAGE[detectedMarket];
        
        console.log('Location detected:', data.country_code, '-> Market:', detectedMarket);
        
        // Update local state
        setCurrentMarket(detectedMarket);
        setCurrentLanguage(detectedLanguage);
        
        // Save to localStorage for non-authenticated users
        localStorage.setItem('detectedMarket', detectedMarket);
        localStorage.setItem('detectedLanguage', detectedLanguage);
        
        // If user is authenticated, save to database
        if (user) {
          await saveUserPreferences(detectedMarket, detectedLanguage, true);
        }
      }
    } catch (error) {
      console.error('Failed to detect location:', error);
      
      // Fallback to localStorage or defaults
      const savedMarket = localStorage.getItem('detectedMarket') as Market || 'israel';
      const savedLanguage = localStorage.getItem('detectedLanguage') as Language || 'he';
      
      setCurrentMarket(savedMarket);
      setCurrentLanguage(savedLanguage);
    } finally {
      setIsDetecting(false);
    }
  };

  // Save user preferences to database
  const saveUserPreferences = async (
    market: Market, 
    language: Language, 
    autoDetect: boolean = false
  ): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_market: market,
          language: language,
          auto_detect_market: autoDetect,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  };

  // Load user preferences from database
  const loadUserPreferences = async (): Promise<void> => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCurrentMarket(data.preferred_market as Market);
        setCurrentLanguage(data.language as Language);
        
        // If auto-detect is enabled, run detection
        if (data.auto_detect_market) {
          await detectLocationAndMarket();
        }
      } else {
        // No preferences found, run auto-detection
        await detectLocationAndMarket();
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      await detectLocationAndMarket(); // Fallback to detection
    }
  };

  // Manual market change
  const setMarket = async (market: Market): Promise<void> => {
    const language = MARKET_TO_LANGUAGE[market];
    
    setCurrentMarket(market);
    setCurrentLanguage(language);
    
    // Save to localStorage
    localStorage.setItem('selectedMarket', market);
    localStorage.setItem('selectedLanguage', language);
    
    // Save to database if authenticated
    if (user) {
      await saveUserPreferences(market, language, false);
    }
    
    toast({
      title: market === 'israel' ? 'שוק ישראל נבחר' : 'Mercado Argentina seleccionado',
      description: market === 'israel' 
        ? 'האתר יציג תוכן ישראלי בעברית' 
        : 'El sitio mostrará contenido argentino en español',
    });
  };

  // Manual language change (while keeping same market)
  const setLanguage = async (language: Language): Promise<void> => {
    setCurrentLanguage(language);
    
    // Save to localStorage
    localStorage.setItem('selectedLanguage', language);
    
    // Save to database if authenticated
    if (user) {
      await saveUserPreferences(currentMarket, language, false);
    }
  };

  // Initialize market and language on mount
  useEffect(() => {
    const initializeMarket = async () => {
      if (user) {
        await loadUserPreferences();
      } else {
        // For non-authenticated users, check localStorage first
        const savedMarket = localStorage.getItem('selectedMarket') as Market;
        const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
        
        if (savedMarket && savedLanguage) {
          setCurrentMarket(savedMarket);
          setCurrentLanguage(savedLanguage);
        } else {
          // Run auto-detection
          await detectLocationAndMarket();
        }
      }
    };

    initializeMarket();
  }, [user]);

  return (
    <MarketContext.Provider
      value={{
        currentMarket,
        currentLanguage,
        isDetecting,
        setMarket,
        setLanguage,
        detectLocationAndMarket,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = (): MarketContextType => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
