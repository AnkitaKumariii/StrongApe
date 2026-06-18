import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { WorkoutPost } from '@/components/domain/WorkoutPost'

export interface PostCarouselItem {
  id: number
  author: string
  authorId: number
  initials: string
  timeAgo: string
  content: string
  mediaUrl?: string
  likes: number
  comments: number
  isLiked: boolean
}

interface PostCarouselProps {
  posts: PostCarouselItem[]
  onLikeToggle?: (postId: number) => void
  currentUserId?: number
  onDeletePost?: (postId: number) => void
  loop?: boolean
}

const DRAG_THRESHOLD = 60
const VELOCITY_THRESHOLD = 400

const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
    scale: 0.97,
  }),
}

const transition = { type: 'spring' as const, stiffness: 320, damping: 32 }

export function PostCarousel({
  posts,
  onLikeToggle,
  currentUserId,
  onDeletePost,
  loop = false,
}: PostCarouselProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const go = (dir: number) => {
    if (dir > 0) {
      if (!loop && index >= posts.length - 1) return
      setDirection(1)
      setIndex(i => (loop ? (i + 1) % posts.length : Math.min(i + 1, posts.length - 1)))
    } else {
      if (!loop && index <= 0) return
      setDirection(-1)
      setIndex(i => (loop ? (i - 1 + posts.length) % posts.length : Math.max(i - 1, 0)))
    }
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info
    if (offset.x < -DRAG_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) go(1)
    else if (offset.x > DRAG_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) go(-1)
  }

  if (posts.length === 0) return null

  const post = posts[index]

  return (
    <div className="w-full select-none">
      {/* Slide area */}
      <div className="relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait" initial={false}>
          <motion.div
            key={post.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            drag={posts.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={handleDragEnd}
            style={{ cursor: posts.length > 1 ? 'grab' : 'default' }}
            whileDrag={{ cursor: 'grabbing' }}
          >
            <WorkoutPost
              id={post.id}
              author={post.author}
              initials={post.initials}
              timeAgo={post.timeAgo}
              content={post.content}
              mediaUrl={post.mediaUrl}
              likes={post.likes}
              comments={post.comments}
              isLiked={post.isLiked}
              onLikeToggle={onLikeToggle}
              isAuthor={post.authorId === currentUserId}
              onDelete={onDeletePost}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      {posts.length > 1 && (
        <div className="mt-4 flex flex-col items-center gap-3">
          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {posts.map((_, i) => (
              <motion.button
                key={i}
                type="button"
                aria-label={`Go to post ${i + 1}`}
                onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i) }}
                animate={{ scale: i === index ? 1.2 : 1 }}
                transition={{ duration: 0.15 }}
                className={`rounded-full transition-all duration-200 ${
                  i === index
                    ? 'bg-primary w-5 h-2'
                    : 'bg-slate-300 hover:bg-slate-400 w-2 h-2'
                }`}
              />
            ))}
          </div>

          {/* Prev / counter / Next */}
          <div className="flex items-center justify-between w-full px-1">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={!loop && index === 0}
              className="text-xs font-bold text-slate-400 hover:text-primary disabled:opacity-30 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-xs font-semibold text-slate-400 tabular-nums">
              {index + 1} / {posts.length}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={!loop && index === posts.length - 1}
              className="text-xs font-bold text-slate-400 hover:text-primary disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
