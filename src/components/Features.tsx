import { motion } from "framer-motion";
import { BarChart3, Brain, Target, TrendingUp } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Track Your Study Habits",
      description: "Monitor your learning patterns and study sessions with detailed analytics and insights.",
    },
    {
      icon: Brain,
      title: "Identify Your Learning Style",
      description: "Discover whether you're a visual, auditory, or kinesthetic learner with our AI assessment.",
    },
    {
      icon: Target,
      title: "AI-Based Recommendations",
      description: "Get personalized study strategies tailored to your unique learning style and goals.",
    },
    {
      icon: TrendingUp,
      title: "Simple Reports & Analytics",
      description: "Access clear, actionable reports that help you understand your progress at a glance.",
    },
  ];

  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Powerful Features for Effective Learning
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Everything you need to understand and optimize your learning journey
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm card-hover"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-secondary to-primary rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
