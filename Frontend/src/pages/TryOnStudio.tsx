import { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import { useAppContext } from "@/context/AppContext"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shirt, Sparkles, Box, ScanLine, Compass } from "lucide-react"

export default function TryOnStudio() {
  const { latestUpload, getRecommendations } = useAppContext()
  const outfits = getRecommendations().slice(0, 5) // Take top 5 for the wardrobe
  
  const [activeGarment, setActiveGarment] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(true)
  const [isEquipping, setIsEquipping] = useState(false)

  // 3D Tilt Effect
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-200, 200], [15, -15])
  const rotateY = useTransform(x, [-200, 200], [-15, 15])

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (rect) {
      x.set(event.clientX - rect.left - rect.width / 2)
      y.set(event.clientY - rect.top - rect.height / 2)
    }
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  useEffect(() => {
    // Simulate the initial 3D mesh generation loading phase
    const timer = setTimeout(() => setIsScanning(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  const equipGarment = (garment: any) => {
    if (activeGarment?.id === garment.id) return
    setIsEquipping(true)
    setTimeout(() => {
      setActiveGarment(garment)
      setIsEquipping(false)
    }, 1800)
  }

  if (!latestUpload) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <h2 className="text-2xl text-muted-foreground">Please upload an image first to generate your 3D Avatar.</h2>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-8 md:py-12 max-w-7xl min-h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Box className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500">
            Luma Try-On Studio
          </h1>
          <p className="text-muted-foreground text-sm">Real-time 3D Holographic Fitting</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Holographic Avatar Display */}
        <div className="flex-1 flex flex-col items-center justify-center relative bg-black/40 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-3xl p-8">
          
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouse}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden cursor-crosshair border border-white/10 shadow-[0_0_50px_rgba(99,102,241,0.2)]"
          >
            {/* The base uploaded image */}
            <img 
              src={latestUpload.imageUrl} 
              alt="Avatar Base" 
              className={`w-full h-full object-cover transition-opacity duration-1000 ${isScanning ? 'opacity-30 mix-blend-luminosity' : 'opacity-100'}`}
            />

            {/* Generative "3D Grid" Overlay Simulation */}
            {isScanning && (
              <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.2)_1px,transparent_1px)] bg-[size:20px_20px] " style={{ transform: "translateZ(50px)" }}>
                <motion.div 
                  initial={{ top: "-10%" }}
                  animate={{ top: "110%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_cyan]"
                />
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                  <ScanLine className="h-12 w-12 text-cyan-400 animate-pulse" />
                  <span className="text-cyan-400 font-mono tracking-widest text-sm bg-black/50 px-3 py-1 rounded">BUILDING 3D MESH</span>
                </div>
              </div>
            )}

            {/* Equipped Garment Overlay */}
            <AnimatePresence>
              {activeGarment && !isScanning && (
                <motion.div
                  key={activeGarment.id}
                  initial={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 z-10 flex items-center justify-center p-8 pointer-events-none mix-blend-normal"
                >
                  <motion.img 
                    src={activeGarment.imageUrl} 
                    alt="garment" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                    style={{ transform: "translateZ(30px)" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Equipping VFX */}
            <AnimatePresence>
              {isEquipping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-indigo-500/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <Sparkles className="h-12 w-12 text-white animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>
            
          </motion.div>

          <div className="mt-8 flex gap-4 text-xs font-mono text-muted-foreground opacity-60">
            <span>[X: {(x.get() / 10).toFixed(1)}]</span>
            <span>[Y: {(y.get() / 10).toFixed(1)}]</span>
            <span>3D PROJECTION ACTIVE</span>
          </div>
        </div>

        {/* Style Analysis & Wardrobe Panel */}
        <div className="w-full lg:w-[450px] flex flex-col gap-6">
          
          {/* AI Analysis Card */}
          <Card className="bg-card/40 backdrop-blur-xl border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Compass className="h-5 w-5 text-indigo-400" />
                <h3 className="font-semibold text-lg">AI Style Analysis</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Personality Traits Detected</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20">Avant-Garde</Badge>
                    <Badge variant="secondary" className="bg-pink-500/10 text-pink-400 hover:bg-pink-500/20">Minimalist</Badge>
                    <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20">Urban</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Color Silhouette Fit</span>
                    <span className="text-green-400 font-mono">98%</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: "98%" }} className="h-full bg-green-400" transition={{ delay: 1, duration: 2 }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Virtual Wardrobe */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Shirt className="h-5 w-5 text-primary" />
                Virtual Wardrobe
              </h3>
              <span className="text-xs text-muted-foreground">{outfits.length} Matches</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 pb-2">
              {outfits.map((outfit) => (
                <motion.div 
                  key={outfit.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => equipGarment(outfit)}
                >
                  <Card className={`cursor-pointer overflow-hidden border-2 transition-all h-full ${activeGarment?.id === outfit.id ? 'border-primary shadow-[0_0_20px_rgba(99,102,241,0.3)] bg-primary/5' : 'border-border/30 hover:border-border'}`}>
                    <div className="aspect-square bg-muted/30 p-4 relative">
                      <img src={outfit.imageUrl} className="w-full h-full object-cover rounded-md mix-blend-luminosity hover:mix-blend-normal transition-all" alt={outfit.name} />
                      {activeGarment?.id === outfit.id && (
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                          <Badge className="bg-primary text-white font-bold">EQUIPPED</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-center">
                      <div className="font-medium text-sm truncate">{outfit.name}</div>
                      <div className="text-xs text-muted-foreground">{outfit.matchScore}% Match</div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
