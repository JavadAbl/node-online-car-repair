import { Badge } from "@/components/ui/badge";
import {
  Award,
  Shield,
  Clock,
  CheckCircle,
  Settings,
  Users,
  Car,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Transparent Pricing",
    description:
      "No hidden fees or surprises. We provide detailed quotes before any work begins.",
  },
  {
    icon: Award,
    title: "Certified Mechanics",
    description:
      "Our team consists of ASE-certified professionals with years of experience in automotive repair.",
  },
  {
    icon: Clock,
    title: "Quick Turnaround",
    description:
      "We respect your time. Most services are completed same-day or within 24 hours.",
  },
  {
    icon: CheckCircle,
    title: "Quality Parts Guarantee",
    description:
      "We use only high-quality OEM and premium aftermarket parts backed by our warranty.",
  },
];

const stats = [
  {
    icon: Settings,
    value: "15+",
    label: "Years Experience",
    variant: "primary" as const,
  },
  {
    icon: Users,
    value: "50+",
    label: "Expert Mechanics",
    variant: "background" as const,
  },
  {
    icon: Car,
    value: "25K+",
    label: "Cars Serviced",
    variant: "muted" as const,
  },
  {
    icon: Award,
    value: "100%",
    label: "Satisfaction",
    variant: "primary-light" as const,
  },
];

export function WhyChooseUs() {
  return (
    <section id="about" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Features */}
          <div>
            <Badge variant="secondary" className="mb-4">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              We&apos;re Different From Other Repair Shops
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              At AutoCare Pro, we combine expertise, transparency, and
              convenience to provide an unmatched automotive service experience.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => {
              let bgColor = "bg-muted";
              let textColor = "text-muted-foreground";
              let iconColor = "text-muted-foreground";

              if (stat.variant === "primary") {
                bgColor = "bg-primary";
                textColor = "text-primary-foreground";
                iconColor = "text-primary-foreground";
              } else if (stat.variant === "background") {
                bgColor = "bg-background";
                textColor = "text-foreground";
                iconColor = "text-foreground";
              } else if (stat.variant === "primary-light") {
                bgColor = "bg-primary/10";
                textColor = "text-foreground";
                iconColor = "text-primary";
              }

              return (
                <div
                  key={index}
                  className={`${bgColor} rounded-2xl p-6 flex flex-col`}
                >
                  <stat.icon className={`h-10 w-10 mb-4 ${iconColor}`} />
                  <p className={`text-3xl font-bold ${textColor}`}>
                    {stat.value}
                  </p>
                  <p
                    className={`mt-1 ${textColor === "text-primary-foreground" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
