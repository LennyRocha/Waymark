import React from "react";
import CustomLink from "./CustomLink";
import { ChevronRight } from "lucide-react";

type Bread = {
  label: string;
  href: string;
  disabled?: boolean;
};

type Props = {
  items: Bread[];
};

export default function Breadcrumb({
  items,
}: Readonly<Props>) {
  const lastIndex = items.length - 1;
  return (
    <div className="flex  items-center justify-start gap-2">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          <CustomLink
            to={item.href}
            disabled={item.disabled ?? false}
          >
            {item.label}
          </CustomLink>
          {index !== lastIndex && (
            <ChevronRight
              size={16}
              color="var(--color-text-secondary)"
            />
          )}
        </div>
      ))}
    </div>
  );
}
