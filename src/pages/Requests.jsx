import React, { useCallback, useMemo, useState } from "react";
import DashboardTopbar from "../components/DashboardTopbar.jsx";
import RequestCard from "../components/RequestCard.jsx";
import RequestDetailModal from "../components/RequestDetailModal.jsx";
import useRequests from "../hooks/useRequests.js";
import api from "../api/axios.js";
import { BLOOD_GROUPS } from "../utils/constants.js";

const URGENCY_OPTIONS = ["All", "Emergency", "Urgent", "Normal"];

export default function Requests() {
  const [bloodGroupFilter, setBloodGroupFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");

  // Only pass real filters to the API/hook so the query key stays stable
  const filters = useMemo(() => {
    const f = { status: "Open" };
    if (bloodGroupFilter !== "All") f.bloodGroup = bloodGroupFilter;
    if (urgencyFilter !== "All") f.urgency = urgencyFilter;
    return f;
  }, [bloodGroupFilter, urgencyFilter]);

  const { requests, loading, error } = useRequests(filters);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [helpingIds, setHelpingIds] = useState(() => new Set());

  const handleHelp = useCallback(async (request) => {
    try {
      await api.post(`/requests/${request._id}/help`);
    } catch (err) {
      if (err.response?.status !== 409) {
        console.error(err);
        return;
      }
    }
    setHelpingIds((prev) => new Set(prev).add(request._id));
  }, []);

  return (
    <div>
      <DashboardTopbar title="Nearby Blood Requests" />

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={bloodGroupFilter}
          onChange={(e) => setBloodGroupFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="All">All Blood Groups</option>
          {BLOOD_GROUPS.map((bg) => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>

        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {URGENCY_OPTIONS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading requests...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {requests.map((request) => (
          <RequestCard
            key={request._id}
            request={request}
            onViewRequest={setSelectedRequest}
            onHelp={handleHelp}
            isHelping={helpingIds.has(request._id)}
          />
        ))}
        {!loading && requests.length === 0 && (
          <p className="text-gray-500 text-sm">No matching requests found.</p>
        )}
      </div>

      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onHelp={handleHelp}
        isHelping={selectedRequest ? helpingIds.has(selectedRequest._id) : false}
      />
    </div>
  );
}
