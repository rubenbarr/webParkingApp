import { useEffect, useState } from "react";

function useDelayedUnmount(isOpen: boolean, delay: number) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOpen) {
        setShouldRender(true)
    } else {
      timeout = setTimeout(() => setShouldRender(false), delay);
    }
    return () => clearTimeout(timeout);
  }, [isOpen, delay]);
  return shouldRender;
}

export default useDelayedUnmount;
