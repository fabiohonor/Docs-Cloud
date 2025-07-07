import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L12 8" />
      <path d="M12 16L12 22" />
      <path d="M17 5L19.5 7.5" />
      <path d="M17 19L19.5 16.5" />
      <path d="M7 5L4.5 7.5" />
      <path d="M7 19L4.5 16.5" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
