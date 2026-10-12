import { useState } from "react";
import { Link } from "react-router-dom";
import {
    signIn,
    signInWithGoogle,
    resetPassword,
} from "../services/authService";

function Login() {
    // const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await signIn(email, password);

            // Temporary destination.
            // We'll replace this with role-based routing later.
            try {
                await signIn(email, password);
            } catch (error) {
                console.error(error);
                setError("Invalid email or password.");
            } finally {
                setLoading(false);
            }
        } catch (error) {
            console.error(error);

            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            await signInWithGoogle();

            // Temporary destination.
            // We'll replace this with role-based routing later.
            try {
                await signInWithGoogle();
            } catch (error) {
                console.error(error);
                setError("Google sign-in failed. Please try again.");
            } finally {
                setLoading(false);
            }
        } catch (error) {
            console.error(error);

            setError("Google sign-in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Please enter your email address first.");
            return;
        }

        try {
            await resetPassword(email);

            alert("Password reset email sent. Please check your inbox.");
        } catch (error) {
            console.error(error);

            setError("Unable to send password reset email.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">

                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-2xl font-bold shadow-lg">
                        TM
                    </div>

                    <h1 className="mt-4 text-3xl font-bold text-slate-900">
                        TRACK ME
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Delivery tracking made simple
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">

                    <h2 className="text-2xl font-semibold text-slate-900">
                        Welcome back
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Sign in to continue to TRACK ME
                    </p>

                    {/* Error */}
                    {error && (
                        <div className="mt-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleLogin}
                        className="mt-8 space-y-5"
                    >

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Sign In */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="h-px flex-1 bg-slate-200" />

                        <span className="text-sm text-slate-400">
                            OR
                        </span>

                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    {/* Google */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        <span className="font-bold text-lg">
                            G
                        </span>

                        Continue with Google
                    </button>

                    {/* Signup */}
                    <p className="text-center text-sm text-slate-500 mt-6">
                        Don't have an account?

                        <Link
                            to="/signup"
                            className="ml-1 font-semibold text-blue-600 hover:text-blue-700"
                        >
                            Sign Up
                        </Link>
                    </p>

                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    © 2026 TRACK ME. All rights reserved.
                </p>

            </div>
        </div>
    );
}

export default Login;