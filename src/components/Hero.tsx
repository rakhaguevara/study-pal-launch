import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Discover Your Most Effective{" "}
              <span className="text-gradient">Learning Style</span> with StudyPal
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              AI-powered learning insights to help you study smarter, not harder. 
              Understand your unique learning habits and get personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="btn-gradient rounded-full px-6 sm:px-8 text-sm sm:text-base lg:text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-6 sm:px-8 text-sm sm:text-base lg:text-lg border-2 hover:border-primary"
                onClick={() => {
                  document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Right Content - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden sm:block"
          >
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                <div className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6 lg:p-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto bg-gradient-to-r from-secondary to-primary rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium">Dashboard Preview</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 to-primary/10 pointer-events-none"></div>
            </div>
            {/* Floating Elements - hidden on very small screens */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-white p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl shadow-lg"
            >
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient">98%</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Success Rate</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
