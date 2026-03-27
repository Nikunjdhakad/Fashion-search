import { motion } from "framer-motion"
import { useAppContext } from "@/context/AppContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shirt, Image as ImageIcon, Sparkles, LayoutDashboard, Settings, User, Bell, LogOut, BarChart3 } from "lucide-react"
import { Link } from "react-router-dom"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function DashboardPage() {
  const { uploads } = useAppContext()
  const totalItems = uploads.reduce((acc, curr) => acc + curr.itemsDetected, 0)
  
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full relative">
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 border-r border-border/50 bg-card/30 backdrop-blur-xl hidden lg:flex flex-col p-6 space-y-8"
      >
        <div className="space-y-4">
          <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Menu</h3>
          <nav className="space-y-2">
            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium transition-colors">
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/profile-setup" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors group">
              <User className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Profile Setup</span>
            </Link>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors group">
              <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Notifications</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors group">
              <Settings className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
        <div className="mt-auto pt-6 border-t border-border/50">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors group">
            <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 space-y-8 max-w-6xl overflow-y-auto">
        
        {/* User Info UI & Header Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-card/50 backdrop-blur-md border border-border/50 p-6 rounded-[2rem] shadow-xl"
        >
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-1 shadow-lg">
              <img src="https://ui-avatars.com/api/?name=Alex+Doe&background=random" alt="User Avatar" className="h-full w-full rounded-full object-cover border-2 border-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Alex's Dashboard</h1>
              <p className="text-muted-foreground font-medium">Style Level: Fashion Forward <Sparkles className="inline h-4 w-4 text-yellow-500 ml-1" /></p>
            </div>
          </div>
          <Link to="/profile-setup">
            <button className="px-6 py-2.5 bg-background shadow-sm border border-border hover:bg-secondary rounded-full font-medium transition-all text-sm hover:scale-105">
              Edit Profile
            </button>
          </Link>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-3"
        >
          <motion.div variants={itemVariant}>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Uploads</CardTitle>
                <ImageIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{uploads.length}</div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariant}>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Items Detected</CardTitle>
                <Shirt className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalItems}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariant}>
            <Card className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-primary-foreground/80">Style Matches</CardTitle>
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{uploads.length * 3 + 12}</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Charts & Visualizations (Mocked) */}
        <motion.div variants={itemVariant} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
           <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Activity Overview</CardTitle>
                  <CardDescription>Your try-on sessions over the last 7 days</CardDescription>
                </div>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="h-64 w-full flex items-end justify-between gap-2 pt-8">
                 {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
                   <div key={i} className="relative w-full flex flex-col items-center gap-2 group">
                     {/* Tooltip */}
                     <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
                       {height}%
                     </div>
                     <motion.div 
                       initial={{ height: 0 }}
                       animate={{ height: `${height}%` }}
                       transition={{ duration: 1, delay: 0.4 + (i * 0.1), ease: "easeOut" }}
                       className="w-full max-w-[3rem] bg-primary/20 rounded-t-md hover:bg-primary transition-colors cursor-pointer"
                     >
                       <div className="w-full h-full bg-gradient-to-t from-primary/10 to-primary/40 rounded-t-md"></div>
                     </motion.div>
                     <span className="text-xs text-muted-foreground font-medium">
                       {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                     </span>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
        </motion.div>

        {/* Recent Uploads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-6"
        >
          <h2 className="text-2xl font-semibold tracking-tight mb-6">Recent Uploads</h2>
          <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-5 font-medium">Upload ID</th>
                  <th className="px-6 py-5 font-medium">Date</th>
                  <th className="px-6 py-5 font-medium">Items Detected</th>
                  <th className="px-6 py-5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {uploads.length > 0 ? uploads.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-5 font-medium flex items-center gap-3">
                      {item.imageUrl && (
                        <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0 border border-border">
                          <img src={item.imageUrl} alt="upload" className="h-full w-full object-cover" />
                        </div>
                      )}
                      {item.id}
                    </td>
                    <td className="px-6 py-5 text-muted-foreground">{item.date}</td>
                    <td className="px-6 py-5">{item.itemsDetected}</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No recent uploads yet. <Link to="/upload" className="text-primary hover:underline">Start trying on clothes!</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
