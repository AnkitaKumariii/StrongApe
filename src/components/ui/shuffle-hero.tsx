import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EncryptedText } from "./encrypted-text";
import { Button } from "@/components/ui/button";

export const ShuffleHero = ({ username, onLogWorkoutClick }: { username?: string; onLogWorkoutClick?: () => void }) => {
  return (
    <section className="w-full bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-xl grid grid-cols-1 md:grid-cols-2 items-center gap-12 mb-8 relative overflow-hidden">
      <div className="relative z-10">
        <span className="block mb-4 text-xs md:text-sm text-primary font-bold tracking-widest uppercase">
          Better every day
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          <EncryptedText
            text={`Welcome back, ${username || "Ape"}.`}
            encryptedClassName="text-slate-400 font-mono"
            revealedClassName="text-slate-900"
            revealDelayMs={80}
          />
        </h1>
        <p className="text-base md:text-lg text-slate-600 font-medium mb-8">
          Track your progress, find local training partners, and earn XP. Unleash your full potential and dominate your fitness goals.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button onClick={onLogWorkoutClick} className="rounded-full font-bold px-6 shadow-sm hover:-translate-y-0.5 transition-transform">
            Log Workout
          </Button>
          <Button asChild variant="outline" className="rounded-full font-bold px-6 shadow-sm hover:-translate-y-0.5 transition-transform bg-white">
            <a href="/nearby">Find Partner</a>
          </Button>
        </div>
      </div>
      <div className="relative z-10">
        <ShuffleGrid />
      </div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
    </section>
  );
};

const shuffle = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

const squareData = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1526506159807-6c6a856d6b3f?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1534258936925-c58bb474535f?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1584466977710-18e3c4ba7e52?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1469&auto=format&fit=crop",
  },
  {
    id: 13,
    src: "https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=1374&auto=format&fit=crop",
  },
  {
    id: 14,
    src: "https://images.unsplash.com/photo-1578762560042-46ad127c95ea?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 15,
    src: "https://images.unsplash.com/photo-1554244933-d876deb6b2ff?q=80&w=1480&auto=format&fit=crop",
  },
  {
    id: 16,
    src: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1471&auto=format&fit=crop",
  },
];

const generateSquares = () => {
  return shuffle([...squareData]).slice(0, 12).map((sq) => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      className="w-full h-full rounded-xl overflow-hidden shadow-sm"
      style={{
        backgroundImage: `url(${sq.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    ></motion.div>
  ));
};

const ShuffleGrid = () => {
  const timeoutRef = useRef<any>(null);
  const [squares, setSquares] = useState(generateSquares());

  useEffect(() => {
    shuffleSquares();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const shuffleSquares = () => {
    setSquares(generateSquares());
    timeoutRef.current = setTimeout(shuffleSquares, 3000);
  };

  return (
    <div className="grid grid-cols-4 grid-rows-3 h-[300px] md:h-[400px] gap-2">
      {squares.map((sq) => sq)}
    </div>
  );
};
