import Link from "next/link";
import { Shape } from "@/components/Shape";
import { Wordmark } from "@/components/hero/Wordmark";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <Link href="/" aria-label="Kaiuf home" className="mb-10">
        <Wordmark size="small" />
      </Link>
      <div className="relative mb-8 h-28 w-28 animate-[spin_12s_linear_infinite] text-g-yellow">
        <Shape name="clover" className="h-full w-full" />
        <span className="absolute inset-0 grid animate-[spin_12s_linear_infinite_reverse] place-items-center text-[44px] font-semibold text-[#202124]">?</span>
      </div>
      <h1 className="text-[22px]">Your search did not match any pages.</h1>
      <p className="mt-2 text-on-surface-variant">Suggestions:</p>
      <ul className="mt-3 space-y-1 text-[16px]">
        <li>
          <Link href="/" className="text-link underline-offset-4 hover:underline">
            Go back to the search page
          </Link>
        </li>
        <li>
          <Link href="/?q=kaiuf+projects&tab=projects" className="text-link underline-offset-4 hover:underline">
            Browse the projects
          </Link>
        </li>
        <li>
          <Link href="/?q=contact+kaiuf" className="text-link underline-offset-4 hover:underline">
            Get in touch
          </Link>
        </li>
      </ul>
    </main>
  );
}
