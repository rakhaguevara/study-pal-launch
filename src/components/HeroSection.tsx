import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-7xl md:text-8xl font-bold text-white mb-6 drop-shadow-2xl">
            StudyPal
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-8 drop-shadow-lg">
            Discover Your Best Way to Learn
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            StudyPal helps you understand your learning habits and discover the most effective way to study — 
            whether you're a visual, auditory, or kinesthetic learner.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-2xl font-semibold shadow-2xl glow-primary transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
