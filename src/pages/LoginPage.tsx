
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password, name, '');
      
      if (error) {
        toast({
          title: "שגיאה",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "הצלחה!",
          description: isLogin ? "התחברת בהצלחה" : "נרשמת בהצלחה",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בלתי צפויה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="text-5xl font-black font-nunito" style={{ color: '#BB31E9', textShadow: '0 0 2px rgba(187, 49, 233, 0.5)' }}>una</div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-foreground text-center mb-6">
            {isLogin ? 'התחברות' : 'הרשמה'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Input
                  type="text"
                  placeholder="שם"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 text-right bg-background border border-border rounded-lg"
                  required
                />
              </div>
            )}

            <div>
              <Input
                type="email"
                placeholder="מייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 text-right bg-background border border-border rounded-lg"
                required
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 text-right bg-background border border-border rounded-lg"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? 'מתחבר...' : (isLogin ? 'התחבר' : 'הרשם')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary/80 font-medium"
            >
              {isLogin ? 'אין לך חשבון? הירשם' : 'יש לך חשבון? התחבר'}
            </button>
          </div>

          {!isLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                מעבר לטופס הרשמה מלא
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
