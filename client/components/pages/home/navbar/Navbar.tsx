"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Wrench,
  Menu,
  Phone,
  CarIcon,
  ToolboxIcon,
  LogOutIcon,
} from "lucide-react";
import Link from "next/link";
import ThemeModeToggle from "./theme-mode-toggle";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/use-state";
import { authActions } from "@/lib/features/auth/auth-slice";
import { useRouter } from "next/navigation";

export function Navbar() {
  const dis = useAppDispatch();
  const { isAuth, user } = useAppSelector((s) => s.auth);
  const router = useRouter();

  const handleLogout = async () => {
    dis(authActions.logout());
    router.replace("/");
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              AutoCare<span className="text-primary">Pro</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#home"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="#services"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Services
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="text-muted-foreground">
              <Phone className="mr-2 h-4 w-4" />
              {user?.mobile}
            </Button>

            {!isAuth && (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}

            {isAuth && (
              <>
                <Button asChild>
                  <Link href="/vehicles">
                    <span>My Vehicles</span>
                    <CarIcon />
                  </Link>
                </Button>

                <Button asChild>
                  <Link href="/services">
                    <span> New Service </span>
                    <ToolboxIcon />
                  </Link>
                </Button>
              </>
            )}

            <ThemeModeToggle />

            {isAuth && (
              <LogOutIcon
                className="h-[1.2rem] w-[1.2rem] cursor-pointer"
                xlinkTitle="logout"
                onClick={handleLogout}
              />
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-foreground"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] bg-background"
            >
              <nav className="flex flex-col gap-4 mt-8">
                <ThemeModeToggle />

                <Link
                  href="#home"
                  className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="#services"
                  className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Services
                </Link>
                <Link
                  href="#about"
                  className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  About
                </Link>
                <Link
                  href="#contact"
                  className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>

                <Separator className="my-4 bg-border" />

                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
                  Book Now
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
