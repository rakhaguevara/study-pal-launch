import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Discover Your Most Effective{" "}
              <span className="text-gradient">Learning Style</span> with StudyPal
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              AI-powered learning insights to help you study smarter, not harder. 
              Understand your unique learning habits and get personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="btn-gradient rounded-full px-8 text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 text-lg border-2 hover:border-primary"
                onClick={() => {
                  document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Play className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Right Content - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-secondary to-primary rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground font-medium">Dashboard Preview</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 to-primary/10 pointer-events-none"></div>
            </div>
            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg"
            >
              <div className="text-2xl font-bold text-gradient">98%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
