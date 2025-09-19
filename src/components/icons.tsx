import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20.32 7.7A2.5 2.5 0 0 0 18.5 7h-13A2.5 2.5 0 0 0 3.68 7.7L3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5l-.68-3.3z" />
      <path d="M3 11h18" />
      <path d="m6 11-.75-4.5" />
      <path d="m18 11 .75-4.5" />
      <path d="M12 11V7" />
      <path d="M12 18v-2" />
      <path d="M10 16h4" />
    </svg>
  ),
};
