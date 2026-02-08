import { LoginForm } from "@/components/auth/login-form";
import { Rocket } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background gradient effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-pink/5 pointer-events-none" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8 space-y-6">
          {/* Logo and title */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/20 neon-glow">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold gradient-text">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login form */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
