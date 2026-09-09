import React, { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Droplet } from "lucide-react";
import useAuthStore from "../store/authStore.js";
import StepProgress from "../components/signup/StepProgress.jsx";
import BasicDetailsStep from "../components/signup/BasicDetailsStep.jsx";
import PersonalDetailsStep from "../components/signup/PersonalDetailsStep.jsx";
import BloodInfoStep from "../components/signup/BloodInfoStep.jsx";
import LocationStep from "../components/signup/LocationStep.jsx";

const TOTAL_STEPS = 4;

const INITIAL_FORM = {
  // Step 1 — Basic Details
  name: "",
  phone: "",
  email: "",
  password: "",
  // Step 2 — Personal Details
  dateOfBirth: "",
  gender: "",
  avatarFile: null,
  avatarPreview: "",
  // Step 3 — Blood Information
  bloodGroup: "",
  // Step 4 — Location
  city: "",
  state: "",
  area: "",
  pincode: "",
};

export default function Signup() {
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent");

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const goBack = useCallback(() => {
    if (step === 1) {
      navigate(-1);
      return;
    }
    setStep((s) => s - 1);
  }, [step, navigate]);

  // Each step only needs the slice of the form it owns as its initial values,
  // so it can be memoized and not re-render when unrelated steps mount.
  const basicInitial = useMemo(
    () => ({ name: form.name, phone: form.phone, email: form.email, password: form.password }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const personalInitial = useMemo(
    () => ({
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      avatarFile: form.avatarFile,
      avatarPreview: form.avatarPreview,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const bloodInitial = useMemo(() => ({ bloodGroup: form.bloodGroup }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const locationInitial = useMemo(
    () => ({ city: form.city, state: form.state, area: form.area, pincode: form.pincode }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleBasicContinue = useCallback((values) => {
    setForm((prev) => ({ ...prev, ...values }));
    setStep(2);
  }, []);

  const handlePersonalContinue = useCallback((values) => {
    setForm((prev) => ({ ...prev, ...values }));
    setStep(3);
  }, []);

  const handleBloodContinue = useCallback((values) => {
    setForm((prev) => ({ ...prev, ...values }));
    setStep(4);
  }, []);

  const handleLocationContinue = useCallback(
    async (values) => {
      const finalForm = { ...form, ...values };
      setForm(finalForm);
      setSubmitError("");
      setSubmitting(true);
      try {
        await register({
          name: finalForm.name,
          phone: finalForm.phone,
          email: finalForm.email || undefined,
          password: finalForm.password,
          bloodGroup: finalForm.bloodGroup,
          dateOfBirth: finalForm.dateOfBirth || undefined,
          gender: finalForm.gender || undefined,
          city: finalForm.city,
          state: finalForm.state,
          area: finalForm.area,
          pincode: finalForm.pincode,
        });
        navigate("/home", { replace: true });
      } catch (err) {
        setSubmitError(err.response?.data?.message || "Unable to sign up. Please try again.");
        setSubmitting(false);
      }
    },
    [form, register, navigate]
  );

  return (
    <div className="min-h-screen bg-[#f4f2f0]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Droplet className="text-brand-500 fill-brand-500" size={26} />
            <div>
              <p className="font-extrabold text-lg leading-none">RaktSaathi</p>
              <p className="text-[11px] tracking-wide text-brand-500 font-semibold">JABALPUR</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex items-center justify-center px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm max-w-md w-full p-8">
          <StepProgress step={step} totalSteps={TOTAL_STEPS} onBack={goBack} />

          {step === 1 && (
            <p className="sr-only">
              {intent === "need"
                ? "Sign up to post a blood request and find donors nearby."
                : "Sign up and become part of Jabalpur's donor network."}
            </p>
          )}

          {step === 1 && <BasicDetailsStep initialValues={basicInitial} onContinue={handleBasicContinue} />}
          {step === 2 && <PersonalDetailsStep initialValues={personalInitial} onContinue={handlePersonalContinue} />}
          {step === 3 && <BloodInfoStep initialValues={bloodInitial} onContinue={handleBloodContinue} />}
          {step === 4 && (
            <>
              <LocationStep
                initialValues={locationInitial}
                onContinue={handleLocationContinue}
                submitting={submitting}
              />
              {submitError && <p className="text-sm text-red-600 mt-3">{submitError}</p>}
            </>
          )}

          {step === 1 && (
            <p className="text-center text-gray-500 text-sm mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-brand-600 font-semibold">
                Login
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
