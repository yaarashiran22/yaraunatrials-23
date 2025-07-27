import React, { createContext, useContext, useState } from 'react';

interface NewItemContextType {
  isOpen: boolean;
  openNewItem: () => void;
  closeNewItem: () => void;
  refreshItems: () => void;
  setRefreshCallback: (callback: () => void) => void;
}

const NewItemContext = createContext<NewItemContextType | undefined>(undefined);

export const useNewItem = () => {
  const context = useContext(NewItemContext);
  if (context === undefined) {
    throw new Error('useNewItem must be used within a NewItemProvider');
  }
  return context;
};

interface NewItemProviderProps {
  children: React.ReactNode;
}

export const NewItemProvider: React.FC<NewItemProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshCallback, setRefreshCallback] = useState<(() => void) | null>(null);

  const openNewItem = () => setIsOpen(true);
  const closeNewItem = () => setIsOpen(false);
  const refreshItems = () => {
    if (refreshCallback) {
      refreshCallback();
    }
  };
  const setRefreshCallbackFn = (callback: () => void) => {
    setRefreshCallback(() => callback);
  };

  return (
    <NewItemContext.Provider value={{ 
      isOpen, 
      openNewItem, 
      closeNewItem, 
      refreshItems, 
      setRefreshCallback: setRefreshCallbackFn 
    }}>
      {children}
    </NewItemContext.Provider>
  );
};