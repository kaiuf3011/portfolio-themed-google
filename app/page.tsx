import { SearchApp } from "@/components/search/SearchApp";

// Runs before first paint. Covers the page with the preloader's first frame when the intro will play,
// or with a blank surface when a ?q= is present, so the hero never flashes before hydration.
const bootScript = `(function(){try{var seen=sessionStorage.getItem("kaiuf:intro-seen")==="1";var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;var q=new URLSearchParams(location.search).has("q");var c=document.documentElement.classList;if(q)c.add("booting","booting-blank");else if(!seen&&!reduce)c.add("booting")}catch(e){}})();`;

export default function Home() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      <SearchApp />
    </>
  );
}
