"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Dumbbell,
  LineChart,
  Menu,
  Users,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck,
  Star,
  Bell,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const navigate = useRouter();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Navbar */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${
          isScrolled
            ? "bg-background/80 backdrop-blur-md border-border/50 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <span
                onClick={() => {
                  navigate.push("/");
                }}
                className="text-xl cursor-pointer font-bold tracking-tight"
              >
                FitHubX
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Testimonials
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              {isLoggedIn ? (
                <Link href="/">
                  <Button variant="default" className="rounded-full px-6">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="font-semibold">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      variant="default"
                      className="rounded-full px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="md:hidden flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden -z-10 pointer-events-none">
            <div className="absolute left-[20%] top-[-10%] w-[40%] h-[400px] bg-primary/20 blur-[120px] rounded-full opacity-50 dark:opacity-30 mix-blend-screen" />
            <div className="absolute right-[20%] top-[20%] w-[30%] h-[300px] bg-blue-500/20 blur-[100px] rounded-full opacity-50 dark:opacity-30 mix-blend-screen" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={stagger}
              className="max-w-4xl mx-auto space-y-8"
            >
              <motion.div variants={fadeIn} className="flex justify-center">
                <Badge
                  variant="secondary"
                  className="rounded-full px-4 py-1.5 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 mr-2" />
                  The Next Gen Gym Management OS
                </Badge>
              </motion.div>

              <motion.div variants={fadeIn}>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground">
                  Manage Your Gym Business{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                    Smarter
                  </span>
                </h1>
              </motion.div>

              <motion.div variants={fadeIn}>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  The all-in-one multivendor platform to manage memberships,
                  automate payments, schedule classes, and empower
                  trainers—built to multiply your revenue.
                </p>
              </motion.div>

              <motion.div
                variants={fadeIn}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              >
                <Link href="/register">
                  <Button
                    size="lg"
                    className="h-14 px-8 rounded-full text-base shadow-xl shadow-primary/20 hover:scale-105 transition-transform w-full sm:w-auto"
                  >
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 rounded-full text-base w-full sm:w-auto border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted/50"
                  >
                    Book a Demo
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, type: "spring" }}
              className="mt-20 relative max-w-5xl mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10 pointer-events-none h-full bottom-0" />
              <div className="relative rounded-2xl md:rounded-3xl border border-border/50 bg-background/50 shadow-2xl overflow-hidden backdrop-blur-xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium flex-1 text-center font-mono">
                    dashboard.fixhubx.com
                  </div>
                </div>
                {/* Mockup Body */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-background">
                  {/* Sidebar Mock */}
                  <div className="hidden md:flex flex-col gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-10 rounded-lg bg-muted/50 w-full animate-pulse opacity-50"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                  {/* Content Mock */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="h-6 w-32 bg-primary/20 rounded-md" />
                        <div className="h-4 w-48 bg-muted rounded-md" />
                      </div>
                      <div className="h-10 w-24 bg-primary rounded-lg shadow-sm" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Stat Cards */}
                      <Card className="shadow-none border-border/50">
                        <CardHeader className="p-4 pb-2">
                          <CardDescription>Active Members</CardDescription>
                          <CardTitle className="text-2xl mt-1">2,405</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-xs text-emerald-500 flex items-center">
                            <ArrowRight className="w-3 h-3 mr-1 -rotate-45" />{" "}
                            +14.5%
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="shadow-none border-border/50">
                        <CardHeader className="p-4 pb-2">
                          <CardDescription>Monthly Revenue</CardDescription>
                          <CardTitle className="text-2xl mt-1">
                            $45.2k
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-xs text-emerald-500 flex items-center">
                            <ArrowRight className="w-3 h-3 mr-1 -rotate-45" />{" "}
                            +8.2%
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="shadow-none border-border/50 hidden lg:block">
                        <CardHeader className="p-4 pb-2">
                          <CardDescription>Expiring Plans</CardDescription>
                          <CardTitle className="text-2xl mt-1">34</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-xs text-muted-foreground">
                            This week
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    {/* Chart Mock */}
                    <div className="h-48 rounded-xl border border-border/50 bg-muted/20 relative overflow-hidden flex items-end px-4 gap-2 pb-4">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                      {[40, 60, 45, 80, 55, 90, 70, 100].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                          className="flex-1 bg-primary/80 rounded-t-sm z-10"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trusted By */}
        <section className="py-12 border-y border-border/50 bg-muted/10">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">
              Trusted by 500+ innovative gyms & studios
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {[
                "FitNation",
                "IronBase",
                "CoreYoga",
                "GoldsClub",
                "AnytimeForce",
              ].map((brand, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 font-bold text-xl text-foreground/80"
                >
                  <div className="w-8 h-8 bg-foreground/20 rounded-md flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-foreground/70" />
                  </div>
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Everything to run your empire
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built specifically for multi-location gyms and independent
                fitness businesses. Stop juggling apps and consolidate
                everything.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: "Membership Management",
                  desc: "Easily acquire, manage, and retain members with powerful engagement tools and automated check-ins.",
                },
                {
                  icon: ShieldCheck,
                  title: "Multi-Gym Support",
                  desc: "Manage multiple branches, global reporting, and unified branding from a single powerful master dashboard.",
                },
                {
                  icon: CreditCard,
                  title: "Automated Payments",
                  desc: "Stop chasing missed payments. We handle recurring billing, failed payment retries, and invoices.",
                },
                {
                  icon: Calendar,
                  title: "Class Scheduling",
                  desc: "Enable members to book trainers, reserve spots in classes, and manage their calendar on the go.",
                },
                {
                  icon: BarChart3,
                  title: "Growth Analytics",
                  desc: "Spot trends instantly. Real-time dashboards showing MRI, retention rates, and demographic insights.",
                },
                {
                  icon: Bell,
                  title: "Smart Notifications",
                  desc: "Automate SMS and email workflows for expiring plans, birthday wishes, and welcome messages.",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="group relative p-8 rounded-3xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-all shadow-sm hover:shadow-xl hover:border-primary/20"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="py-24 bg-muted/30 border-y border-border/50 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="md:w-1/2 space-y-8">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                  From setup to scale in three steps
                </h2>
                <p className="text-lg text-muted-foreground">
                  Our onboarding is so simple, you'll be running your gym
                  completely hands-free by tomorrow.
                </p>

                <div className="space-y-8">
                  {[
                    {
                      title: "Create Your Vendor Account",
                      desc: "Sign up, configure your gym's branding, and define your locations.",
                      step: "01",
                    },
                    {
                      title: "Add Plans & Staff",
                      desc: "Create membership tiers, invite your trainers, and set up your class schedules.",
                      step: "02",
                    },
                    {
                      title: "Automate & Grow",
                      desc: "Enable auto-billing, let members self-serve via the app, and watch your revenue grow.",
                      step: "03",
                    },
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-background border border-primary/20 flex items-center justify-center font-bold text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                        {step.step}
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold mb-1">
                          {step.title}
                        </h4>
                        <p className="text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:w-1/2 w-full relative">
                <div className="aspect-square rounded-3xl overflow-hidden border border-border/50 bg-background shadow-2xl relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
                  <div className="absolute inset-x-8 top-12 bottom-0 bg-muted/30 rounded-t-3xl border-t border-x border-border/50 overflow-hidden shadow-xl p-6">
                    {/* Abstract minimal representation */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-24 h-6 rounded bg-primary/20" />
                        <div className="w-8 h-8 rounded-full bg-primary/10" />
                      </div>
                      <div className="h-32 w-full rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/20 to-transparent" />
                        <LineChart className="absolute right-4 bottom-4 w-12 h-12 text-primary/40" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="h-20 rounded-xl bg-muted/50 border border-border" />
                        <div className="h-20 rounded-xl bg-muted/50 border border-border" />
                      </div>
                      <div className="h-10 w-full rounded-lg bg-primary/10 flex items-center justify-center text-sm font-medium text-primary mt-4">
                        Revenue Goal Met
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -right-8 top-24 p-4 rounded-2xl bg-background border border-border/50 shadow-xl backdrop-blur-sm hidden lg:flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Payment Recieved</p>
                    <p className="text-xs text-muted-foreground">+$149.00</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="py-24 relative overflow-hidden bg-background">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-[500px] bg-primary/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />

          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16 relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Command your business from one place
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our stunning dashboard turns complex data into clear, actionable
                insights. Say goodbye to spreadsheets.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-2xl border border-border/50 shadow-2xl bg-background overflow-hidden"
            >
              {/* Browser Window Header */}
              <div className="bg-muted/30 border-b border-border/50 px-4 py-3 flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="bg-background border border-border/50 rounded-md px-3 py-1 flex-1 text-center max-w-md mx-auto text-xs text-muted-foreground font-mono flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> app.fixhubx.com/admin
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 md:p-8 flex gap-6 bg-background">
                {/* Sidebar */}
                <div className="hidden lg:flex flex-col gap-4 w-48 shrink-0 border-r border-border/50 pr-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Dumbbell className="w-5 h-5 text-primary" />
                    <span className="font-bold">FitHubX</span>
                  </div>
                  {[
                    { icon: Activity, label: "Overview", active: true },
                    { icon: Users, label: "Members", active: false },
                    { icon: Calendar, label: "Schedule", active: false },
                    { icon: CreditCard, label: "Billing", active: false },
                    { icon: BarChart3, label: "Reports", active: false },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${item.active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Main Area */}
                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">
                      Good morning, Michael
                    </h3>
                    <Button size="sm" className="rounded-lg shadow-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Add Member
                    </Button>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Total Revenue", val: "$24,590", rise: "+12%" },
                      { label: "Active Members", val: "1,204", rise: "+4%" },
                      { label: "Class Attendance", val: "84%", rise: "+2%" },
                    ].map((metric, i) => (
                      <Card
                        key={i}
                        className="shadow-none border border-border/50 bg-muted/10"
                      >
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground mb-1">
                            {metric.label}
                          </p>
                          <div className="flex items-end justify-between">
                            <h4 className="text-2xl font-bold">{metric.val}</h4>
                            <span className="text-xs font-medium text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              {metric.rise}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Main Chart and Recent List */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="shadow-none border border-border/50 lg:col-span-2">
                      <CardHeader className="p-5 pb-0">
                        <CardTitle className="text-lg">
                          Revenue Over Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="h-48 w-full flex items-end justify-between gap-2 border-b border-l border-border/50 p-2">
                          {[40, 50, 45, 60, 55, 75, 70, 90, 85, 100].map(
                            (h, idx) => (
                              <div
                                key={idx}
                                className="w-full bg-primary/20 rounded-t hover:bg-primary transition-colors relative group"
                              >
                                <div
                                  className="absolute bottom-0 w-full bg-primary rounded-t transition-all duration-500"
                                  style={{ height: `${h}%` }}
                                />
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity Table */}
                    <Card className="shadow-none border border-border/50">
                      <CardHeader className="p-5 pb-2">
                        <CardTitle className="text-lg">
                          Recent Signups
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 pt-0">
                        <div className="space-y-4 pt-2">
                          {[
                            {
                              name: "Alex Johnson",
                              plan: "Pro Plan",
                              time: "2m ago",
                            },
                            {
                              name: "Maria Garcia",
                              plan: "Starter Plan",
                              time: "1hr ago",
                            },
                            {
                              name: "James Smith",
                              plan: "Pro Plan",
                              time: "3hr ago",
                            },
                            {
                              name: "Linda Lee",
                              plan: "Drop-in",
                              time: "5hr ago",
                            },
                          ].map((user, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-medium text-xs">
                                  {user.name[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {user.plan}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {user.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Blur overlay fading to bottom */}
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section
          id="testimonials"
          className="py-24 bg-muted/20 border-t border-border/50"
        >
          <div className="container mx-auto px-4 max-w-7xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-16">
              Loved by Top Gym Owners
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Michael Chen",
                  role: "Owner, CoreYoga Studio",
                  text: "FitHubX completely transformed how we operate. We replaced 4 different software tools with just this one dashboard. Revenue is up 20% due to automated payment retries.",
                },
                {
                  name: "Sarah Jenkins",
                  role: "Manager, IronBase Gyms",
                  text: "The multi-vendor support is a lifesaver. I can see the performance of all 5 of our city locations from my phone perfectly. The interface is stunning and fast.",
                },
                {
                  name: "David Alaba",
                  role: "Founder, FitNation",
                  text: "Our trainers love the scheduling app, and our members love the custom workout deliveries. Customer support has also been incredible since day one.",
                },
              ].map((t, idx) => (
                <Card
                  key={idx}
                  className="bg-background shadow-sm border-border/50 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-8">
                    <div className="flex gap-1 text-amber-400 mb-6">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-foreground/80 mb-8 leading-relaxed">
                      "{t.text}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[300px] bg-primary/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Start Growing Your Gym Today
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Join hundreds of high-performing gyms that trust FitHubX to manage
              their daily operations. No credit card required.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 px-10 rounded-full text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
              >
                Get Started Free <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border/50 pt-16 pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary" />
                <span className="text-xl font-bold tracking-tight">
                  FitHubX
                </span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                The modern operating system for gyms and fitness studios. Build,
                run, and scale your fitness business effortlessly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-primary transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Customers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} FitHubX. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
