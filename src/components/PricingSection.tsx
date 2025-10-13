import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingSectionProps {
  onSelectPlan: (plan: "free" | "pro") => void;
}

export const PricingSection = ({ onSelectPlan }: PricingSectionProps) => {
  const plans = [
    {
      name: "Free Plan",
      price: "$0",
      period: "forever",
      features: [
        "Basic learning style test",
        "Discover your learning type",
        "Limited study tips",
      ],
      type: "free" as const,
      popular: false,
    },
    {
      name: "Pro Plan",
      price: "$4.99",
      period: "per month",
      features: [
        "Advanced analytics dashboard",
        "Progress tracking & insights",
        "Personalized study schedules",
        "Priority support",
      ],
      type: "pro" as const,
      popular: true,
    },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            Choose Your Plan
          </h2>
          <p className="text-lg text-white/80 drop-shadow-md">
            Start free or unlock premium features
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  Popular
                </div>
              )}
              <div className="glass-card p-8 h-full flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/70 ml-2">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/90">
                      <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => onSelectPlan(plan.type)}
                  className={`w-full py-6 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                    plan.popular
                      ? "bg-secondary hover:bg-secondary/90 text-white glow-secondary"
                      : "bg-white/20 hover:bg-white/30 text-white border-2 border-white/40"
                  }`}
                >
                  {plan.popular ? "Get Pro" : "Start Free"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
