import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm as useHookForm } from "react-hook-form";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { API_BASE_URL } from "@/config";
import usePageTitle from "@/hooks/usePageTitle";

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  username: z.string().optional(),
  mobileNo: z.string().min(10, { message: "Invalid mobile number" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).regex(/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, { message: "Password must contain at least one number or special character" }),
});

export default function LoginPage({ isSignup = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useAppContext();
  usePageTitle(isSignup ? "Create Account" : "Sign In");

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 relative overflow-hidden">
        <div className="absolute top-0 -z-10 h-full w-full bg-background overflow-hidden">
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-[50%] -translate-y-[50%] rounded-full bg-primary/10 opacity-50 blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 sm:p-10 border border-border/40 rounded-[2rem] bg-card/60 shadow-2xl backdrop-blur-xl text-center"
        >
          <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-1 mb-6 shadow-lg">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username || "User")}&background=random`} alt="User Avatar" className="h-full w-full rounded-full object-cover border-4 border-background" />
          </div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight">You are already logged in!</h2>
          <p className="text-muted-foreground mb-8">Welcome back, {user.name || user.username || "User"}.</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/dashboard")} className="w-full h-11 rounded-xl shadow-lg shadow-primary/20">Go to Dashboard</Button>
            <Button variant="outline" onClick={() => { localStorage.removeItem("user"); window.location.reload(); }} className="w-full h-11 rounded-xl text-destructive hover:bg-destructive/10 border-border/50 bg-background/50 hover:border-destructive/30 transition-colors">
              Sign Out
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const form = useHookForm({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", mobileNo: "", password: "" },
    mode: "onChange",
  });

  async function onSubmit(values) {
    setError(null);
    setIsLoading(true);

    if (isSignup && (!values.username || values.username.length < 2)) {
      form.setError("username", { type: "custom", message: "Username is required for signup" });
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isSignup ? `${API_BASE_URL}/api/users` : `${API_BASE_URL}/api/users/login`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      loginUser(data);

      setTimeout(() => {
        navigate(redirectTo);
      }, 300);
    } catch (err) {
      setError(err.message || "Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  }

  function onReset() {
    form.reset();
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 py-12 relative w-full overflow-hidden">
      <div className="absolute top-0 -z-10 h-full w-full bg-background overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-[50%] -translate-y-[50%] rounded-full bg-primary/10 opacity-50 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl p-8 sm:p-10 border border-border/40 rounded-[2rem] bg-card/60 shadow-2xl backdrop-blur-xl"
      >
        <div className="space-y-2 text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            {isSignup ? "Create an account" : "Welcome back"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isSignup ? "Complete your profile to get started." : "Enter your credentials to access your account."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {isSignup && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5 overflow-hidden">
                  <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} value={field.value || ""} className="bg-background/50 h-11 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </motion.div>
              )}
            </AnimatePresence>

            <FormField control={form.control} name="mobileNo" render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="9876543210" {...field} className="bg-background/50 h-11 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="bg-background/50 h-11 rounded-xl" />
                </FormControl>
                {isSignup && <FormDescription>Minimum 6 characters with at least one number or special character.</FormDescription>}
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1 h-11 rounded-xl text-base font-semibold hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
                {isLoading ? "Please wait..." : isSignup ? "Sign Up" : "Sign In"}
              </Button>
              <Button type="button" variant="outline" onClick={onReset} className="sm:w-32 h-11 rounded-xl text-base font-medium border-border/50 bg-background/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors">
                Reset
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          {isSignup ? (
            <p>Already have an account?{" "}<Link to={`/login${redirectTo !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="text-primary hover:underline font-medium">Sign in</Link></p>
          ) : (
            <p>Don't have an account?{" "}<Link to={`/signup${redirectTo !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="text-primary hover:underline font-medium">Sign up</Link></p>
          )}
        </div>
      </motion.div>
    </div>
  );
}