
"use client";

import Link from "next/link";
import {
  CalendarCheck,
  Menu,
  LayoutDashboard,
  Home,
  UserCircle,
  Sun,
  Moon,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export function Header() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const { user } = useUser();
  const db = useFirestore();

  const globalAdminRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "globalAdmins", user.uid);
  }, [db, user?.uid]);

  const { data: globalAdminData } = useDoc(globalAdminRef);
  const isGlobalAdmin = !!globalAdminData;

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const isDarkMode = theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  if (isGlobalAdmin) {
    navItems.push({ href: "/super-admin", label: "Super Admin", icon: ShieldAlert });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto px-4">
        <div className="mr-auto flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <CalendarCheck className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg">TurnosYa</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1 transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Cambiar tema</span>
          </Button>

          <Button variant="ghost" size="icon" asChild className="text-muted-foreground">
            <Link href="/dashboard">
              <UserCircle className="h-5 w-5" />
              <span className="sr-only">Mi Perfil</span>
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-6 pt-8">
                <Link href="/" className="flex items-center gap-2 font-bold">
                  <CalendarCheck className="h-6 w-6 text-primary" />
                  <span className="font-headline text-lg">TurnosYa</span>
                </Link>
                <nav className="grid gap-4">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 rounded-md p-2 text-lg font-medium hover:bg-accent"
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
