import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BackButton from "@/components/BackButton";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Get return path and action from URL parameters
  const returnTo = searchParams.get('returnTo');
  const action = searchParams.get('action');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      // If user came from booking, redirect to appointment booking
      if (returnTo) {
        navigate(returnTo);
      } else if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'diagnostic_center_admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate, returnTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn(email, password);
    
    if (result.success) {
      const userData = result.data?.user;
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData?.name || userData?.email}!`,
      });
      
      // If user came from booking, redirect to appointment booking
      if (returnTo) {
        navigate(returnTo);
      } else if (userData?.role === 'admin' || userData?.role === 'super_admin' || userData?.role === 'diagnostic_center_admin') {
        navigate('/admin');
      } else {
        // Regular users (patients) go to dashboard
        navigate('/dashboard');
      }
    } else {
      toast({
        title: "Login Failed",
        description: result.error?.message || "Invalid credentials",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <BackButton to="/" />
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              {action === 'book' 
                ? "Please login to book your appointment" 
                : "Enter your credentials to access your account"
              }
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Don't have an account?{" "}
                <Link 
                  to={returnTo ? `/register?returnTo=${returnTo}&action=${action}` : "/register"} 
                  className="text-primary hover:underline"
                >
                  Register here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
