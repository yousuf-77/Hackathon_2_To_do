"use client";

import { motion } from "framer-motion";
import { Rocket, Zap, Shield, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Create and manage tasks with AI-powered natural language processing",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is protected with enterprise-grade security and encryption",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Smart chatbot assistant helps you organize tasks effortlessly",
  },
];

const benefits = [
  "Natural language task creation",
  "Smart priority suggestions",
  "Real-time collaboration",
  "Beautiful cyberpunk interface",
  "Cross-platform sync",
  "100% free and open source",
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-neon-blue/5">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-neon-blue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-neon-pink/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : -20 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <div className="p-2 rounded-lg bg-primary/20 neon-glow">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold gradient-text">Hackathon Todo</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-4"
            >
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-primary/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="neon-glow">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card">
              <Sparkles className="h-4 w-4 text-neon-blue" />
              <span className="text-sm font-medium">Powered by AI</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold">
              <span className="gradient-text">Manage Tasks</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-pink">
                With AI Power
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
              The most intelligent todo app that understands natural language.
              Just type what you need, and let AI handle the rest.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto neon-glow text-lg px-8 py-6">
                Start for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-neon-green" />
                <span>{benefit}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Features */}
        <section className="relative z-10 mt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg">
              Powerful features to boost your productivity
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 rounded-2xl hover:bg-neon-blue/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 neon-glow">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 mt-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="glass-card p-12 rounded-3xl max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of users who are already managing their tasks smarter
            </p>
            <Link href="/signup">
              <Button size="lg" className="neon-glow text-lg px-8 py-6">
                Create Your Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </section>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Hackathon Todo. Built with Next.js, FastAPI, and AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
