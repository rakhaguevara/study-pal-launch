import { motion } from "framer-motion";
import { Construction, Sparkles } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon = ({ title, description }: ComingSoonProps) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto"
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
          className="mb-8 inline-block"
        >
          <div className="relative">
            <Construction className="h-24 w-24 mx-auto text-primary" strokeWidth={1.5} />
            <Sparkles className="h-8 w-8 text-secondary absolute -top-2 -right-2 animate-pulse" />
          </div>
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          {title}
        </h1>
        
        <div className="space-y-4">
          <p className="text-xl text-muted-foreground">
            🚧 This feature is under development
          </p>
          
          {description && (
            <p className="text-lg text-muted-foreground/80">
              {description}
            </p>
          )}
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base text-muted-foreground/60 pt-4"
          >
            We're working to bring you smarter tools soon! ✨
          </motion.p>
        </div>
        
        <motion.div
          className="mt-12 p-6 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-2xl border border-primary/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-muted-foreground">
            Stay tuned for updates as we continue to enhance your StudyPal experience
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
