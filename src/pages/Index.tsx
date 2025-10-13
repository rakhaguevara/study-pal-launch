import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Plans } from "@/components/Plans";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate("/success");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/success");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
      <Plans />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
