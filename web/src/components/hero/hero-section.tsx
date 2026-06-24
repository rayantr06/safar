"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface HeroData {
  title: string;
  subtitle: string;
  media_url: string;
  media_type?: string;
  cta_text?: string;
  cta_link?: string;
}

interface CategoryCard {
  name: string;
  icon: string;
  image: string;
}

interface HeroSectionProps {
  hero: HeroData;
  categories: CategoryCard[];
}

/* ------------------------------------------------------------------ */
/*  Carousel card angles — creates the panoramic curve                 */
/* ------------------------------------------------------------------ */

const CARD_ANGLES = [-42, -28, -14, 0, 14, 28, 42];
const CARD_Z_BASE = -60; // base translateZ for depth

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 25, stiffness: 120 },
  },
};

const cardEntrance = {
  hidden: { opacity: 0, y: 80, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      damping: 20,
      stiffness: 90,
      delay: 0.6 + i * 0.07,
    },
  }),
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function HeroSection({ hero, categories }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [navStyle, setNavStyle] = useState({ bgOpacity: 0.08, blur: 12 });

  // Scroll-linked navbar opacity
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    const progress = Math.min(v / 300, 1);
    setNavStyle({
      bgOpacity: 0.08 + progress * 0.57,
      blur: 12 + progress * 12,
    });
  });

  // Fill carousel to exactly 7 cards by repeating
  const carouselCards: CategoryCard[] = [];
  for (let i = 0; i < 7; i++) {
    carouselCards.push(categories[i % categories.length]);
  }

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen min-h-[600px] max-h-[1100px] overflow-hidden flex flex-col"
    >
      {/* ===== Background ===== */}
      <div className="absolute inset-0 z-0">
        {hero.media_type === "video" ? (
          <video
            src={hero.media_url}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <Image
            src={hero.media_url}
            alt="Safar DZ – Aventures Méditerranéennes"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        )}
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      {/* ===== Floating Glassmorphic Navbar (Desktop) ===== */}
      <motion.nav
        className="hero-floating-nav hidden md:flex items-center justify-between mx-auto mt-5 px-3 py-2 rounded-full border border-white/20 relative z-40 w-[min(92%,900px)]"
        style={{
          backgroundColor: `rgba(255,255,255,${navStyle.bgOpacity})`,
          backdropFilter: `blur(${navStyle.blur}px)`,
          WebkitBackdropFilter: `blur(${navStyle.blur}px)`,
        }}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 100, delay: 0.1 }}
      >
        {/* Home icon */}
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center hover:bg-white/25 transition-colors"
        >
          <Home className="h-4.5 w-4.5 text-white" />
        </Link>

        {/* Center nav links */}
        <div className="flex items-center gap-1">
          {[
            { label: "Expériences", href: "/experiences" },
            { label: "Destinations", href: "/destinations" },
            { label: "À propos", href: "/about" },
            { label: "Contact", href: "/contact" },
          ].map((item) => (
            <motion.div key={item.label} whileHover={{ scale: 1.06 }}>
              <Link
                href={item.href}
                className="px-5 py-2 text-sm font-semibold text-white/90 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA pill */}
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/experiences"
            className="px-5 py-2.5 text-sm font-bold bg-white text-primary rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Réserver
          </Link>
        </motion.div>
      </motion.nav>

      {/* ===== Centered Typography ===== */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 text-center -mt-10 md:-mt-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-display-lg-mobile md:text-display-lg font-display-lg text-white mb-5 max-w-3xl leading-tight drop-shadow-lg"
          variants={fadeUpVariant}
          style={{ letterSpacing: "0.04em" }}
        >
          {hero.title}
        </motion.h1>

        <motion.p
          className="text-body-lg text-white/80 mb-10 max-w-xl leading-relaxed drop-shadow-sm"
          variants={fadeUpVariant}
        >
          {hero.subtitle}
        </motion.p>

        {/* Dual pill buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4"
          variants={fadeUpVariant}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link
              href={hero.cta_link || "/experiences"}
              className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all text-sm"
            >
              {hero.cta_text || "Réserver"} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="#destinations"
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white font-bold px-8 py-3.5 rounded-full hover:bg-white/25 transition-all text-sm"
            >
              Découvrir
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ===== 3D Curved Carousel (Desktop) — Atelier Arc Style ===== */}
      <div
        className="hidden md:flex absolute bottom-[-30px] left-0 right-0 z-20 items-end justify-center"
        style={{
          height: "340px",
          perspective: "1200px",
          perspectiveOrigin: "50% 75%",
        }}
      >
        {carouselCards.map((card, i) => {
          const offset = i - 3;
          const angle = offset * 11;
          const distFromCenter = Math.abs(offset);
          const cardH = 290 - distFromCenter * 16;
          const cardW = 170 - distFromCenter * 6;
          const zShift = -distFromCenter * distFromCenter * 12;
          const xShift = offset * 16;

          const isHovered = hoveredIdx === i;
          const isDimmed = hoveredIdx !== null && hoveredIdx !== i;

          return (
            <motion.div
              key={`${card.name}-${i}`}
              custom={i}
              variants={cardEntrance}
              initial="hidden"
              animate="visible"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="shrink-0 cursor-pointer"
              style={{
                width: `${cardW}px`,
                height: `${cardH}px`,
                margin: "0 18px",
                transform: `translateX(${xShift}px) rotateY(${angle}deg) translateZ(${zShift}px)`,
                transformStyle: "preserve-3d",
                willChange: "transform",
                filter: isDimmed ? "brightness(0.5)" : "brightness(1)",
                transition: "filter 0.3s ease",
                zIndex: isHovered ? 20 : 7 - distFromCenter,
              }}
            >
              {/* Thick bezel frame */}
              <div
                className="w-full h-full rounded-[22px] p-[5px]"
                style={{
                  background: "linear-gradient(160deg, rgba(190,190,190,0.6) 0%, rgba(110,110,110,0.5) 40%, rgba(70,70,70,0.55) 100%)",
                  boxShadow: isHovered
                    ? "0 30px 60px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "0 15px 45px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
                  transform: isHovered ? "scale(1.06)" : "scale(1)",
                  transition: "transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease",
                }}
              >
                <div className="relative w-full h-full rounded-[17px] overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <span className="text-white text-[11px] font-bold drop-shadow-lg leading-tight block">
                      {card.icon} {card.name}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ===== Mobile Flat Carousel ===== */}
      <div className="md:hidden relative z-20 pb-6 -mt-2">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-2 no-scrollbar">
          {categories.map((card, i) => (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08, type: "spring", damping: 20 }}
            >
              <Link
                href={`/experiences?category=${encodeURIComponent(card.name)}`}
                className="snap-center shrink-0 relative rounded-2xl overflow-hidden border border-white/20 shadow-lg block"
                style={{ width: "130px", height: "175px" }}
              >
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <span className="text-white text-[11px] font-bold drop-shadow-md leading-tight block">
                    {card.icon} {card.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
