import { useCallback, useState } from "react";

// Uses the browser Geolocation API to get coordinates, then reverse-geocodes
// them into a city/state/area/pincode via OpenStreetMap's free Nominatim API
// (no API key required). Returns a single `locate()` you can wire to a button.
export default function useCurrentLocation() {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const locate = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        const err = "Geolocation isn't supported by this browser.";
        setError(err);
        reject(new Error(err));
        return;
      }

      setLocating(true);
      setError("");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`;
            const res = await fetch(url, {
              headers: { Accept: "application/json" },
            });
            if (!res.ok) throw new Error("Reverse geocoding failed");
            const data = await res.json();
            const addr = data.address || {};

            const result = {
              latitude,
              longitude,
              city:
                addr.city || addr.town || addr.village || addr.county || "",
              state: addr.state || "",
              area:
                addr.suburb || addr.neighbourhood || addr.road || addr.city_district || "",
              pincode: addr.postcode || "",
            };

            setLocating(false);
            resolve(result);
          } catch (err) {
            setLocating(false);
            const message = "Couldn't determine your address from your location.";
            setError(message);
            reject(new Error(message));
          }
        },
        (geoError) => {
          setLocating(false);
          const message =
            geoError.code === geoError.PERMISSION_DENIED
              ? "Location access was denied. Please enter your address manually."
              : "Couldn't get your current location. Please enter it manually.";
          setError(message);
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  return { locate, locating, error };
}
