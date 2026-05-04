export default function SheriffLogo({ size = 40, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div style={{ width: size, height: size }} className="relative flex-shrink-0">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
          <circle cx="50" cy="50" r="48" fill="#1C2333" stroke="#F97316" strokeWidth="2.5"/>
          <path d="M50 15 L72 26 L72 52 C72 66 61 77 50 82 C39 77 28 66 28 52 L28 26 Z" fill="#0D1117" stroke="#F97316" strokeWidth="2"/>
          <path d="M50 15 L72 26 L72 52 C72 66 61 77 50 82 C39 77 28 66 28 52 L28 26 Z" fill="url(#shieldGrad)"/>
          <path d="M50 18 L50 79" stroke="#F97316" strokeWidth="3" opacity="0.6"/>
          <defs>
            <linearGradient id="shieldGrad" x1="28" y1="15" x2="72" y2="82" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F97316" stopOpacity="0.9"/>
              <stop offset="0.5" stopColor="#EA580C" stopOpacity="0.6"/>
              <stop offset="1" stopColor="#0D1117" stopOpacity="0.2"/>
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="4" fill="#F97316"/>
          <circle cx="50" cy="50" r="8" fill="none" stroke="#F97316" strokeWidth="1" opacity="0.4"/>
        </svg>
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0D1117]"/>
      </div>
      {showText && (
        <div>
          <span className="font-display font-800 text-white tracking-tight" style={{ fontSize: size * 0.42 }}>
            AI <span className="text-orange-500">Sheriff</span>
          </span>
        </div>
      )}
    </div>
  )
}