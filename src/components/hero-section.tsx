import { Button } from "../components/ui/button";
import { ChevronDown, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

const heroImages = [
  {
    url: "https://assets.seobotai.com/architecturehelper.com/673bf7b50c149f48d61fa9d2-1731984576727.jpg",
    alt: "Congregation worshipping with raised hands",
  },
  {
    url: "https://images.unsplash.com/photo-1438032005730-c779502df39b",
    alt: "Church interior",
  },
  {
    url: "https://images.unsplash.com/photo-1507692049790-de58290a4334",
    alt: "Church exterior",
  },
  {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNd9kq4iezDjJ3QLBUtCsAN9wml6QIDtVrvw&s",
    alt: "Community worship",
  },
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <section className="relative top-0 h-screen flex items-center justify-center text-center text-white">
      {/* Background image with overlay */}
      <div className="absolute inset-0 hero-gradient">
        {heroImages.map((image, index) => (
          <img
            key={index}
            src={image.url}
            alt={image.alt}
            className={`absolute w-full h-full object-cover mix-blend-multiply transition-all duration-1000
              ${currentIndex === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() =>
          setCurrentIndex(
            (prev) => (prev - 1 + heroImages.length) % heroImages.length
          )
        }
        className="absolute left-4 hidden top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() =>
          setCurrentIndex((prev) => (prev + 1) % heroImages.length)
        }
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Pagination */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-3">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`
              relative flex items-center justify-center w-2 h-2 transition-all
              ${
                currentIndex === index
                  ? "scale-110"
                  : "opacity-70 hover:opacity-100"
              }
            `}
            aria-label={`Go to slide ${index + 1}`}
          >
            <span
              className={`
              absolute inset-0 rounded-full transition-all
              ${
                currentIndex === index
                  ? "bg-white scale-100"
                  : "bg-white/50 scale-75 hover:scale-90"
              }
            `}
            />
          </button>
        ))}
      </div>

      <div className="absolute left-0  z-10 w-full h-full mx-auto px-4 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
        <div className="mb-6">
          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            data-testid="hero-title"
            style={{ fontFamily: "Dancing Script" }}
          >
            Welcome Home
          </h1>
          <div
            className="text-xl md:text-2xl mb-8 font-light leading-relaxed"
            data-testid="hero-quote"
          >
            <p className="mb-4">"For where two or three gather in my name,</p>
            <p className="mb-4">there am I with them."</p>
            <p className="text-lg opacity-90">- Matthew 18:20</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/events">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:opacity-90 shadow-lg text-lg px-8 py-4"
              data-testid="button-join-sunday"
            >
              Join Us Sunday
            </Button>
          </Link>
          <Link href="/sermons">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-primary hover:bg-primary hover:text-white shadow-lg text-lg px-8 py-4"
              data-testid="button-watch-live"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Live
            </Button>
          </Link>
        </div>
        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce"
          data-testid="scroll-indicator"
        >
          <ChevronDown className="h-8 w-8" />
        </div>
      </div>
    </section>
  );
}
