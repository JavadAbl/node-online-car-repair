import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, CircleDot, Droplets, Cog, Battery, Wind } from "lucide-react";

const services = [
  {
    icon: Gauge,
    title: "Engine Repair & Diagnostics",
    description:
      "Comprehensive engine diagnostics and repair services using state-of-the-art equipment. We identify and fix issues quickly.",
  },
  {
    icon: CircleDot,
    title: "Brake Service",
    description:
      "Complete brake inspection, repair, and replacement. Ensure your safety with our expert brake services.",
  },
  {
    icon: Droplets,
    title: "Oil Change & Maintenance",
    description:
      "Regular oil changes and preventive maintenance to keep your engine running smoothly and extend vehicle life.",
  },
  {
    icon: Cog,
    title: "Tire Services",
    description:
      "Tire rotation, balancing, alignment, and replacement. We help you get the most out of your tires.",
  },
  {
    icon: Battery,
    title: "Battery & Electrical",
    description:
      "Battery testing, replacement, and full electrical system diagnostics. We keep your car powered and running.",
  },
  {
    icon: Wind,
    title: "AC Repair",
    description:
      "Air conditioning inspection, repair, and recharge. Stay cool and comfortable in any weather.",
  },
];

export function Services() {
  return (
    <section id="services" className="py-20 md:py-28 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-4">
            Our Services
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comprehensive Car Repair Services
          </h2>
          <p className="text-lg text-muted-foreground">
            From routine maintenance to complex repairs, our certified
            technicians handle all your automotive needs with expertise and
            care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-background hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/5 text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <service.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
