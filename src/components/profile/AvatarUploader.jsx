import React, { useRef, useState } from "react";
import useAuthStore from "../../store/authStore.js";
import useSaveProfile from "../../hooks/useSaveProfile.js";
import { fileToAvatarDataUrl } from "../../utils/image.js";

const MAX_FILE_MB = 8;

// The dashed circle: "your photo or browse files". The picked image is centre-cropped,
// shrunk in the browser and saved as the user's avatar.
export default function AvatarUploader() {
  const avatarUrl = useAuthStore((state) => state.user?.avatarUrl);
  const name = useAuthStore((state) => state.user?.name);
  const { save, saving, error: saveError } = useSaveProfile();
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const pick = () => inputRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // so choosing the same file again still fires onChange
    if (!file) return;

    setError("");
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Please choose an image under ${MAX_FILE_MB} MB.`);
      return;
    }

    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      await save({ avatarUrl: dataUrl }, { successMessage: "Profile photo updated." });
    } catch (err) {
      setError(err.message || "Couldn't process that image.");
    }
  };

  const remove = () => save({ avatarUrl: "" }, { successMessage: "Profile photo removed." });

  return (
    <div className="flex flex-col items-center">
      <div className="h-[106px] w-[106px] overflow-hidden rounded-full border border-dashed border-gray-400 bg-gray-100">
        {avatarUrl ? (
          <img src={avatarUrl} alt={`${name ?? "Your"} profile photo`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-3 text-center leading-tight text-gray-500">
            <span className="text-sm">your photo</span>
            <span className="mt-1 text-[11px]">
              or{" "}
              <button type="button" onClick={pick} className="underline">
                browse files
              </button>
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      {avatarUrl && (
        <div className="mt-2 flex gap-4 text-xs font-semibold">
          <button type="button" onClick={pick} disabled={saving} className="text-brand-600">
            Change photo
          </button>
          <button type="button" onClick={remove} disabled={saving} className="text-gray-500">
            Remove
          </button>
        </div>
      )}
      {saving && <p className="mt-2 text-xs text-gray-500">Saving photo...</p>}
      {(error || saveError) && (
        <p role="alert" className="mt-2 text-center text-xs text-red-600">
          {error || saveError}
        </p>
      )}
    </div>
  );
}
