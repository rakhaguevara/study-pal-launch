import { Clock, Calendar, Book, Target } from "lucide-react";
import { motion } from "framer-motion";

const summaryData = [
  {
    icon: Clock,
    label: "Total Study Time",
    value: "24.5 hrs",
    color: "from-orange-400 to-orange-600",
  },
  {
    icon: Calendar,
    label: "Active Days",
    value: "12 days",
    color: "from-blue-400 to-blue-600",
  },
  {
    icon: Book,
    label: "Favorite Subject",
    value: "Mathematics",
    color: "from-indigo-400 to-indigo-600",
  },
  {
    icon: Target,
    label: "Learning Style",
    value: "Visual",
    color: "from-purple-400 to-purple-600",
  },
];

const DashboardCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryData.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-lg bg-gradient-to-br ${item.color} text-white`}
            >
              <item.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardCards;
