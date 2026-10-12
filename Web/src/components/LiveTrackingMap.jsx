
import { useEffect, useRef, useState } from "react";
import {
    importLibrary,
    setOptions,
} from "@googlemaps/js-api-loader";

let mapsConfigured = false;

function LiveTrackingMap({ latitude, longitude }) {
    const mapElementRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const animationRef = useRef(null);
    const positionRef = useRef(null);
    const initializedRef = useRef(false);

    const [mapError, setMapError] = useState("");

    useEffect(() => {
        const lat = Number(latitude);
        const lng = Number(longitude);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return;
        }

        let cancelled = false;

        const initializeMap = async () => {
            try {
                const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

                if (!apiKey) {
                    throw new Error("Google Maps API key is missing.");
                }

                if (!mapsConfigured) {
                    setOptions({
                        key: apiKey,
                        v: "weekly",
                    });

                    mapsConfigured = true;
                }

                const { Map } = await importLibrary("maps");
                const { AdvancedMarkerElement } =
                    await importLibrary("marker");

                if (cancelled || !mapElementRef.current) {
                    return;
                }

                const target = { lat, lng };

                if (!mapRef.current) {
                    mapRef.current = new Map(mapElementRef.current, {
                        center: target,
                        zoom: 15,
                        mapId: "DEMO_MAP_ID",
                    });
                }

                if (!markerRef.current) {
                    markerRef.current = new AdvancedMarkerElement({
                        map: mapRef.current,
                        position: target,
                        title: "Courier Location",
                    });

                    positionRef.current = target;
                    initializedRef.current = true;
                } else {
                    animateMarker(target);
                }

                setMapError("");
            } catch (error) {
                console.error("Google Maps initialization failed:", error);

                if (!cancelled) {
                    setMapError(
                        "Unable to load the map. Check your Google Maps API configuration."
                    );
                }
            }
        };

        const animateMarker = (target) => {
            const start = positionRef.current;

            if (!start || !markerRef.current) {
                markerRef.current.position = target;
                positionRef.current = target;
                return;
            }

            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            const distance = Math.hypot(
                target.lat - start.lat,
                target.lng - start.lng
            );

            if (distance < 0.000001) {
                markerRef.current.position = target;
                positionRef.current = target;
                return;
            }

            const duration = 1200;
            const startTime = performance.now();

            const animate = (currentTime) => {
                if (cancelled || !markerRef.current) {
                    return;
                }

                const progress = Math.min(
                    (currentTime - startTime) / duration,
                    1
                );

                // Ease-in/ease-out movement.
                const eased = progress * progress * (3 - 2 * progress);

                const currentPosition = {
                    lat: start.lat + (target.lat - start.lat) * eased,
                    lng: start.lng + (target.lng - start.lng) * eased,
                };

                markerRef.current.position = currentPosition;
                mapRef.current?.panTo(currentPosition);

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    positionRef.current = target;
                    animationRef.current = null;
                }
            };

            animationRef.current = requestAnimationFrame(animate);
        };

        initializeMap();

        return () => {
            cancelled = true;

            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [latitude, longitude]);

    return (
        <section className="mt-6">
            <h3 className="mb-3 text-xl font-semibold text-slate-900">
                Live Courier Location
            </h3>

            {mapError && (
                <p
                    role="alert"
                    className="mb-3 text-sm text-red-600"
                >
                    {mapError}
                </p>
            )}

            <div
                ref={mapElementRef}
                className="h-80 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            />
        </section>
    );
}

export default LiveTrackingMap;
