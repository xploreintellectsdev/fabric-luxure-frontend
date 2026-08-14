import Link from "next/link";

interface BreadcrumbProps {
  segments: string[];
}

const formatSegment = (segment: string) =>
  decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function Breadcrumb({ segments }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-md md:text-md lg:text-lg tracking-widest font-sans font-medium text-light/70">
      <Link href="/" className="hover:text-light transition-colors">
        Home
      </Link>

      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        return (
          <div key={href} className="flex items-center gap-2">
            <span className="text-light font-bold">&gt;</span>

            {isLast ? (
              <span className="text-light font-semibold">
                {formatSegment(segment)}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-light transition-colors"
              >
                {formatSegment(segment)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
