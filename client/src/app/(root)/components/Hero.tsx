import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ChevronRight, Users, CheckCircle } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-linear-to-br from-primary-foreground dark:from-accent to-chart-1 dark:to-chart-5"
    >
      <div className="container mx-auto px-4 py-16 md:py-18">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge className="">#1 Rated Auto Repair Service</Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              <span className="text-black dark:text-foreground">
                Expert Car Repair
              </span>
              <br />
              <span className="text-primary">You Can Trust</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              Professional automotive services with certified mechanics,
              transparent pricing, and convenient pickup & delivery. Your car
              deserves the best care.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8"
              >
                Book Your Service
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-input text-foreground hover:bg-accent text-lg px-8"
              >
                Learn More
              </Button>
            </div>
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">
                  10,000+ Happy Customers
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 fill-primary text-primary"
                  />
                ))}
                <span className="text-muted-foreground ml-2">4.9/5</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/hero-car.png"
                alt="Professional car mechanic working on vehicle"
                width={672}
                height={384}
                className="w-full h-auto object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
            </div>
            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-6 bg-background rounded-xl shadow-xl p-4 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Completed Jobs
                  </p>
                  <p className="text-2xl font-bold text-foreground">25,000+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
