import { motion } from "framer-motion";
import { Lightbulb, BookOpen, Brain, Sparkles } from "lucide-react";

const tips = [
  {
    icon: Lightbulb,
    title: "Visual Learning Boost",
    description: "Try using mind maps and diagrams to organize complex topics.",
    color: "from-yellow-400 to-orange-500",
  },
  {
    icon: BookOpen,
    title: "Consistent Study Schedule",
    description: "Study at the same time each day to build a strong routine.",
    color: "from-blue-400 to-indigo-500",
  },
  {
    icon: Brain,
    title: "Active Recall Practice",
    description: "Test yourself regularly instead of just re-reading notes.",
    color: "from-purple-400 to-pink-500",
  },
  {
    icon: Sparkles,
    title: "Take Regular Breaks",
    description: "Use the Pomodoro technique: 25 min study, 5 min break.",
    color: "from-green-400 to-teal-500",
  },
];

const RecommendedTips = () => {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Recommended Tips for You
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip, index) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow card-hover"
          >
            <div className="flex gap-4">
              <div
                className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-br ${tip.color} text-white`}
              >
                <tip.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  {tip.title}
                </h3>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedTips;
