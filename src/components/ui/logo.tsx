import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = "", width = 32, height = 32 }: LogoProps) {
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src="/logo.svg"
        alt="Mandorla Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
