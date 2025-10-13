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
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-secondary/5 to-primary/5">
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
          <div className="w-24 h-24 bg-gradient-to-r from-secondary to-primary rounded-full flex items-center justify-center mx-auto">
            <PartyPopper className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Welcome to StudyPal!
        </h1>

        <p className="text-xl text-muted-foreground mb-8">
          ✅ You have successfully logged in
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 mb-8 inline-block shadow-lg"
        >
          <p className="text-muted-foreground">
            Signed in as: <span className="font-semibold text-foreground">{user.email}</span>
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            size="lg"
            className="btn-gradient py-6 px-8 rounded-full font-semibold"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Button>

          <Button
            onClick={handleSignOut}
            variant="outline"
            size="lg"
            className="border-2 py-6 px-8 rounded-full font-semibold"
          >
            Sign Out
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Success;
