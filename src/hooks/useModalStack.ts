import { useState, useCallback } from "react";

interface ModalState {
  id: string;
  component: React.ComponentType<any>;
  props?: any;
}

// Simple modal stack manager to reduce modal depth
export const useModalStack = () => {
  const [modalStack, setModalStack] = useState<ModalState[]>([]);

  const pushModal = useCallback((modal: ModalState) => {
    setModalStack(prev => [...prev, modal]);
  }, []);

  const popModal = useCallback(() => {
    setModalStack(prev => prev.slice(0, -1));
  }, []);

  const replaceModal = useCallback((modal: ModalState) => {
    setModalStack(prev => [...prev.slice(0, -1), modal]);
  }, []);

  const clearModals = useCallback(() => {
    setModalStack([]);
  }, []);

  const currentModal = modalStack[modalStack.length - 1];
  const hasModals = modalStack.length > 0;
  const modalDepth = modalStack.length;

  return {
    currentModal,
    hasModals,
    modalDepth,
    pushModal,
    popModal,
    replaceModal,
    clearModals,
  };
};