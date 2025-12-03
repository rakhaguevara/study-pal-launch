import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LearningPathStep } from "@/utils/recommendationEngine";

interface LearningPathCardProps {
  step: LearningPathStep;
  index: number;
  isCompleted?: boolean;
}

export const LearningPathCard = ({
  step,
  index,
  isCompleted = false,
}: LearningPathCardProps) => {
  const levelColors = {
    basic: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
    intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
    advanced: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15 }}
      className="flex-shrink-0 w-[200px] sm:w-[240px] lg:w-[260px]"
    >
      <Card
        className={`h-full border-border bg-card transition-all hover:shadow-md ${
          isCompleted ? "opacity-60" : ""
        }`}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-xl lg:text-2xl">{step.icon}</span>
              <Badge variant="outline" className="text-[10px] sm:text-xs">
                Step {step.step}
              </Badge>
            </div>
            {isCompleted && (
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            )}
          </div>

          <h4 className="font-semibold text-foreground text-xs sm:text-sm mb-1.5 sm:mb-2">
            {step.title}
          </h4>

          <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
            {step.description}
          </p>

          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className={`text-[10px] sm:text-xs capitalize ${levelColors[step.level]}`}
            >
              {step.level}
            </Badge>
            {!isCompleted && (
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface LearningPathSectionProps {
  steps: LearningPathStep[];
  isLoading?: boolean;
}

export const LearningPathSection = ({
  steps,
  isLoading,
}: LearningPathSectionProps) => {
  if (isLoading) {
    return (
      <div className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
          🛤️ Your Learning Path
        </h2>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[200px] sm:w-[240px] lg:w-[260px] animate-pulse">
              <Card>
                <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-muted rounded" />
                    <div className="h-5 bg-muted rounded w-14 sm:w-16" />
                  </div>
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-5 bg-muted rounded w-16 sm:w-20" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 sm:mt-8">
      <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
        🛤️ Your Learning Path
      </h2>
      <div
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-8 sm:px-8"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {steps.map((step, index) => (
          <LearningPathCard key={step.id} step={step} index={index} />
        ))}
      </div>
    </div>
  );
};

export default LearningPathSection;

