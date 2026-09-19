import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplet, HeartHandshake, HospitalIcon } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f2f0]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            <Droplet className="text-brand-500 fill-brand-500" size={26} />
            <div>
              <p className="font-extrabold text-lg leading-none">RaktSaathi</p>
              <p className="text-[11px] tracking-wide text-brand-500 font-semibold">JABALPUR</p>
            </div>
          </div>
          <Link
            to="/login"
            className="rounded-lg border border-brand-500 text-brand-600 px-5 py-2 text-sm font-semibold hover:bg-brand-50 transition-colors"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-20 grid md:grid-cols-2 gap-8 md:gap-14 items-center">
        <div>
          <p className="text-brand-500 font-semibold mb-3">सेवा परमो धर्मः</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900 mb-4 sm:mb-5">
            Every drop can save a life.
          </h1>
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-md">
            Jabalpur RaktSaathi connects blood donors with patients in need, in your own
            city. Find donors fast, or register to help someone when it matters most.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <button
            type="button"
            onClick={() => navigate("/signup?intent=donate")}
            className="w-full text-left bg-brand-50 border border-brand-100 rounded-2xl p-5 sm:p-6 hover:border-brand-300 transition-colors"
          >
            <Droplet className="text-brand-500 fill-brand-500 mb-3" size={26} />
            <p className="font-bold text-lg text-gray-900">Donate Blood</p>
            <p className="text-gray-500 text-sm mt-1">I want to help someone by donating blood.</p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/signup?intent=need")}
            className="w-full text-left bg-brand-50 border border-brand-100 rounded-2xl p-5 sm:p-6 hover:border-brand-300 transition-colors"
          >
            <HospitalIcon className="text-brand-500 mb-3" size={26} />
            <p className="font-bold text-lg text-gray-900">Need Blood</p>
            <p className="text-gray-500 text-sm mt-1">I or someone I know needs blood.</p>
          </button>

          <p className="text-center text-gray-500 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 sm:pb-10 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
        <HeartHandshake size={14} />
        Built with care for the people of Jabalpur.
      </footer>
    </div>
  );
}
