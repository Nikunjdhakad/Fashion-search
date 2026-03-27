import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAppContext } from "@/context/AppContext"

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const navigate = useNavigate()
  const { addUpload } = useAppContext()

  const startAnalysis = (url: string) => {
    setIsUploading(true)
    
    // Simulate fake AI processing
    setTimeout(() => {
      setIsUploading(false)
      setIsAnalyzed(true)
      
      // Save to context
      addUpload({
        id: `LUMA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        date: new Date().toISOString().split('T')[0],
        itemsDetected: Math.floor(Math.random() * 4) + 1,
        status: "Analyzed",
        imageUrl: url
      })

      // Navigate to Virtual Try On Studio after seeing success
      setTimeout(() => {
        navigate("/studio")
      }, 1500)
    }, 3000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      startAnalysis(url)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      startAnalysis(url)
    }
  }

  const handleClick = () => {
    if (!isUploading && !isAnalyzed) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="container mx-auto p-4 py-12 md:py-24 max-w-3xl flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-8 text-center"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Try-On Analysis</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Upload a photo of your outfit, and our AI will analyze the style, colors, and fit to provide personalized recommendations.
          </p>
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <div 
          className="relative group cursor-pointer" 
          onClick={handleClick}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${isUploading ? 'animate-pulse opacity-75' : ''}`}></div>
          <div className="relative border-2 border-dashed border-border/60 rounded-[2rem] p-12 md:p-24 text-center bg-card/60 hover:bg-card/80 transition-all backdrop-blur-xl flex flex-col items-center justify-center min-h-[400px] shadow-2xl overflow-hidden">
            
            {previewUrl && (
              <div className="absolute inset-0 z-0 opacity-20">
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover blur-sm" />
              </div>
            )}

            <AnimatePresence mode="wait">
              {!isUploading && !isAnalyzed && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center space-y-6 relative z-10"
                >
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">Click or drag image to upload</h3>
                    <p className="text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                </motion.div>
              )}

              {isUploading && (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center space-y-6 relative z-10"
                >
                  <div className="relative h-24 w-24 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse">
                      Analyzing your style...
                    </h3>
                    <p className="text-muted-foreground">Our AI is extracting features and matching trends.</p>
                  </div>
                  
                  <div className="w-full max-w-sm h-2 bg-secondary rounded-full overflow-hidden mt-8">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.8, ease: "easeInOut" }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    />
                  </div>
                </motion.div>
              )}

              {isAnalyzed && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center space-y-6 relative z-10"
                >
                  <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-green-500">Analysis Complete!</h3>
                    <p className="text-muted-foreground">Redirecting to your recommendations...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </motion.div>
    </div>
  )
}
