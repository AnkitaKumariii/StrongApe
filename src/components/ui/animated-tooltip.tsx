import React, { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number;
    name: string;
    designation: string;
    image: string;
    recentPost?: string;
  }[];
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0); 
  
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );
  
  const handleMouseMove = (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    const target = event.target as HTMLImageElement;
    const halfWidth = target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth); 
  };

  return (
    <>
      {items.map((item) => (
        <div
          className="-mr-4 relative group"
          key={item.id}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === item.id && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.6 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 260,
                      damping: 10,
                    },
                  }}
                  exit={{ opacity: 0, y: 20, scale: 0.6 }}
                  style={{
                    translateX: translateX,
                    rotate: rotate,
                    whiteSpace: "nowrap",
                  }}
                  className="absolute -top-16 -left-1/2 translate-x-1/2 flex text-xs flex-col items-center justify-center rounded-xl bg-black z-50 shadow-xl px-4 py-2 border border-slate-800"
                >
                  <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-primary to-transparent h-px " />
                  <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px " />
                  <div className="font-bold text-white relative z-30 text-sm">
                    {item.name}
                  </div>
                  <div className="text-slate-300 text-xs font-medium">{item.designation}</div>
                </motion.div>

                {item.recentPost && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scaleY: 0.8 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scaleY: 1,
                      transition: {
                        type: "spring",
                        stiffness: 260,
                        damping: 15,
                        delay: 0.05,
                      },
                    }}
                    exit={{ opacity: 0, y: -10, scaleY: 0.8, transition: { duration: 0.15 } }}
                    style={{ originY: 0, translateX: translateX }}
                    className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-64 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-40 pointer-events-none"
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase tracking-wider">Latest Post</div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-3">
                      {item.recentPost}
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
          <img
            onMouseMove={handleMouseMove}
            src={item.image}
            alt={item.name}
            className="object-cover !m-0 !p-0 object-top rounded-full h-14 w-14 border-2 group-hover:scale-105 group-hover:z-30 border-white relative transition duration-500 shadow-sm hover:shadow-md cursor-pointer"
          />
        </div>
      ))}
    </>
  );
};
