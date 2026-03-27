import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Upload, Wand2, Shirt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const features = [
  {
    icon: Upload,
    title: "Upload Your Look",
    description: "Simply snap or upload a photo of your current outfit or individual clothing items.",
  },
  {
    icon: Wand2,
    title: "AI Analysis",
    description: "Our advanced vision models analyze color palettes, styles, and seasonal appropriateness.",
  },
  {
    icon: Shirt,
    title: "Get Recommendations",
    description: "Instantly receive curated outfit matches and styling suggestions to elevate your look.",
  },
]

const floatingMockups = [
  { id: 1, src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80", delay: 0, y: [0, -20, 0] },
  { id: 2, src: "https://images.unsplash.com/photo-1434389678219-4b6e50f3b4f6?w=400&q=80", delay: 1, y: [0, 20, 0] },
  { id: 3, src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80", delay: 2, y: [0, -15, 0] },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] w-full relative overflow-hidden">
      {/* Dynamic Animated Background Gradients */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 h-[600px] w-[600px] -translate-x-[20%] translate-y-[10%] rounded-full bg-indigo-500/20 opacity-40 blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 h-[500px] w-[500px] translate-x-[10%] -translate-y-[10%] rounded-full bg-pink-500/20 opacity-40 blur-[120px]"
        />
      </div>

      {/* Hero Section */}
      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center space-y-12 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8 max-w-5xl flex flex-col items-center relative"
        >
          {/* Floating UI Elements for aesthetic */}
          <div className="absolute hidden lg:block -left-40 top-10 pointer-events-none origin-center -rotate-6">
             <motion.div 
               animate={{ y: floatingMockups[0].y }} 
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: floatingMockups[0].delay }}
               className="p-3 rounded-3xl bg-card/80 backdrop-blur-xl shadow-2xl border border-white/10"
             >
                <img src={floatingMockups[0].src} className="w-36 h-48 object-cover rounded-2xl shadow-inner" alt="mock" />
             </motion.div>
          </div>
          <div className="absolute hidden lg:block -right-40 top-24 pointer-events-none origin-center rotate-6">
             <motion.div 
               animate={{ y: floatingMockups[1].y }} 
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: floatingMockups[1].delay }}
               className="p-3 rounded-3xl bg-card/80 backdrop-blur-xl shadow-2xl border border-white/10"
             >
                <img src={floatingMockups[1].src} className="w-32 h-44 object-cover rounded-2xl shadow-inner" alt="mock" />
             </motion.div>
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 backdrop-blur-md px-5 py-2 text-sm font-semibold text-primary shadow-sm"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Introducing Luma Vision AI v2.0</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[1.1] pb-2">
            Elevate Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x bg-[length:200%_auto]">
              Personal Style
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
            Upload your wardrobe. Let our vision models curate breathtaking outfits uniquely tailored for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <Link to="/upload">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg font-bold shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)] hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.8)] hover:scale-105 transition-all">
                Try Luma For Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg font-bold border-border/50 bg-background/50 backdrop-blur-sm hover:bg-card hover:scale-105 transition-all">
                View Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full max-w-6xl mt-24"
        >
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden rounded-[2rem] border border-border/40 bg-card/60 p-8 backdrop-blur-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
