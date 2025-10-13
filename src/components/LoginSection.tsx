import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const LoginSection = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/success`,
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      }
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/success`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <section id="login" className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          <h2 className="text-4xl font-bold text-white mb-2 text-center">
            {isSignUp ? "Join StudyPal" : "Sign In to StudyPal"}
          </h2>
          <p className="text-white/70 text-center mb-8">
            {isSignUp ? "Create your account to get started" : "Welcome back!"}
          </p>

          <Button
            onClick={handleGoogleAuth}
            className="w-full mb-6 bg-white hover:bg-white/90 text-primary py-6 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-300"
          >
            <Mail className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/70">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="bg-white/10 border-white/30 text-white placeholder:text-white/50 py-6 rounded-2xl"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white/10 border-white/30 text-white placeholder:text-white/50 py-6 rounded-2xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-secondary/90 text-white py-6 rounded-2xl font-semibold text-lg glow-secondary transition-all duration-300"
            >
              {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-4 text-white/80 hover:text-white text-sm transition-colors"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </section>
  );
};
