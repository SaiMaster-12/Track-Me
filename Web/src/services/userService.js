import { ref, get, set, update } from "firebase/database";
import { database } from "./firebase";

const USERS_PATH = "users";

// Create a customer profile
export const createCustomerProfile = async (user, name = "") => {
    if (!user?.uid) {
        throw new Error("User is not authenticated.");
    }

    const userRef = ref(database, `${USERS_PATH}/${user.uid}`);

    const snapshot = await get(userRef);

    // Never overwrite an existing profile.
    if (snapshot.exists()) {
        return snapshot.val();
    }

    const profile = {
        uid: user.uid,
        name: name || user.displayName || "",
        email: user.email || "",
        role: "CUSTOMER",
        status: "ACTIVE",
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    await set(userRef, profile);

    return profile;
};

// Get the current user's profile
export const getUserProfile = async (uid) => {
    if (!uid) {
        throw new Error("User UID is required.");
    }

    const userRef = ref(database, `${USERS_PATH}/${uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
        return null;
    }

    return snapshot.val();
};

// Update the current user's profile
export const updateUserProfile = async (uid, updates) => {
    if (!uid) {
        throw new Error("User UID is required.");
    }

    const userRef = ref(database, `${USERS_PATH}/${uid}`);

    await update(userRef, {
        ...updates,
        updatedAt: Date.now(),
    });
};