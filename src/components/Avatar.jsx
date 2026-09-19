import React, { memo, useEffect, useState } from "react";

// Round profile picture. Shows the person's photo when they have set one,
// otherwise the first letter of their name (the same look the chat used before).
// If the photo can't be loaded it quietly falls back to the letter.
function Avatar({ user, size = 40, className = "" }) {
  const src = user?.avatarUrl || "";
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const box = { width: size, height: size };

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        style={box}
        className={`shrink-0 rounded-full bg-gray-100 object-cover ${className}`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{ ...box, fontSize: Math.max(11, Math.round(size * 0.36)) }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-400 ${className}`}
    >
      {initial}
    </div>
  );
}

export default memo(Avatar);
