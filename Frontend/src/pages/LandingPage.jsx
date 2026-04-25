import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Upload, Search, ShoppingBag, Camera, Star, Zap, Shield, ChevronDown, Eye, Heart, Shirt } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { useRef } from "react";
import usePageTitle from "@/hooks/usePageTitle";

const steps = [
  {
    step: "01",
    icon: Camera,
    title: "Upload a Photo",
    description: "Snap or upload a photo of any outfit, clothing item, or fashion inspiration you love.",
    color: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/20",
  },
  {
    step: "02",
    icon: Eye,
    title: "AI Finds Matches",
    description: "Our vision AI scans thousands of products across top fashion retailers to find exact or similar items.",
    color: "from-purple-500 to-violet-600",
    glow: "shadow-purple-500/20",
  },
  {
    step: "03",
    icon: ShoppingBag,
    title: "Shop Instantly",
    description: "Browse curated results with prices and direct links. Click to buy from Amazon, Myntra, Ajio & more.",
    color: "from-pink-500 to-rose-600",
    glow: "shadow-pink-500/20",
  },
];

const stats = [
  { value: "25+", label: "Retail Partners", icon: ShoppingBag },
  { value: "99%", label: "Match Accuracy", icon: Zap },
  { value: "Free", label: "No Cost to Use", icon: Star },
  { value: "Secure", label: "Private & Safe", icon: Shield },
];

const brands = [
  "Amazon", "Myntra", "Ajio", "Flipkart", "Meesho",
  "Zara", "H&M", "Nike", "Adidas", "Puma", "ASOS", "Etsy",
];

// Floating orbs for hero
const orbs = [
  { size: 300, x: "10%", y: "20%", color: "bg-indigo-500/20", delay: 0, duration: 7 },
  { size: 200, x: "80%", y: "10%", color: "bg-purple-500/15", delay: 1, duration: 9 },
  { size: 250, x: "70%", y: "70%", color: "bg-pink-500/15", delay: 2, duration: 8 },
  { size: 150, x: "20%", y: "75%", color: "bg-blue-500/10", delay: 0.5, duration: 10 },
  { size: 100, x: "50%", y: "40%", color: "bg-violet-500/10", delay: 1.5, duration: 6 },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay: i * 0.1, type: "spring", stiffness: 100, damping: 15 },
  }),
};

export default function LandingPage() {
  const { user } = useAppContext();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  usePageTitle("AI Fashion Search Engine");

  return (
    <div className="flex flex-col w-full relative overflow-hidden">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {orbs.map((orb, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.3, 1],
                x: [0, 30, -20, 0],
                y: [0, -40, 20, 0],
              }}
              transition={{
                duration: orb.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: orb.delay,
              }}
              className={`absolute rounded-full ${orb.color} blur-[100px]`}
              style={{
                width: orb.size,
                height: orb.size,
                left: orb.x,
                top: orb.y,
              }}
            />
          ))}
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="flex justify-center mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 backdrop-blur-xl px-5 py-2.5 text-sm font-semibold text-primary shadow-sm cursor-default"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Shirt className="h-4 w-4" />
              </motion.div>
              AI-Powered Fashion Search
            </motion.div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tighter leading-[1.02] mb-7"
          >
            Find Any Fashion
            <br />
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 animate-gradient-x bg-[length:200%_auto]">
                From a Photo
              </span>
              {/* Underline decoration */}
              <motion.svg
                viewBox="0 0 400 12"
                className="absolute -bottom-2 left-0 w-full"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
              >
                <motion.path
                  d="M 0 8 Q 100 0, 200 8 T 400 8"
                  fill="none"
                  strokeWidth="3"
                  stroke="url(#gradient)"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(129,140,248)" />
                    <stop offset="50%" stopColor="rgb(168,85,247)" />
                    <stop offset="100%" stopColor="rgb(236,72,153)" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Upload any outfit photo and instantly discover matching products from 25+ top fashion retailers. No login required.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <Link to="/upload">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" className="rounded-full h-14 px-10 text-lg font-bold shadow-[0_0_60px_-15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_80px_-15px_rgba(99,102,241,0.7)] transition-shadow gap-2.5">
                  <Upload className="h-5 w-5" />
                  Search by Photo
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <Link to={user ? "/dashboard" : "/login"}>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-lg font-bold border-border/40 bg-background/40 backdrop-blur-lg hover:bg-card/80 transition-all">
                  {user ? "Dashboard" : "Sign In"}
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="flex items-center justify-center gap-6 text-sm text-muted-foreground/50"
          >
            {["No signup needed", "100% free", "Results in seconds"].map((text, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                {text}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-muted-foreground/30"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════ BRAND TICKER ═══════════════════ */}
      <section className="py-10 border-y border-border/20 bg-muted/10 overflow-hidden">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.25em] mb-6"
        >
          Finds products from trusted retailers
        </motion.p>
        <div className="relative mask-gradient">
          <div className="flex animate-scroll gap-12 whitespace-nowrap">
            {[...brands, ...brands, ...brands].map((brand, i) => (
              <span key={i} className="text-base font-bold text-muted-foreground/25 select-none">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-24 md:py-32 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              whileInView={{ opacity: 1, letterSpacing: "0.25em" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-xs font-semibold text-primary uppercase tracking-[0.25em] mb-4"
            >
              How It Works
            </motion.p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              Three Steps to Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400">
                Perfect Look
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
              >
                <motion.div
                  whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="group relative rounded-3xl border border-border/30 bg-card/40 backdrop-blur-sm p-8 lg:p-10 hover:shadow-2xl hover:border-primary/15 transition-all duration-500 h-full"
                >
                  {/* Background glow on hover */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                  {/* Step number watermark */}
                  <span className="text-[6rem] font-black text-muted-foreground/[0.04] absolute -top-2 right-4 select-none leading-none">
                    {step.step}
                  </span>

                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
                    className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-7 shadow-xl ${step.glow} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <step.icon className="h-7 w-7 text-white" />
                  </motion.div>

                  <h3 className="text-xl font-bold mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>

                  {/* Connector line (between cards) */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-5 w-8 lg:w-10 h-[2px] bg-gradient-to-r from-border/40 to-transparent" />
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section className="py-20 border-y border-border/20 bg-muted/5 relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/3 blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <motion.div
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 400 } }}
                  className="text-center p-6 md:p-8 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/20 hover:border-primary/15 hover:shadow-lg transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
                  >
                    <stat.icon className="h-6 w-6 text-primary mx-auto mb-4 opacity-70" />
                  </motion.div>
                  <p className="text-3xl md:text-4xl font-extrabold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-2 uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="py-24 md:py-32 px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative rounded-[2.5rem] border border-border/30 bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-xl p-12 md:p-16 overflow-hidden text-center">
            {/* Animated gradient border glow */}
            <div className="absolute inset-0 rounded-[2.5rem] p-px bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 -z-10" />

            {/* Floating accent shapes */}
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl"
            />
            <motion.div
              animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl"
            />

            <div className="relative z-10 space-y-7">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="mx-auto shadow-xl shadow-indigo-500/25"
              >
                <Logo className="h-16 w-16" />
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Ready to Find Your Style?
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                Upload a photo and let AI do the shopping for you. Free, fast, and finds products you'll love.
              </p>

              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link to="/upload">
                  <Button size="lg" className="rounded-full h-14 px-10 text-lg font-bold shadow-xl shadow-primary/20 transition-shadow gap-2.5 mt-2">
                    <Camera className="h-5 w-5" />
                    Start Searching
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}