import { motion } from "framer-motion";
import { Construction, Sparkles } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon = ({ title, description }: ComingSoonProps) => {
  return (
    // Responsive min-height - padding is handled by AppShell
    <div className="min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-xl sm:max-w-2xl mx-auto w-full"
      >
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-6 sm:mb-8 inline-block"
        >
          <div className="relative">
            <Construction className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 mx-auto text-primary" strokeWidth={1.5} />
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-secondary absolute -top-1 -right-1 sm:-top-2 sm:-right-2 animate-pulse" />
          </div>
        </motion.div>
        
        {/* Responsive title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2">
          {title}
        </h1>
        
        <div className="space-y-3 sm:space-y-4">
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
            🚧 This feature is under development
          </p>
          
          {description && (
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground/80 px-2">
              {description}
            </p>
          )}
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm sm:text-base text-muted-foreground/60 pt-2 sm:pt-4"
          >
            We're working to bring you smarter tools soon! ✨
          </motion.p>
        </div>
        
        <motion.div
          className="mt-8 sm:mt-10 lg:mt-12 p-4 sm:p-5 lg:p-6 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl sm:rounded-2xl border border-primary/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs sm:text-sm text-muted-foreground">
            Stay tuned for updates as we continue to enhance your StudyPal experience
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
