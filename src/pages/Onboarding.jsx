import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Droplet } from "lucide-react";
import useAuthStore from "../store/authStore.js";
import DonorSetupStep from "../components/onboarding/DonorSetupStep.jsx";
import CreateRequestForm from "../components/requests/CreateRequestForm.jsx";
import RequestSubmittedModal from "../components/requests/RequestSubmittedModal.jsx";

// Shown once, right after signup:
//   donor   -> "You're about to become someone's hope" (availability, last donation…)
//   patient -> "Let's find the help you need" (first blood request)
export default function Onboarding() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(null);

  if (!user) return <Navigate to="/login" replace />;

  const isPatient = user.role === "patient";
  const goHome = (state) => navigate("/home", { replace: true, state });

  return (
    <div className="min-h-screen bg-[#f4f2f0]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <Droplet className="fill-brand-500 text-brand-500" size={26} />
            <div>
              <p className="text-lg font-extrabold leading-none">Blood Seva</p>
              <p className="text-[11px] font-semibold tracking-wide text-brand-500">JABALPUR</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex items-center justify-center px-4 py-6 sm:px-6 sm:py-12">
        <div className={`w-full rounded-2xl bg-white p-5 shadow-sm sm:p-8 ${isPatient ? "max-w-xl" : "max-w-md"}`}>
          {isPatient ? (
            <CreateRequestForm onCreated={setSubmitted} />
          ) : (
            <DonorSetupStep onDone={() => goHome()} />
          )}

          <button
            type="button"
            onClick={() => goHome()}
            className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-800"
          >
            Skip for now
          </button>
        </div>
      </main>

      {submitted && (
        <RequestSubmittedModal
          request={submitted}
          onClose={() => goHome()}
          onView={() => goHome({ openRequestId: submitted._id })}
        />
      )}
    </div>
  );
}
