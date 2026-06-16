import { MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface UserCardProps {
  name: string
  initials: string
  level: number
  distance: string
  tags: string[]
  active?: boolean
}

export function UserCard({ name, initials, level, distance, tags, active }: UserCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border-slate-200">
      <CardContent className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary text-white font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {active && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary border-2 border-white rounded-full"></span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-900 truncate">{name}</div>
            <div className="flex items-center text-xs text-slate-500 font-medium">
              <span>Level {level}</span>
              <span className="mx-1.5 opacity-50">•</span>
              <MapPin className="w-3 h-3 mr-0.5" />
              <span>{distance}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <Badge key={tag} className="bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1 text-xs shadow-none">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
