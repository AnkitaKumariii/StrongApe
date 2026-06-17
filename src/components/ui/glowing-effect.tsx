import { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

interface GlowingEffectProps {
  blur?: number;
  borderWidth?: number;
  spread?: number;
  glow?: boolean;
  disabled?: boolean;
  proximity?: number;
  inactiveZone?: number;
}

export const GlowingEffect = ({
  blur = 0,
  borderWidth = 3,
  spread = 80,
  glow = true,
  disabled = false,
  proximity = 64,
  inactiveZone = 0.01,
}: GlowingEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (disabled) return;
      if (!containerRef.current) return;
      
      const { left, top } = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - left);
      mouseY.set(e.clientY - top);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [disabled, mouseX, mouseY]);

  if (disabled || !glow) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none rounded-[inherit] overflow-hidden"
    >
      {/* Background glow layer */}
      <motion.div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${spread}px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 82, 204, 0.18),
              rgba(0, 82, 204, 0.35),
              transparent 100%
            )
          `,
          filter: blur > 0 ? `blur(${blur}px)` : "none",
        }}
      />
      {/* Border effect overlay */}
      <div 
        className="absolute inset-0 rounded-[inherit]"
        style={{ padding: borderWidth, pointerEvents: "none" }}
      >
        <motion.div
           className="w-full h-full rounded-[inherit]"
           style={{
             background: useMotionTemplate`
               radial-gradient(
                 ${proximity}px circle at ${mouseX}px ${mouseY}px,
                 rgba(0, 104, 249, 1),
                 transparent 100%
               )
             `,
             maskImage: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
             WebkitMaskImage: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
             WebkitMaskComposite: "xor",
             maskComposite: "exclude",
           }}
        />
      </div>
    </div>
  );
};
