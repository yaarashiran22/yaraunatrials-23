import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface EnhancedAuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string, mobileNumber?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  deleteAccount: () => Promise<{ error: any }>;
  // Enhanced security methods
  requireEmailVerification: boolean;
  isEmailVerified: boolean;
  checkSession: () => Promise<boolean>;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requireEmailVerification] = useState(true); // Enable email verification requirement

  // Check if user's email is verified
  const isEmailVerified = user?.email_confirmed_at !== null;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        toast({
          title: "שגיאת אבטחה",
          description: "בעיה בטעינת הפרטים שלך",
          variant: "destructive",
        });
      }
      
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);

      // Handle authentication events
      switch (event) {
        case 'SIGNED_IN':
          if (session?.user && !session.user.email_confirmed_at && requireEmailVerification) {
            toast({
              title: "אמת את האימייל שלך",
              description: "נשלח לך מייל עם קישור לאימות",
              variant: "default",
            });
          }
          break;
        case 'SIGNED_OUT':
          // Clear any cached data
          break;
        case 'TOKEN_REFRESHED':
          // Token was refreshed successfully
          break;
        case 'USER_UPDATED':
          // User profile was updated
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, [requireEmailVerification]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        // Enhanced error handling
        let errorMessage = "שגיאה בהתחברות";
        
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = "אימייל או סיסמה שגויים";
            break;
          case 'Email not confirmed':
            errorMessage = "נא לאמת את האימייל שלך לפני ההתחברות";
            break;
          case 'Too many requests':
            errorMessage = "יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר";
            break;
          default:
            errorMessage = error.message;
        }

        toast({
          title: "שגיאת התחברות",
          description: errorMessage,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name?: string, mobileNumber?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { 
            name: name?.trim() || '',
            mobile_number: mobileNumber?.trim() || ''
          }
        }
      });

      if (error) {
        let errorMessage = "שגיאה ברישום";
        
        switch (error.message) {
          case 'User already registered':
            errorMessage = "האימייל כבר רשום במערכת";
            break;
          case 'Password should be at least 6 characters':
            errorMessage = "הסיסמה חייבת להכיל לפחות 6 תווים";
            break;
          case 'Invalid email':
            errorMessage = "כתובת אימייל לא תקינה";
            break;
          default:
            errorMessage = error.message;
        }

        toast({
          title: "שגיאת רישום",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "רישום בוצע בהצלחה",
          description: "נשלח לך מייל לאימות החשבון",
          variant: "default",
        });
      }

      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "שגיאה",
          description: "בעיה בהתנתקות מהמערכת",
          variant: "destructive",
        });
        throw error;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.toLowerCase().trim(),
      });

      if (!error) {
        toast({
          title: "מייל נשלח",
          description: "נשלח מייל חדש לאימות החשבון",
          variant: "default",
        });
      }

      return { error };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (!error) {
        toast({
          title: "מייל לאיפוס סיסמה נשלח",
          description: "בדוק את האימייל שלך",
          variant: "default",
        });
      }

      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (!error) {
        toast({
          title: "הסיסמה עודכנה",
          description: "הסיסמה שלך שונתה בהצלחה",
          variant: "default",
        });
      }

      return { error };
    } catch (error) {
      console.error('Update password error:', error);
      return { error };
    }
  };

  const deleteAccount = async () => {
    try {
      // Note: This requires server-side implementation
      // For now, we'll just sign out and show a message
      await signOut();
      
      toast({
        title: "מחיקת חשבון",
        description: "פנה לתמיכה למחיקת החשבון",
        variant: "default",
      });

      return { error: null };
    } catch (error) {
      console.error('Delete account error:', error);
      return { error };
    }
  };

  const checkSession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        return false;
      }

      return !!session;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  };

  return (
    <EnhancedAuthContext.Provider value={{
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      resendConfirmation,
      resetPassword,
      updatePassword,
      deleteAccount,
      requireEmailVerification,
      isEmailVerified,
      checkSession,
    }}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};