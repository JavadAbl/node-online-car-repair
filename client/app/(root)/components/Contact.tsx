import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail } from "lucide-react";

export function Contact() {
  return (
    <section id="contact" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* CTA Card */}
          <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12 text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Your Car Serviced?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              {" "}
              {/* Use full foreground with slight dimming */}
              Book your appointment today and experience the AutoCare Pro
              difference. Free pickup and delivery included!
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-muted font-medium text-lg px-8"
              >
                Book Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-medium text-lg px-8"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Us
              </Button>
            </div>

            <Separator className="my-8 bg-primary-foreground/30" />

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm opacity-80">24/7 Support</p>
                  <p className="font-semibold">(555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm opacity-80">Email Us</p>
                  <p className="font-semibold">hello@autocarepro.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Badge variant="secondary" className="mb-4">
              Get In Touch
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Send Us a Message
            </h2>
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground mb-1.5 block"
                  >
                    Full Name
                  </label>
                  <Input id="name" placeholder="John Doe" className="h-12" />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground mb-1.5 block"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="h-12"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-foreground mb-1.5 block"
                >
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 000-0000"
                  className="h-12"
                />
              </div>
              <div>
                <label
                  htmlFor="service"
                  className="text-sm font-medium text-foreground mb-1.5 block"
                >
                  Service Needed
                </label>
                <Input
                  id="service"
                  placeholder="e.g., Oil Change, Brake Service"
                  className="h-12"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-foreground mb-1.5 block"
                >
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your car and the issue you're experiencing..."
                  className="min-h-[120px]"
                />
              </div>
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/80 text-primary-foreground h-12"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
