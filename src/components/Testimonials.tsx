import { motion } from "framer-motion";
import { Star } from "lucide-react";

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Medical Student",
      content: "StudyPal helped me discover I'm a visual learner. My grades improved by 30% after implementing their recommendations!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      content: "The AI-powered insights are incredible. Finally, a study app that understands how I learn best.",
      rating: 5,
    },
    {
      name: "Emma Williams",
      role: "High School Teacher",
      content: "I recommend StudyPal to all my students. It's transformed how they approach learning and studying.",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Loved by Learners Worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our users have to say about their StudyPal experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-sm card-hover"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-secondary to-primary rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
