import { Heart } from "lucide-react"

export function EnhancedMediVaultLogo({ className }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Outer ring with glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-blue-500 opacity-20 blur-xl animate-pulse"></div>

      {/* Main circle */}
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer circle */}
        <circle cx="100" cy="100" r="95" stroke="url(#circleGradient)" strokeWidth="5" fill="transparent" />

        {/* Inner circle */}
        <circle
          cx="100"
          cy="100"
          r="75"
          stroke="url(#circleGradient)"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray="4 4"
          className="animate-spin-slow"
          style={{ animationDuration: "30s" }}
        />

        {/* Additional decorative circles */}
        <circle
          cx="100"
          cy="100"
          r="60"
          stroke="url(#circleGradient)"
          strokeWidth="1"
          fill="transparent"
          className="animate-spin-slow"
          style={{ animationDuration: "20s", animationDirection: "reverse" }}
        />

        <circle
          cx="100"
          cy="100"
          r="45"
          stroke="url(#circleGradient)"
          strokeWidth="2"
          fill="transparent"
          strokeDasharray="2 2"
          className="animate-spin-slow"
          style={{ animationDuration: "15s" }}
        />
      </svg>

      {/* Heart icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <Heart className="h-24 w-24 text-primary filter drop-shadow-lg" fill="currentColor" filter="url(#glow)" />
          <div className="absolute inset-0 bg-white opacity-20 blur-sm rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Floating elements */}
      <div
        className="absolute top-1/4 left-1/4 w-8 h-8 bg-primary rounded-full opacity-70 animate-float-delay"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-blue-500 rounded-full opacity-70 animate-float-delay"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-1/2 right-1/5 w-4 h-4 bg-green-500 rounded-full opacity-70 animate-float-delay"
        style={{ animationDelay: "3s" }}
      ></div>

      {/* Additional floating elements */}
      <div
        className="absolute top-3/4 left-1/3 w-5 h-5 bg-purple-500 rounded-full opacity-60 animate-float-delay"
        style={{ animationDelay: "2.5s" }}
      ></div>
      <div
        className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-amber-500 rounded-full opacity-60 animate-float-delay"
        style={{ animationDelay: "1.5s" }}
      ></div>
    </div>
  )
}
