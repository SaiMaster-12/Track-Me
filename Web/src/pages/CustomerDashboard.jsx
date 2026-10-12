
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/authService";
import {
    getPackageByTrackingId,
    subscribeToPackage,
} from "../services/trackingService";
import LiveTrackingMap from "../components/LiveTrackingMap";

function CustomerDashboard() {
    const { currentUser, userProfile } = useAuth();

    const [trackingId, setTrackingId] = useState("");
    const [packageData, setPackageData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const displayName =
        userProfile?.name || currentUser?.displayName || "Customer";

    const location = packageData?.liveLocation;

    const handleTrack = async (event) => {
        event.preventDefault();

        const id = trackingId.trim();

        setError("");
        setPackageData(null);

        if (!id) {
            setError("Please enter a Tracking ID.");
            return;
        }

        setLoading(true);

        try {
            const result = await getPackageByTrackingId(id);

            if (!result) {
                setError("No package found. Please check your Tracking ID.");
                return;
            }

            setPackageData(result);
        } catch (err) {
            console.error("Package tracking failed:", err);
            setError("Unable to retrieve tracking details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    useEffect(() => {
        if (!packageData?.trackingId) {
            return;
        }

        let active = true;

        const unsubscribe = subscribeToPackage(
            packageData.trackingId,
            (updatedPackage) => {
                if (!active) return;

                if (updatedPackage) {
                    setPackageData(updatedPackage);
                    setError("");
                } else {
                    setPackageData(null);
                    setError("This package is no longer available.");
                }
            },
            (err) => {
                if (!active) return;

                console.error("Live tracking error:", err);
                setError("Live tracking connection failed.");
            }
        );

        return () => {
            active = false;
            unsubscribe();
        };
    }, [packageData?.trackingId]);

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            TRACK ME
                        </h1>
                        <p className="text-sm text-slate-500">
                            Delivery Tracking
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-10">
                <section className="mb-8">
                    <p className="text-sm font-medium text-blue-600">
                        CUSTOMER DASHBOARD
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        Welcome, {displayName}!
                    </h2>

                    <p className="mt-2 text-slate-600">
                        Track your shipment and stay updated on its delivery.
                    </p>
                </section>

                <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h3 className="text-xl font-semibold text-slate-900">
                        Track Your Package
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                        Enter the Tracking ID provided by your sender.
                    </p>

                    <form
                        onSubmit={handleTrack}
                        className="mt-6 flex flex-col gap-3 sm:flex-row"
                    >
                        <input
                            type="text"
                            value={trackingId}
                            onChange={(event) => setTrackingId(event.target.value)}
                            placeholder="e.g. TRK26B7X91"
                            aria-label="Tracking ID"
                            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Searching..." : "Track Package"}
                        </button>
                    </form>

                    {error && (
                        <p
                            role="alert"
                            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {error}
                        </p>
                    )}
                </section>

                {packageData && (
                    <section className="mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Tracking ID
                                </p>
                                <h3 className="mt-1 text-xl font-bold text-slate-900">
                                    {packageData.trackingId}
                                </h3>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                {packageData.status || "Status unavailable"}
                            </span>
                        </div>

                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-slate-500">Sender</p>
                                <p className="mt-1 font-medium text-slate-800">
                                    {packageData.senderName || "Not available"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">Receiver</p>
                                <p className="mt-1 font-medium text-slate-800">
                                    {packageData.receiverName || "Not available"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">Origin</p>
                                <p className="mt-1 font-medium text-slate-800">
                                    {packageData.origin || "Not available"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">Destination</p>
                                <p className="mt-1 font-medium text-slate-800">
                                    {packageData.destination || "Not available"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">
                                    Estimated Delivery
                                </p>
                                <p className="mt-1 font-medium text-slate-800">
                                    {packageData.estimatedDelivery || "Not available"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">
                                    Last Location Update
                                </p>
                                <p className="mt-1 font-medium text-slate-800">
                                    {location?.lastUpdated || "Not available"}
                                </p>
                            </div>
                        </div>

                        {location?.latitude != null &&
                            location?.longitude != null && (
                                <>
                                    <div className="mt-6 rounded-xl bg-slate-50 p-4">
                                        <h4 className="font-semibold text-slate-900">
                                            Latest Courier Location
                                        </h4>

                                        <p className="mt-2 text-sm text-slate-600">
                                            Latitude: {location.latitude}
                                        </p>

                                        <p className="text-sm text-slate-600">
                                            Longitude: {location.longitude}
                                        </p>

                                        <a
                                            href={`https://www.google.com/maps?q=${encodeURIComponent(
                                                `${location.latitude},${location.longitude}`
                                            )}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-3 inline-block font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            View on Google Maps ↗
                                        </a>
                                    </div>

                                    <LiveTrackingMap
                                        latitude={Number(location.latitude)}
                                        longitude={Number(location.longitude)}
                                    />
                                </>
                            )}
                    </section>
                )}
            </main>
        </div>
    );
}

export default CustomerDashboard;
