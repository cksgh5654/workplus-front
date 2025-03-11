import { useState, useEffect } from "react";

const useMediaQuery = (query: string) => {
  const [isMatch, setIsMatch] = useState<boolean>(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const updateMatch = () => setIsMatch(mediaQueryList.matches);

    updateMatch();

    mediaQueryList.addEventListener("change", updateMatch);

    return () => mediaQueryList.removeEventListener("change", updateMatch);
  }, [query]);

  return isMatch;
};

export default useMediaQuery;
