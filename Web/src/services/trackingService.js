
import { ref, get, onValue } from "firebase/database";
import { database } from "./firebase";

const PACKAGES_PATH = "packages";

const normalizePackage = (snapshot, trackingId) => {
    if (!snapshot.exists()) {
        return null;
    }

    const packageData = snapshot.val();

    if (
        packageData.trackingId &&
        packageData.trackingId !== trackingId
    ) {
        return null;
    }

    return {
        ...packageData,
        trackingId: packageData.trackingId || trackingId,
    };
};

// One-time package lookup
export const getPackageByTrackingId = async (trackingId) => {
    const id = trackingId.trim();

    if (!id) {
        throw new Error("Please enter a Tracking ID.");
    }

    const packageRef = ref(database, `${PACKAGES_PATH}/${id}`);
    const snapshot = await get(packageRef);

    return normalizePackage(snapshot, id);
};

// Subscribe to real-time package updates
export const subscribeToPackage = (
    trackingId,
    onUpdate,
    onError
) => {
    const id = trackingId.trim();

    if (!id) {
        throw new Error("Please enter a Tracking ID.");
    }

    const packageRef = ref(database, `${PACKAGES_PATH}/${id}`);

    return onValue(
        packageRef,
        (snapshot) => {
            onUpdate(normalizePackage(snapshot, id));
        },
        (error) => {
            if (onError) {
                onError(error);
            } else {
                console.error("Real-time tracking failed:", error);
            }
        }
    );
};
