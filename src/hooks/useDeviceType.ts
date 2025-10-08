import { useEffect,useState } from "react";

type DeviceType = "mobile" | "tablet" | "web";

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>("web");

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;

      if (width <= 767) {
        setDeviceType("mobile");
      } else if (width > 767 && width <= 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("web");
      }
    }

    // Run once on mount
    handleResize();

    // Add event listener for screen resize
    window.addEventListener("resize", handleResize);

    // Clean up on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return deviceType;
}
