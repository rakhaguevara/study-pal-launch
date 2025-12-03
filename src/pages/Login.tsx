import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkProfileAndNavigate = async (user: any) => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('quiz_completed')
        .eq('firebase_uid', user.uid)
        .single();

      if (!profile) {
        navigate("/onboarding");
      } else if (!profile.quiz_completed) {
        navigate("/quiz");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      navigate("/onboarding");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let user;
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;
        toast({
          title: "Account created!",
          description: "You've been automatically signed in.",
        });
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      }
      await checkProfileAndNavigate(user);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      toast({
        title: "Welcome!",
        description: "You've successfully signed in with Google.",
      });
      await checkProfileAndNavigate(result.user);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm sm:max-w-md"
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 sm:mb-6 text-xs sm:text-sm"
          size="sm"
        >
          <ArrowLeft className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Back to Home
        </Button>

        {/* Login Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1.5 sm:mb-2 text-center">
            {isSignUp ? "Join StudyPal" : "Welcome back to StudyPal!"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground text-center mb-5 sm:mb-6 lg:mb-8">
            {isSignUp ? "Create your account to get started" : "Sign in to continue your learning journey"}
          </p>

          <Button
            onClick={handleGoogleAuth}
            className="w-full mb-4 sm:mb-6 bg-white hover:bg-muted border-2 border-border text-foreground py-4 sm:py-5 lg:py-6 rounded-full font-semibold shadow-sm transition-all text-xs sm:text-sm"
          >
            <Mail className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Continue with Google
          </Button>

          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-3 sm:px-4 bg-white text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground mb-1.5 sm:mb-2 block text-xs sm:text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="py-4 sm:py-5 lg:py-6 rounded-full text-sm"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground mb-1.5 sm:mb-2 block text-xs sm:text-sm">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="py-4 sm:py-5 lg:py-6 rounded-full text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-4 sm:py-5 lg:py-6 rounded-full font-semibold text-sm"
            >
              {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-3 sm:mt-4 text-muted-foreground hover:text-primary text-xs sm:text-sm transition-colors"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
