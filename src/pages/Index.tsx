import { useEffect, useRef } from "react";
import { HeroSection } from "@/components/HeroSection";
import { PricingSection } from "@/components/PricingSection";
import { LoginSection } from "@/components/LoginSection";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const loginRef = useRef<HTMLDivElement>(null);
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

  const scrollToLogin = () => {
    loginRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePlanSelection = (plan: "free" | "pro") => {
    console.log(`Selected plan: ${plan}`);
    scrollToLogin();
  };

  return (
    <div className="relative">
      <HeroSection onGetStarted={scrollToLogin} />
      <PricingSection onSelectPlan={handlePlanSelection} />
      <div ref={loginRef}>
        <LoginSection />
      </div>
    </div>
  );
};

export default Index;
