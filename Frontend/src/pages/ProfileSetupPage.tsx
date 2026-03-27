import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { Check, ChevronDown, User, Mail, Lock, Sparkles } from "lucide-react"
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

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  stylePreference: z.string().min(1, { message: "Please select a style preference." }),
  fitPreference: z.string().refine((val) => ["slim", "regular", "relaxed"].includes(val), { message: "Please select a fit." }),
  termsReady: z.boolean().refine(val => val === true, { message: "You must accept the terms." }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileSetupPage() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      stylePreference: "",
      fitPreference: undefined,
      termsReady: false,
    },
    mode: "onChange",
  })

  function onSubmit(data: ProfileFormValues) {
    console.log("Form Submitted Successfully:", data)
    alert("Profile setup complete! Check console for data.")
  }

  function onReset() {
    form.reset()
  }

  return (
    <div className="container mx-auto p-4 py-12 max-w-2xl min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Complete Your Profile</h1>
        <p className="text-muted-foreground text-lg">
          Tell us about yourself to get perfectly tailored style recommendations.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 sm:p-10 shadow-2xl"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* TEXT INPUT */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input placeholder="John Doe" className="pl-10 bg-background/50 h-12 rounded-xl text-base" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* EMAIL INPUT */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="email" placeholder="john@example.com" className="pl-10 bg-background/50 h-12 rounded-xl text-base" {...field} />
                    </div>
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
                  <FormLabel className="text-base">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10 bg-background/50 h-12 rounded-xl text-base" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>Must be at least 8 characters long.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid sm:grid-cols-2 gap-8">
              {/* DROPDOWN (Select) */}
              <FormField
                control={form.control}
                name="stylePreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Style Preference</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <select
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background/50 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                          {...field}
                        >
                          <option value="" disabled>Select a style...</option>
                          <option value="minimalist">Minimalist</option>
                          <option value="streetwear">Streetwear</option>
                          <option value="vintage">Vintage / Retro</option>
                          <option value="formal">Business Formal</option>
                          <option value="casual">Smart Casual</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* RADIO BUTTONS */}
              <FormField
                control={form.control}
                name="fitPreference"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">Preferred Fit</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {["slim", "regular", "relaxed"].map((fit) => (
                          <label key={fit} className="flex items-center space-x-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input
                                type="radio"
                                value={fit}
                                checked={field.value === fit}
                                onChange={field.onChange}
                                className="peer sr-only"
                              />
                              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground peer-checked:border-primary peer-checked:bg-primary transition-all"></div>
                              <div className="absolute w-2 h-2 rounded-full bg-background opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-sm font-medium capitalize text-muted-foreground group-hover:text-foreground peer-checked:text-foreground transition-colors">
                              {fit}
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
              name="termsReady"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-border/50 bg-background/20 p-4 shadow-sm">
                  <FormControl>
                    <div className="relative flex items-center justify-center pt-1">
                      <input
                        type="checkbox"
                        checked={field.value}
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
                      Accept Terms and Conditions
                    </FormLabel>
                    <FormDescription className="text-xs">
                      You agree to our Terms of Service and Privacy Policy.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* SUBMIT & RESET BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button type="submit" className="flex-1 h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                Save Profile
              </Button>
              <Button type="button" variant="outline" onClick={onReset} className="flex-none sm:w-32 h-12 rounded-xl text-base font-medium border-border/50 bg-background/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors">
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  )
}
