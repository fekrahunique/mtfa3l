import { useEffect, useState } from "react";

/** Canvas textures must be redrawn once the Arabic webfonts have loaded. */
export function useFontsReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
