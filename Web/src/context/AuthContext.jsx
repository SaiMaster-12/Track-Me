import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  getRedirectResult,
} from "firebase/auth";

import { auth } from "../services/firebase";
import { createCustomerProfile } from "../services/userService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    const initializeAuth = async () => {
      try {
        // Process Google redirect.
        const redirectResult = await getRedirectResult(auth);

        if (redirectResult?.user) {
          await createCustomerProfile(
            redirectResult.user,
            redirectResult.user.displayName
          );
        }

        unsubscribe = onAuthStateChanged(auth, async (user) => {
          setCurrentUser(user);

          if (user) {
            try {
              const profile = await createCustomerProfile(
                user,
                user.displayName
              );

              setUserProfile(profile);
            } catch (error) {
              console.error("Profile initialization failed:", error);
              setUserProfile(null);
            }
          } else {
            setUserProfile(null);
          }

          setLoading(false);
        });
      } catch (error) {
        console.error("Authentication initialization error:", error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}