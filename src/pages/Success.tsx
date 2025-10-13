import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PartyPopper, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Success = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
      } else {
        setUser(user);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/");
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8 inline-block"
        >
          <PartyPopper className="w-24 h-24 text-secondary drop-shadow-2xl" />
        </motion.div>

        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
          Welcome to StudyPal!
        </h1>

        <p className="text-2xl text-white/90 mb-4 drop-shadow-lg">
          You've successfully logged in.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 mb-8 inline-block"
        >
          <p className="text-white/80">
            Signed in as: <span className="font-semibold text-white">{user.email}</span>
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            size="lg"
            className="bg-white hover:bg-white/90 text-primary py-6 px-8 rounded-2xl font-semibold text-lg shadow-2xl transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Button>

          <Button
            onClick={handleSignOut}
            variant="outline"
            size="lg"
            className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/40 py-6 px-8 rounded-2xl font-semibold text-lg transition-all duration-300"
          >
            Sign Out
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Success;
