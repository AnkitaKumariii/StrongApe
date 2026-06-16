import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface WorkoutPostProps {
  author: string
  initials: string
  timeAgo: string
  content: string
  mediaUrl?: string
  likes: number
  comments: number
  isLiked?: boolean
}

export function WorkoutPost({ author, initials, timeAgo, content, mediaUrl, likes, comments, isLiked }: WorkoutPostProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary text-white font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-900 text-sm truncate">{author}</div>
          <div className="text-xs text-slate-500 font-medium">{timeAgo}</div>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-400 h-8 w-8 rounded-full">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <p className="text-slate-700 text-sm leading-relaxed mb-3">{content}</p>

        {mediaUrl && (
          <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video mb-2 flex items-center justify-center">
            {/* Placeholder for actual image */}
            <div className="text-slate-400 font-medium text-sm">Media Placeholder</div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-2 px-4 border-t border-slate-100 flex gap-1">
        <Button variant="ghost" className={`flex-1 rounded-full h-9 gap-2 text-xs font-semibold ${isLiked ? 'text-primary' : 'text-slate-500'}`}>
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-primary text-primary' : ''}`} />
          {likes}
        </Button>
        <Button variant="ghost" className="flex-1 rounded-full h-9 gap-2 text-xs font-semibold text-slate-500">
          <MessageCircle className="w-4 h-4" />
          {comments}
        </Button>
        <Button variant="ghost" className="flex-1 rounded-full h-9 gap-2 text-xs font-semibold text-slate-500">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </CardFooter>
    </Card>
  )
}
