import { useEffect } from "react";

// Calls the given handler anytime the given element's layout changes
//
// Currently this is only called initially, upon element resize, and upon
// browser window resize
export const useElementLayoutObserver = (ref, rawHandler) => {
    useEffect(() => {
        if (!ref.current) {
            return;
        }
        const handler = () => {
            const layout = ref.current.getBoundingClientRect();
            rawHandler(layout);
        };
        handler();
        window.addEventListener("resize", handler);
        const resizeObserver = new ResizeObserver(handler);
        resizeObserver.observe(ref.current);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", handler);
        };
    }, [rawHandler, ref]);
};
