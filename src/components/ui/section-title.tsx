import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  gradientText?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  align?: "left" | "center" | "right";
  showDivider?: boolean;
  dividerClassName?: string;
}

export function SectionTitle({
  title,
  subtitle,
  gradientText,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
  align = "center",
  showDivider = false,
  dividerClassName = "",
}: SectionTitleProps) {
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div
      className={cn(
        "flex flex-col mb-12 md:mb-16 px-4 w-full",
        alignmentClasses[align],
        className
      )}
    >
      {showDivider && (
        <div
          className={cn(
            "w-20 h-1 bg-gradient-to-r from-primary to-primary/50 mb-8",
            align === "center" ? "mx-auto" : "",
            align === "right" ? "ml-auto" : "",
            dividerClassName
          )}
        />
      )}

      <h2
        className={cn(
          "text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight",
          "bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/70",
          titleClassName
        )}
      >
        {gradientText ? (
          <>
            <span className="text-foreground/90">
              {title.split(gradientText)[0]}
            </span>
            <span className="mandorla-text-gradient">{gradientText}</span>
            <span className="text-foreground/90">
              {title.split(gradientText)[1]}
            </span>
          </>
        ) : (
          title
        )}
      </h2>

      {subtitle && (
        <p
          className={cn(
            "text-muted-foreground text-lg max-w-2xl leading-relaxed mt-2",
            align === "center" ? "mx-auto" : "",
            align === "right" ? "ml-auto" : "",
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
