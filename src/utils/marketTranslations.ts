import { Market, Language } from '@/contexts/MarketContext';

// Extended translations for both markets
export const marketTranslations = {
  // Hebrew (Israel)
  he: {
    common: {
      home: 'בית',
      profile: 'פרופיל',
      settings: 'הגדרות',
      favorites: 'מועדפים',
      search: 'חיפוש',
      back: 'חזרה',
      loading: 'טוען...',
      error: 'שגיאה',
      success: 'הצלחה',
      save: 'שמור',
      cancel: 'ביטול',
      delete: 'מחק',
      edit: 'ערוך',
      view: 'צפה',
      share: 'שתף',
      location: 'מיקום',
      price: 'מחיר',
      description: 'תיאור',
      contact: 'צור קשר',
      login: 'התחבר',
      register: 'הירשם',
      logout: 'התנתק'
    },
    sections: {
      neighbors: 'השכנים שלי',
      joinMe: 'בואו נפגש',
      marketplace: 'מרקטפלייס',
      events: 'אירועים',
      gallery: 'גלרייה'
    },
    marketplace: {
      title: 'מרקטפלייס',
      condition: 'מצב',
      seller: 'מוכר',
      newCondition: 'כמו חדש',
      usedCondition: 'משומש',
      categories: {
        all: 'הכל',
        fashion: 'אופנה',
        electronics: 'אלקטרוניקה',
        home: 'בית וגן',
        books: 'ספרים',
        sports: 'ספורט'
      }
    },
    events: {
      title: 'אירועים',
      date: 'תאריך',
      time: 'שעה',
      organizer: 'מארגן',
      participants: 'משתתפים',
      joinEvent: 'הצטרף לאירוע'
    },
    neighborhoods: {
      select: 'בחר שכונה',
      telAvivCenter: 'תל אביב מרכז',
      florentin: 'פלורנטין',
      neveTzedek: 'נווה צדק',
      oldJaffa: 'יפו העתיקה',
      ramatAviv: 'רמת אביב',
      dizengoff: 'דיזנגוף',
      rothschild: 'רוטשילד',
      carmelMarket: 'שוק הכרמל',
      tlvPort: 'נמל תל אביב',
      northTlv: 'צפון תל אביב'
    },
    market: {
      switchTo: 'עבור לשוק',
      israel: 'ישראל',
      argentina: 'ארגנטינה',
      language: 'שפה',
      autoDetect: 'זיהוי אוטומטי'
    }
  },
  
  // Spanish (Argentina)
  es: {
    common: {
      home: 'Inicio',
      profile: 'Perfil',
      settings: 'Configuración',
      favorites: 'Favoritos',
      search: 'Buscar',
      back: 'Volver',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      view: 'Ver',
      share: 'Compartir',
      location: 'Ubicación',
      price: 'Precio',
      description: 'Descripción',
      contact: 'Contactar',
      login: 'Iniciar sesión',
      register: 'Registrarse',
      logout: 'Cerrar sesión'
    },
    sections: {
      neighbors: 'Mis Vecinos',
      joinMe: 'Encontrémonos',
      marketplace: 'Marketplace',
      events: 'Eventos',
      gallery: 'Galería'
    },
    marketplace: {
      title: 'Marketplace',
      condition: 'Estado',
      seller: 'Vendedor',
      newCondition: 'Como nuevo',
      usedCondition: 'Usado',
      categories: {
        all: 'Todo',
        fashion: 'Moda',
        electronics: 'Electrónicos',
        home: 'Hogar y jardín',
        books: 'Libros',
        sports: 'Deportes'
      }
    },
    events: {
      title: 'Eventos',
      date: 'Fecha',
      time: 'Hora',
      organizer: 'Organizador',
      participants: 'Participantes',
      joinEvent: 'Unirse al evento'
    },
    neighborhoods: {
      select: 'Seleccionar barrio',
      palermo: 'Palermo',
      recoleta: 'Recoleta',
      sanTelmo: 'San Telmo',
      puertoMadero: 'Puerto Madero',
      villaCrespo: 'Villa Crespo',
      belgrano: 'Belgrano',
      caballito: 'Caballito',
      barracas: 'Barracas',
      laBoca: 'La Boca',
      microcentro: 'Microcentro'
    },
    market: {
      switchTo: 'Cambiar a mercado',
      israel: 'Israel',
      argentina: 'Argentina',
      language: 'Idioma',
      autoDetect: 'Detección automática'
    }
  },
  
  // English (fallback)
  en: {
    common: {
      home: 'Home',
      profile: 'Profile',
      settings: 'Settings',
      favorites: 'Favorites',
      search: 'Search',
      back: 'Back',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      share: 'Share',
      location: 'Location',
      price: 'Price',
      description: 'Description',
      contact: 'Contact',
      login: 'Login',
      register: 'Register',
      logout: 'Logout'
    },
    sections: {
      neighbors: 'My Neighbors',
      joinMe: 'Let\'s Meet',
      marketplace: 'Marketplace',
      events: 'Events',
      gallery: 'Gallery'
    },
    marketplace: {
      title: 'Marketplace',
      condition: 'Condition',
      seller: 'Seller',
      newCondition: 'Like new',
      usedCondition: 'Used',
      categories: {
        all: 'All',
        fashion: 'Fashion',
        electronics: 'Electronics',
        home: 'Home & garden',
        books: 'Books',
        sports: 'Sports'
      }
    },
    events: {
      title: 'Events',
      date: 'Date',
      time: 'Time',
      organizer: 'Organizer',
      participants: 'Participants',
      joinEvent: 'Join event'
    },
    neighborhoods: {
      select: 'Select neighborhood'
    },
    market: {
      switchTo: 'Switch to market',
      israel: 'Israel',
      argentina: 'Argentina',
      language: 'Language',
      autoDetect: 'Auto detect'
    }
  }
};

// Currency by market
export const getCurrency = (market: Market): string => {
  return market === 'israel' ? '₪' : '$';
};

// Format price based on market
export const formatPrice = (price: number, market: Market): string => {
  const currency = getCurrency(market);
  
  if (market === 'israel') {
    return `${currency}${price}`;
  } else {
    // Argentina - format with thousands separator
    return `${currency}${price.toLocaleString('es-AR')}`;
  }
};

// Get translation helper
export const getTranslation = (
  language: Language,
  key: string
): string => {
  const keys = key.split('.');
  let value: any = marketTranslations[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

// Direction by language
export const getDirection = (language: Language): 'rtl' | 'ltr' => {
  return language === 'he' ? 'rtl' : 'ltr';
};