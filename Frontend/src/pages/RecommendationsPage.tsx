import { motion } from "framer-motion"
import { useAppContext } from "@/context/AppContext"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Reply, ShoppingBag } from "lucide-react"
import { Link } from "react-router-dom"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function RecommendationsPage() {
  const { getRecommendations, latestUpload } = useAppContext()
  const outfits = getRecommendations()

  return (
    <div className="container mx-auto p-4 py-8 md:py-12 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
      >
        <div className="flex gap-6 items-center">
          {latestUpload?.imageUrl && (
            <div className="hidden md:block h-24 w-24 rounded-2xl overflow-hidden shadow-xl border-2 border-primary/20 shrink-0">
              <img src={latestUpload.imageUrl} alt="Source upload" className="h-full w-full object-cover" />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Style Matches</h1>
            <p className="text-muted-foreground text-lg">Curated outfits based on your recent upload.</p>
          </div>
        </div>
        <Link to="/upload">
          <Button variant="outline" className="rounded-full shadow-sm hover:scale-105 transition-transform bg-background/50 backdrop-blur-sm">
            <Reply className="mr-2 h-4 w-4" /> Try Another Upload
          </Button>
        </Link>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {outfits.map((outfit) => (
          <motion.div key={outfit.id} variants={item}>
            <Card className="overflow-hidden bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 group flex flex-col h-full rounded-3xl">
              <div className="relative overflow-hidden aspect-[3/4]">
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm border-0 font-semibold text-primary px-3 py-1 text-sm">
                    {outfit.matchScore}% Match
                  </Badge>
                </div>
                <img 
                  src={outfit.imageUrl} 
                  alt={outfit.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent p-6 pt-24 translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex gap-2 flex-wrap mb-2">
                    {outfit.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="bg-background/50 backdrop-blur-sm border-border/50 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-bold text-xl leading-tight mb-1 shadow-sm">{outfit.name}</h3>
                </div>
              </div>
              <CardContent className="pt-4 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">{outfit.description}</p>
              </CardContent>
              <CardFooter className="pt-0 pb-6 px-6 gap-2">
                <Button className="flex-1 rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
                  <ShoppingBag className="mr-2 h-4 w-4" /> Shop Look
                </Button>
                <Button variant="secondary" size="icon" className="rounded-xl shrink-0 hover:scale-105 transition-transform bg-secondary/80">
                  <Heart className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
