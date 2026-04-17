"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Dumbbell, Menu, Star, Plus, Minus, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function PricingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [pricingMode, setPricingMode] = useState<"fixed" | "pay-per">("fixed");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "What is an active member?",
      a: "An active member is anyone with an ongoing membership plan or who signs into your gym during the billing cycle. You are not charged for inactive profiles."
    },
    {
      q: "Can I switch plans anytime?",
      a: "Yes, you can upgrade, downgrade, or switch between Fixed and Pay Per Member models at any time from your billing dashboard."
    },
    {
      q: "Is there a free trial?",
      a: "Absolutely! We offer a 14-day full-feature free trial on all plans. No credit card required to start."
    },
    {
      q: "What happens if I exceed member limit?",
      a: "For fixed plans, you'll be charged a simple fee of ₹39 per extra active member for that month, ensuring your service is never interrupted."
    }
  ];

  const features = [
    { name: "Max Members", starter: "100", growth: "300", pro: "800" },
    { name: "Member Management", starter: true, growth: true, pro: true },
    { name: "Multi-device Access", starter: true, growth: true, pro: true },
    { name: "Trainer & Class Mgmt", starter: false, growth: true, pro: true },
    { name: "Payment Reminders", starter: false, growth: true, pro: true },
    { name: "Analytics Dashboard", starter: false, growth: "Basic", pro: "Advanced" },
    { name: "Priority 24/7 Support", starter: false, growth: false, pro: true },
    { name: "SEO Landing Page", starter: true, growth: true, pro: true },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30 overflow-x-hidden">
      {/* Navbar (similar to LandingPage to keep consistency) */}
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${
          isScrolled 
            ? "bg-background/80 backdrop-blur-md border-border/50 shadow-sm" 
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight">FitHubX</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="/pricing" className="text-foreground transition-colors">Pricing</Link>
              <Link href="/#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" className="font-semibold">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="default" className="rounded-full px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  Start Free Trial
                </Button>
              </Link>
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

      <main className="pt-24 pb-16 md:pt-32 md:pb-24">
        {/* HERO SECTION */}
        <section className="text-center px-4 max-w-4xl mx-auto mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Simple, Transparent Pricing <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">for Your Gym</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Start free. Upgrade as you grow. No hidden fees.
            </p>

            {/* TOGGLE SWITCH */}
            <div className="sticky top-20 md:static z-40 bg-background/95 backdrop-blur-sm py-4 inline-block">
              <div className="flex bg-muted/50 p-1.5 rounded-full border border-border/50 relative shadow-inner">
                <button 
                  onClick={() => setPricingMode("fixed")}
                  className={`relative z-10 px-6 sm:px-8 py-3 rounded-full text-sm font-semibold transition-colors duration-300 w-1/2 sm:w-auto ${pricingMode === "fixed" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Fixed Plans
                </button>
                <button 
                  onClick={() => setPricingMode("pay-per")}
                  className={`relative z-10 px-6 sm:px-8 py-3 rounded-full text-sm font-semibold transition-colors duration-300 w-1/2 sm:w-auto ${pricingMode === "pay-per" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Pay Per Member
                </button>
                
                {/* Active Slider */}
                <div 
                  className={`absolute top-1.5 bottom-1.5 bg-background shadow-md shadow-black/5 rounded-full z-0 transition-all duration-300 ease-spring ${pricingMode === "fixed" ? "left-1.5 right-[50%] sm:right-[160px]" : "left-[50%] sm:left-[130px] right-1.5"}`}
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* PRICING PLANS SECTION */}
        <section className="container mx-auto px-4 max-w-6xl mb-24">
          <AnimatePresence mode="wait">
            {pricingMode === "fixed" ? (
              <motion.div 
                key="fixed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
                  {/* Starter Plan */}
                  <Card className="border-border/50 shadow-sm hover:shadow-xl transition-shadow rounded-2xl h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-2xl">Starter Plan</CardTitle>
                      <CardDescription>Perfect for small boutique gyms</CardDescription>
                      <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                        ₹999<span className="ml-1 text-xl font-medium text-muted-foreground">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-4 text-sm mt-2">
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="font-medium text-foreground">Up to 100 members</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-muted-foreground">Basic member management</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-muted-foreground">Multi-device access</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-muted-foreground">Limited features</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-muted-foreground">1 SEO Optimized Landing Page</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full h-12" variant="outline">Start Free Trial</Button>
                    </CardFooter>
                  </Card>

                  {/* Growth Plan */}
                  <Card className="border-primary shadow-2xl scale-100 md:scale-105 relative bg-background/80 backdrop-blur-md z-10 rounded-2xl h-full flex flex-col hover:scale-[1.02] md:hover:scale-[1.07] transition-transform duration-300">
                    <div className="absolute -top-4 inset-x-0 w-full flex justify-center">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current" /> Most Popular
                      </span>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-2xl">Growth Plan</CardTitle>
                      <CardDescription>Ideal for growing fitness centers</CardDescription>
                      <div className="mt-4 flex items-baseline text-5xl font-extrabold text-primary">
                        ₹1999<span className="ml-1 text-xl font-medium text-foreground">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-4 text-sm mt-2">
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="font-medium text-foreground">Up to 300 members</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-foreground">Payment reminders</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-foreground">Trainer & class management</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-foreground">Analytics dashboard</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-foreground">1 SEO Optimized Landing Page</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full h-12 rounded-xl shadow-lg shadow-primary/25 text-md font-semibold">Start Free Trial</Button>
                    </CardFooter>
                  </Card>

                  {/* Pro Plan */}
                  <Card className="border-border/50 shadow-sm hover:shadow-xl transition-shadow rounded-2xl h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-2xl">Pro Plan</CardTitle>
                      <CardDescription>For established gyms & franchises</CardDescription>
                      <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                        ₹3999<span className="ml-1 text-xl font-medium text-muted-foreground">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-4 text-sm mt-2">
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="font-medium text-foreground">Up to 800 members</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-muted-foreground">Advanced analytics</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-muted-foreground">Priority 24/7 support</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-muted-foreground">All Growth features included</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-muted-foreground">1 SEO Optimized Landing Page</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full h-12" variant="outline">Start Free Trial</Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <div className="text-center mt-12 text-muted-foreground bg-muted/30 py-4 px-6 rounded-2xl max-w-max mx-auto border border-border/50">
                  <span className="font-medium text-foreground">Need more members?</span> &nbsp;→&nbsp; ₹39 per extra member/month billed automatically.
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="pay-per"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-3xl mx-auto"
              >
                <Card className="border-primary/50 shadow-2xl rounded-3xl relative overflow-hidden bg-background">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
                  
                  <CardHeader className="text-center pb-2 pt-10">
                    <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-6">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-extrabold">Pay As You Grow</CardTitle>
                    <CardDescription className="text-lg mt-2">Zero fixed costs. Only pay for the members that show up.</CardDescription>
                    <div className="mt-8 flex justify-center items-baseline text-6xl font-extrabold text-foreground">
                      ₹39<span className="ml-2 text-2xl font-medium text-muted-foreground">/ active member / month</span>
                    </div>
                    <p className="text-sm font-medium text-emerald-600 mt-4 bg-emerald-500/10 inline-block px-4 py-1.5 rounded-full">
                      Minimum billing: ₹999/month
                    </p>
                  </CardHeader>
                  <CardContent className="mt-10 max-w-2xl mx-auto border-t border-border/50 pt-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 px-4 md:px-12">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-medium text-foreground">Unlimited total members</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-medium text-foreground">Pay only for active members</span>
                      </div>
                      <div className="flex items-center gap-3 sm:col-span-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-medium text-foreground">1 SEO Optimized Landing Page</span>
                      </div>
                      <div className="flex items-center gap-3 sm:col-span-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-medium text-foreground">All Pro Plan features included free forever</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-center pb-12 pt-10">
                    <Button size="lg" className="w-full sm:w-auto px-12 h-14 rounded-full text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform duration-300">
                      Start Free Trial
                    </Button>
                    <p className="text-sm text-muted-foreground mt-4 font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Best for growing gyms with 500+ members
                    </p>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* TRUST & VALUE SECTION */}
        <section className="py-16 md:py-24 bg-muted/20 border-y border-border/50">
          <div className="container mx-auto px-4 max-w-5xl">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">Compare Plan Features</h2>
               <p className="text-muted-foreground flex items-center justify-center gap-2">
                 <ShieldCheck className="text-emerald-500 w-5 h-5" /> Used by 500+ gyms across India
               </p>
             </div>

             <div className="overflow-x-auto pb-4">
               <table className="w-full text-left border-collapse min-w-[600px]">
                 <thead>
                   <tr className="border-b border-border/50">
                     <th className="py-4 px-6 font-semibold text-muted-foreground w-1/3">Feature</th>
                     <th className="py-4 px-6 font-bold text-center">Starter</th>
                     <th className="py-4 px-6 font-bold text-center bg-primary/5 rounded-t-xl text-primary">Growth</th>
                     <th className="py-4 px-6 font-bold text-center">Pro</th>
                   </tr>
                 </thead>
                 <tbody>
                   {features.map((row, idx) => (
                     <tr key={idx} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                       <td className="py-4 px-6 font-medium">{row.name}</td>
                       <td className="py-4 px-6 text-center">
                         {typeof row.starter === 'boolean' ? (row.starter ? <Check className="w-5 h-5 text-foreground mx-auto" /> : <Minus className="w-5 h-5 text-muted-foreground/30 mx-auto" />) : row.starter}
                       </td>
                       <td className="py-4 px-6 text-center bg-primary/5 font-semibold">
                         {typeof row.growth === 'boolean' ? (row.growth ? <Check className="w-5 h-5 text-primary mx-auto" /> : <Minus className="w-5 h-5 text-muted-foreground/30 mx-auto" />) : row.growth}
                       </td>
                       <td className="py-4 px-6 text-center">
                         {typeof row.pro === 'boolean' ? (row.pro ? <Check className="w-5 h-5 text-foreground mx-auto" /> : <Minus className="w-5 h-5 text-muted-foreground/30 mx-auto" />) : row.pro}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Trusted by Indian Gym Owners</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: "Rahul Verma", role: "Owner, Iron Core Fitness (Delhi)", char: "R", text: "The Growth plan is perfectly priced for the Indian market. The automated payment reminders alone have saved us ₹15,000 in missed collections this month.", color: "from-blue-500 to-indigo-600" },
                { name: "Neha Sharma", role: "Founder, Zenith Studio (Mumbai)", char: "N", text: "We switched to the Pay Per Member plan as our studio grows completely organically. I love that I only pay for members who actually show up and use the service.", color: "from-emerald-500 to-teal-600" },
                { name: "Amit Patel", role: "Director, FitFreak Gyms (Bengaluru)", char: "A", text: "Managing 3 branches used to be a nightmare. With the Pro Plan's analytics dashboard, I can track revenue and active members for all gyms on my phone.", color: "from-amber-500 to-orange-600" }
              ].map((t, i) => (
                <Card key={i} className="border-border/50 shadow-sm bg-muted/10 hover:shadow-md transition-all h-full">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="flex gap-1 text-amber-500 mb-6">
                      {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-foreground/90 italic mb-8 flex-1 leading-relaxed">"{t.text}"</p>
                    <div className="flex items-center gap-4 mt-auto">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-lg shadow-inner`}>
                        {t.char}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-border/50 bg-background rounded-2xl overflow-hidden transition-all shadow-sm">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-semibold text-[15px] pr-8">{faq.q}</span>
                    <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 bg-primary/10 text-primary' : ''}`}>
                      {openFaq === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 text-muted-foreground leading-relaxed pt-2">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-24 relative overflow-hidden bg-background">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
           
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-3xl mx-auto bg-background/50 backdrop-blur-xl border border-primary/20 p-10 md:p-16 rounded-[2.5rem] shadow-2xl">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
                Start Managing Your Gym Smarter Today
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mx-auto mb-10 max-w-xl">
                Join 500+ gym owners who have simplified their business. Takes 2 minutes to set up.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                    Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#demo" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full h-14 px-8 rounded-full text-lg border-border/50 hover:bg-muted/50 transition-colors">
                    Book Demo
                  </Button>
                </Link>
              </div>
              <p className="mt-8 text-sm text-muted-foreground">
                No credit card required. 14-day free trial.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-background border-t border-border/50 pt-16 pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary" />
                <span className="text-xl font-bold tracking-tight">FitHubX</span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                The modern operating system for gyms and fitness studios across India.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Integrations</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} FitHubX India. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
