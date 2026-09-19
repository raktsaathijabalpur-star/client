import React, { useCallback, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Droplet } from "lucide-react";
import useAuthStore from "../store/authStore.js";

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const submittedRef = useRef(false); // true once THIS page started a login

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      submittedRef.current = true;
      setError("");
      setSubmitting(true);
      try {
        await login(identifier, password);
        const redirectTo = location.state?.from?.pathname || "/home";
        navigate(redirectTo, { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to login. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [identifier, password, login, navigate, location]
  );

  // Already signed in (and not because of this form): don't offer a second login on top of it.
  // To use another account, sign out first.
  if (isAuthenticated && !submittedRef.current) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f4f2f0]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center px-4 sm:px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Droplet className="text-brand-500 fill-brand-500" size={26} />
            <div>
              <p className="font-extrabold text-lg leading-none">RaktSaathi</p>
              <p className="text-[11px] tracking-wide text-brand-500 font-semibold">JABALPUR</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex items-center justify-center px-4 sm:px-6 py-10 sm:py-24">
        <div className="bg-white rounded-2xl shadow-sm max-w-md w-full p-5 sm:p-8">
          <h2 className="text-2xl font-extrabold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            Login to continue helping your community.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm text-gray-700 mb-1">
                Mobile Number or Email
              </label>
              <input
                id="identifier"
                type="text"
                required
                placeholder="e.g. 98765 43210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-60"
            >
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-5">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-brand-600 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
