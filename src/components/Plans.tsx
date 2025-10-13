import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Plans = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Basic learning style test",
        "Discover your learning type",
        "Limited study tips",
        "Community support",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "$4.99",
      period: "per month",
      features: [
        "Advanced analytics dashboard",
        "Progress tracking & insights",
        "Personalized study schedules",
        "AI-powered recommendations",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "per month",
      features: [
        "Everything in Pro",
        "1-on-1 coaching sessions",
        "Custom learning paths",
        "Team collaboration tools",
        "Advanced AI features",
        "White-label options",
      ],
      popular: false,
    },
  ];

  return (
    <section id="plans" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free or unlock premium features to supercharge your learning
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-2xl p-8 shadow-sm ${
                plan.popular ? "ring-2 ring-primary shadow-xl scale-105" : ""
              } card-hover`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-secondary to-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                </div>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => navigate("/login")}
                className={`w-full rounded-full py-6 font-semibold ${
                  plan.popular
                    ? "btn-gradient"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                Subscribe Now
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
