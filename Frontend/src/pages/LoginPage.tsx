import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm as useHookForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { Check, ChevronDown } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Complex schema supporting all requested field types
const formSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  age: z.string().optional(),
  birthDate: z.string().optional(),
  accountType: z.string().optional(),
  preference: z.string().optional(),
  terms: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // If it's a signup form (determined by terms being present), enforce the extra fields
  if (data.terms !== undefined) {
    if (!data.fullName || data.fullName.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Name is required for signup", path: ["fullName"] });
    }
    if (!data.age || isNaN(Number(data.age)) || Number(data.age) < 18) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid age (18+) is required", path: ["age"] });
    }
    if (!data.birthDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date is required", path: ["birthDate"] });
    }
    if (!data.accountType) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Account type required", path: ["accountType"] });
    }
    if (!data.preference || !["casual", "formal"].includes(data.preference)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Preference required", path: ["preference"] });
    }
    if (data.terms !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "You must accept the terms", path: ["terms"] });
    }
  }
})

export default function LoginPage({ isSignup = false }: { isSignup?: boolean }) {
  const navigate = useNavigate()

  const form = useHookForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      age: "",
      birthDate: "",
      accountType: "",
      preference: "",
      terms: isSignup ? false : undefined,
    },
    mode: "onChange"
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form Data:", values)
    // Simulate auth
    setTimeout(() => {
      navigate("/dashboard")
    }, 500)
  }

  function onReset() {
    form.reset()
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 py-12 relative w-full overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 -z-10 h-full w-full bg-background overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-[50%] -translate-y-[50%] rounded-full bg-primary/10 opacity-50 blur-[120px]"></div>
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
            {isSignup
              ? "Complete your profile to get started."
              : "Enter your credentials to access your account."}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            <AnimatePresence mode="popLayout">
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  {/* TEXT INPUT */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name (Text)</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} value={field.value || ""} className="bg-background/50 h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    {/* NUMBER INPUT */}
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age (Number)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="25" {...field} value={field.value || ""} className="bg-background/50 h-11 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* DATE INPUT */}
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Birth Date (Date)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value || ""} className="bg-background/50 h-11 rounded-xl block w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* EMAIL INPUT */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} className="bg-background/50 h-11 rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PASSWORD INPUT */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-background/50 h-11 rounded-xl" />
                  </FormControl>
                  {isSignup && <FormDescription>Minimum 6 characters required.</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />

            <AnimatePresence mode="popLayout">
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div className="grid sm:grid-cols-2 gap-6 pt-2">
                    {/* DROPDOWN INPUT */}
                    <FormField
                      control={form.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type (Dropdown)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <select
                                className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none"
                                {...field}
                                value={field.value || ""}
                              >
                                <option value="" disabled>Select type...</option>
                                <option value="personal">Personal Use</option>
                                <option value="creator">Creator / Stylist</option>
                                <option value="business">Business</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* RADIO BUTTONS */}
                    <FormField
                      control={form.control}
                      name="preference"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Style Tier </FormLabel>
                          <FormControl>
                            <div className="flex gap-4">
                              {["casual", "formal"].map((tier) => (
                                <label key={tier} className="flex items-center space-x-2 cursor-pointer group">
                                  <div className="relative flex items-center justify-center">
                                    <input
                                      type="radio"
                                      value={tier}
                                      checked={field.value === tier}
                                      onChange={field.onChange}
                                      className="peer sr-only"
                                    />
                                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground peer-checked:border-primary peer-checked:bg-primary transition-all"></div>
                                    <div className="absolute w-1.5 h-1.5 rounded-full bg-background opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                  </div>
                                  <span className="text-sm font-medium capitalize text-muted-foreground group-hover:text-foreground peer-checked:text-foreground">
                                    {tier}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* CHECKBOX */}
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-xl border border-border/50 bg-background/30 p-4 mt-2">
                        <FormControl>
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="peer sr-only"
                            />
                            <div className="w-5 h-5 rounded-md border-2 border-muted-foreground peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                              <Check className="h-3.5 w-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium cursor-pointer">
                            Accept Terms and Conditions (Checkbox)
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  {form.formState.errors.terms && (
                    <p className="text-[0.8rem] font-medium text-destructive mt-1">{form.formState.errors.terms.message}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="flex-1 h-11 rounded-xl text-base font-semibold hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
                {isSignup ? "Sign Up" : "Sign In"}
              </Button>
              <Button type="button" variant="outline" onClick={onReset} className="sm:w-32 h-11 rounded-xl text-base font-medium border-border/50 bg-background/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors">
                Reset
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          {isSignup ? (
            <p>
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
