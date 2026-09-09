import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f2f0] gap-4">
      <h1 className="text-4xl font-extrabold text-gray-900">404</h1>
      <p className="text-gray-500">This page doesn&apos;t exist.</p>
      <Link to="/" className="text-brand-600 font-semibold">Go home</Link>
    </div>
  );
}
