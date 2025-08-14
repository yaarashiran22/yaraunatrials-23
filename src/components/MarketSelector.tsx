import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Globe, MapPin, Languages } from 'lucide-react';
import { useMarket, Market, Language } from '@/contexts/MarketContext';
import { getTranslation } from '@/utils/marketTranslations';

const MarketSelector = () => {
  const { 
    currentMarket, 
    currentLanguage, 
    isDetecting, 
    setMarket, 
    setLanguage,
    detectLocationAndMarket 
  } = useMarket();

  const t = (key: string) => getTranslation(currentLanguage, key);

  const marketFlags = {
    israel: '🇮🇱',
    argentina: '🇦🇷'
  };

  const languageNames = {
    he: 'עברית',
    es: 'Español',
    en: 'English'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <span className="text-lg">{marketFlags[currentMarket]}</span>
          <Globe className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold">
          {t('market.switchTo')}
        </div>
        <DropdownMenuSeparator />
        
        {/* Market Selection */}
        <DropdownMenuItem 
          onClick={() => setMarket('israel')}
          className={currentMarket === 'israel' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇮🇱</span>
          {t('market.israel')}
          {currentMarket === 'israel' && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setMarket('argentina')}
          className={currentMarket === 'argentina' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇦🇷</span>
          {t('market.argentina')}
          {currentMarket === 'argentina' && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        {/* Language Override */}
        <div className="px-2 py-1.5 text-sm font-semibold">
          <Languages className="w-4 h-4 inline mr-2" />
          {t('market.language')}
        </div>
        
        <DropdownMenuItem 
          onClick={() => setLanguage('he')}
          className={currentLanguage === 'he' ? 'bg-accent' : ''}
        >
          עברית
          {currentLanguage === 'he' && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setLanguage('es')}
          className={currentLanguage === 'es' ? 'bg-accent' : ''}
        >
          Español
          {currentLanguage === 'es' && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={currentLanguage === 'en' ? 'bg-accent' : ''}
        >
          English
          {currentLanguage === 'en' && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        {/* Auto-detect */}
        <DropdownMenuItem 
          onClick={detectLocationAndMarket}
          disabled={isDetecting}
        >
          <MapPin className="w-4 h-4 mr-2" />
          {isDetecting ? t('common.loading') : t('market.autoDetect')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MarketSelector;