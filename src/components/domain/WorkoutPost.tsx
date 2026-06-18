import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

interface WorkoutPostProps {
  id: number
  author: string
  initials: string
  timeAgo: string
  content: string
  mediaUrl?: string
  likes: number
  comments: number
  isLiked?: boolean
  onLikeToggle?: (postId: number) => void
  index?: number
}

export function WorkoutPost({ id, author, initials, timeAgo, content, mediaUrl, likes, comments, isLiked, onLikeToggle, index = 0 }: WorkoutPostProps) {
  const fullMediaUrl = mediaUrl
    ? (mediaUrl.startsWith("http") ? mediaUrl : `${BASE_URL}${mediaUrl}`)
    : undefined;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20 overflow-hidden group">
      <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 relative">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Avatar className="w-10 h-10 border-2 border-transparent group-hover:border-primary/20 transition-all cursor-pointer">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
          </Avatar>
        </motion.div>
        <div className="flex-1 min-w-0 cursor-pointer">
          <div className="font-bold text-slate-900 text-sm truncate group-hover:text-primary transition-colors">{author}</div>
          <div className="text-xs text-slate-500 font-medium">{timeAgo}</div>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-400 h-8 w-8 rounded-full">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <p className="text-slate-700 text-sm leading-relaxed mb-3">{content}</p>
        
        {fullMediaUrl && (
          <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 mb-2 max-h-96 flex items-center justify-center cursor-pointer group">
            <motion.img 
              src={fullMediaUrl} 
              alt="Post media" 
              className="w-full h-auto object-cover max-h-96"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-2 px-4 border-t border-slate-100 flex gap-1 bg-slate-50/50">
        <motion.button 
          whileHover={{ backgroundColor: "rgba(239, 246, 255, 1)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onLikeToggle && onLikeToggle(id)}
          className={`flex-1 flex items-center justify-center rounded-full h-9 gap-2 text-xs font-semibold overflow-hidden relative cursor-pointer transition-colors ${isLiked ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-primary'}`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={isLiked ? "liked" : "unliked"}
              initial={{ scale: 0.2, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.2, opacity: 0, rotate: 45 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="flex items-center"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-primary text-primary' : 'group-hover:fill-primary/20'}`} />
            </motion.div>
          </AnimatePresence>
          <motion.span
            key={likes}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {likes}
          </motion.span>
        </motion.button>

        <motion.button 
          whileHover={{ backgroundColor: "rgba(241, 245, 249, 1)" }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 flex items-center justify-center rounded-full h-9 gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          {comments}
        </motion.button>

        <motion.button 
          whileHover={{ backgroundColor: "rgba(241, 245, 249, 1)" }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 flex items-center justify-center rounded-full h-9 gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          Share
        </motion.button>
      </CardFooter>
    </Card>
    </motion.div>
  )
}

