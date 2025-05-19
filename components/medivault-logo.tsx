import { Heart } from "lucide-react"

export function MediVaultLogo({ className }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <Heart className="h-8 w-8" fill="currentColor" />
      </div>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <path
          d="M32 2C15.432 2 2 15.432 2 32C2 48.568 15.432 62 32 62C48.568 62 62 48.568 62 32C62 15.432 48.568 2 32 2ZM32 56C18.745 56 8 45.255 8 32C8 18.745 18.745 8 32 8C45.255 8 56 18.745 56 32C56 45.255 45.255 56 32 56Z"
          fill="currentColor"
          fillOpacity="0.2"
        />
      </svg>
    </div>
  )
}
