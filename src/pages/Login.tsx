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
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-foreground mb-2 text-center">
            {isSignUp ? "Join StudyPal" : "Welcome back to StudyPal!"}
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            {isSignUp ? "Create your account to get started" : "Sign in to continue your learning journey"}
          </p>

          <Button
            onClick={handleGoogleAuth}
            className="w-full mb-6 bg-white hover:bg-muted border-2 border-border text-foreground py-6 rounded-full font-semibold shadow-sm transition-all"
          >
            <Mail className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="py-6 rounded-full"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="py-6 rounded-full"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-6 rounded-full font-semibold"
            >
              {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-4 text-muted-foreground hover:text-primary text-sm transition-colors"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
