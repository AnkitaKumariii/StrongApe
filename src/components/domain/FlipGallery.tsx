import { useRef, useEffect, useCallback } from "react"
import { gsap } from "gsap"
import { Flip } from "gsap/Flip"
import { useGSAP } from "@gsap/react"
import { Button } from "@/components/ui/button"
import "./FlipGallery.css"

if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip)
}

export interface FlipGalleryItem {
  title: string
  secondary: string
  text: string
  image: string
}

interface FlipGalleryProps {
  items: FlipGalleryItem[]
  heading: React.ReactNode
  subtitle: string
  chosenImageAlt: string
  tryOutLabel?: string
  onTryOut?: () => void
}

export function FlipGallery({
  items,
  heading,
  subtitle,
  chosenImageAlt,
  tryOutLabel = "Try Out",
  onTryOut,
}: FlipGalleryProps) {
  const appRef = useRef<HTMLDivElement>(null)
  const chosenRef = useRef<HTMLDivElement>(null)
  const chosenDetailsRef = useRef<HTMLDivElement>(null)
  const chosenImageRef = useRef<HTMLImageElement>(null)
  const chosenNameRef = useRef<HTMLDivElement>(null)
  const chosenMetaRef = useRef<HTMLDivElement>(null)
  const chosenDescriptionRef = useRef<HTMLDivElement>(null)

  const activeCardRef = useRef<HTMLElement | null>(null)
  const isHoveringRef = useRef(false)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const introPlayedRef = useRef(false)

  const getCards = useCallback(() => {
    return gsap.utils.toArray<HTMLElement>(".flip-gallery__card", appRef.current)
  }, [])

  const { contextSafe } = useGSAP({ scope: appRef })

  const killGalleryTweens = contextSafe(() => {
    const cards = getCards()
    gsap.killTweensOf([
      chosenRef.current,
      chosenDetailsRef.current,
      chosenImageRef.current,
      ...cards,
    ])
  })

  const hideDetails = contextSafe(() => {
    const activeCard = activeCardRef.current
    if (!activeCard || !chosenRef.current || !chosenDetailsRef.current) return

    killGalleryTweens()

    const cards = getCards()
    const state = Flip.getState(chosenRef.current)

    Flip.fit(chosenRef.current, activeCard, {
      scale: true,
      fitChild: chosenImageRef.current!,
    })

    const tl = gsap.timeline()
    tl.set(chosenRef.current, { overflow: "hidden" })
      .to(chosenDetailsRef.current, { xPercent: -100, duration: 0.25 }, 0)
      .to(
        cards,
        {
          opacity: 1,
          duration: 0.3,
          stagger: { amount: 0.15, from: cards.indexOf(activeCard) },
        },
        0
      )

    Flip.from(state, {
      scale: true,
      duration: 0.45,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(chosenRef.current, { visibility: "hidden" })
      },
      onInterrupt: () => tl.kill(),
    })

    activeCardRef.current = null
  })

  const showDetails = contextSafe((card: HTMLElement) => {
    if (activeCardRef.current === card) return
    if (!chosenRef.current || !chosenDetailsRef.current || !chosenImageRef.current) return

    killGalleryTweens()

    const cards = getCards()
    if (activeCardRef.current) {
      gsap.set(chosenRef.current, { visibility: "hidden" })
      gsap.set(chosenDetailsRef.current, { xPercent: -100, overflow: "hidden" })
      gsap.set(cards, { opacity: 1 })
      activeCardRef.current = null
    }

    const { title = "", secondary = "", text = "" } = card.dataset
    if (chosenNameRef.current) chosenNameRef.current.textContent = title
    if (chosenMetaRef.current) chosenMetaRef.current.textContent = secondary
    if (chosenDescriptionRef.current) chosenDescriptionRef.current.textContent = text

    const runFlipIn = () => {
      if (!chosenRef.current || !chosenDetailsRef.current) return

      Flip.fit(chosenRef.current, card, {
        scale: true,
        fitChild: chosenImageRef.current!,
      })

      const state = Flip.getState(chosenRef.current)

      gsap.set(chosenRef.current, {
        clearProps: "transform",
        xPercent: -50,
        yPercent: -50,
        left: "50%",
        top: "50%",
        visibility: "visible",
        overflow: "hidden",
      })

      const tl = gsap.timeline()
      tl.add(
        Flip.from(state, {
          duration: 0.45,
          ease: "power2.inOut",
          scale: true,
          onComplete: () => {
            gsap.set(chosenDetailsRef.current, { overflow: "auto" })
          },
        })
      ).to(chosenDetailsRef.current, { xPercent: 0, duration: 0.25 }, 0.15)

      const otherCards = cards.filter((c) => c !== card)
      gsap.to(otherCards, {
        opacity: 0.3,
        duration: 0.3,
        stagger: { amount: 0.2, from: cards.indexOf(card) },
      })
    }

    const img = chosenImageRef.current
    const newSrc = card.querySelector("img")?.getAttribute("src") ?? ""

    const onImageReady = () => {
      img.removeEventListener("load", onImageReady)
      runFlipIn()
    }

    img.addEventListener("load", onImageReady)
    img.src = newSrc
    if (img.complete) onImageReady()

    activeCardRef.current = card
  })

  const handleMouseEnterCard = (card: HTMLElement) => {
    isHoveringRef.current = true
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    showDetails(card)
  }

  const handleMouseEnterChosen = () => {
    isHoveringRef.current = true
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  const handleMouseLeave = () => {
    isHoveringRef.current = false
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) hideDetails()
    }, 120)
  }

  useGSAP(() => {
    if (chosenDetailsRef.current) {
      gsap.set(chosenDetailsRef.current, { xPercent: -100 })
    }

    if (introPlayedRef.current || !appRef.current) return
    introPlayedRef.current = true

    const cards = getCards()
    gsap.from(cards, {
      autoAlpha: 0,
      y: 16,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.out",
    })
  }, { scope: appRef })

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  return (
    <div className="flip-gallery w-full">
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col items-center">
        <div className="mb-6 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{heading}</h2>
            <p className="text-slate-500 font-semibold text-xs mt-1">{subtitle}</p>
          </div>
          {onTryOut && (
            <Button
              variant="outline"
              className="rounded-full font-bold border-primary text-primary hover:bg-primary/5 cursor-pointer self-center sm:self-auto px-6 h-10 shrink-0 text-xs"
              onClick={onTryOut}
            >
              {tryOutLabel}
            </Button>
          )}
        </div>

        <div className="flip-gallery__app" ref={appRef}>
          <div className="flip-gallery__board">
            {items.map((item) => (
              <div
                key={item.title}
                className="flip-gallery__card"
                data-title={item.title}
                data-secondary={item.secondary}
                data-text={item.text}
                onMouseEnter={(e) => handleMouseEnterCard(e.currentTarget)}
                onMouseLeave={handleMouseLeave}
              >
                <img src={item.image} alt={item.title} loading="eager" />
              </div>
            ))}
          </div>

          <div
            className="flip-gallery__chosen"
            ref={chosenRef}
            onMouseEnter={handleMouseEnterChosen}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flip-gallery__chosen-image" onClick={() => hideDetails()}>
              <img ref={chosenImageRef} alt={chosenImageAlt} />
            </div>
            <div className="flip-gallery__chosen-details" ref={chosenDetailsRef}>
              <div className="flip-gallery__chosen-name" ref={chosenNameRef} />
              <div className="flip-gallery__chosen-meta" ref={chosenMetaRef} />
              <div className="flip-gallery__chosen-description" ref={chosenDescriptionRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
