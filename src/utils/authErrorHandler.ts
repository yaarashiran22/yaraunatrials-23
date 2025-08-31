import { supabase } from '@/integrations/supabase/client';

export const handleAuthError = (error: any) => {
  // Check if the error is related to JWT expiration
  if (error?.code === 'PGRST301' && error?.message === 'JWT expired') {
    console.log('JWT expired, signing out user...');
    
    // Clear local storage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    
    // Sign out and redirect
    supabase.auth.signOut().then(() => {
      window.location.href = '/login';
    });
    
    return true; // Indicates the error was handled
  }
  
  return false; // Indicates the error was not handled
};