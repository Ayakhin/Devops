import type { ReactNode } from "react";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}

export function SectionTitle({ eyebrow, title, action }: SectionTitleProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
        <h2 className="font-sans text-xl font-semibold tracking-tight text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}
