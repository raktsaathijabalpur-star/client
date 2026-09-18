import React, { useCallback, useMemo, useState } from "react";
import DashboardTopbar from "../components/DashboardTopbar.jsx";
import RequestCard from "../components/RequestCard.jsx";
import RequestDetailModal from "../components/RequestDetailModal.jsx";
import MyRequestCard from "../components/requests/MyRequestCard.jsx";
import NewRequestFlow from "../components/requests/NewRequestFlow.jsx";
import useRequests, { useMyRequests } from "../hooks/useRequests.js";
import useRequestActions from "../hooks/useRequestActions.js";
import useAuthStore from "../store/authStore.js";
import { BLOOD_GROUPS } from "../utils/constants.js";

const URGENCY_OPTIONS = ["All", "Emergency", "Urgent", "Normal"];

function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-6 inline-flex rounded-xl border border-gray-200 bg-white p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          aria-pressed={value === tab.value}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            value === tab.value ? "bg-brand-50 text-brand-600" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ DONOR ------------------------------ */

// All open requests created by patients, with filters
function NearbyRequests() {
  const [bloodGroupFilter, setBloodGroupFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");

  // Only pass real filters to the API/hook so the query key stays stable
  const filters = useMemo(() => {
    const f = {};
    if (bloodGroupFilter !== "All") f.bloodGroup = bloodGroupFilter;
    if (urgencyFilter !== "All") f.urgency = urgencyFilter;
    return f;
  }, [bloodGroupFilter, urgencyFilter]);

  const { requests, loading, error, refetch } = useRequests(filters);
  const actions = useRequestActions(refetch);

  const [selectedId, setSelectedId] = useState(null);
  const selectedRequest = useMemo(
    () => requests.find((r) => r._id === selectedId) ?? null,
    [requests, selectedId]
  );
  const handleView = useCallback((request) => setSelectedId(request._id), []);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={bloodGroupFilter}
          onChange={(e) => setBloodGroupFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="All">All Blood Groups</option>
          {BLOOD_GROUPS.map((bg) => (
            <option key={bg} value={bg}>
              {bg}
            </option>
          ))}
        </select>

        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {URGENCY_OPTIONS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading requests...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {requests.map((request) => (
          <RequestCard
            key={request._id}
            request={request}
            onView={handleView}
            onAccept={actions.accept}
            busy={actions.busy}
          />
        ))}
        {!loading && !error && requests.length === 0 && (
          <p className="text-sm text-gray-500">No matching requests found.</p>
        )}
      </div>

      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedId(null)}
        actions={actions}
      />
    </>
  );
}

// Requests this donor has accepted (open ones + finished ones)
function AcceptedRequests() {
  const { requests, loading, error, refetch } = useMyRequests("all");
  const actions = useRequestActions(refetch);

  const [selectedId, setSelectedId] = useState(null);
  const selectedRequest = useMemo(
    () => requests.find((r) => r._id === selectedId) ?? null,
    [requests, selectedId]
  );
  const handleView = useCallback((request) => setSelectedId(request._id), []);

  return (
    <>
      {loading && <p className="text-sm text-gray-500">Loading your requests...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {requests.map((request) => (
          <MyRequestCard key={request._id} request={request} onView={handleView} />
        ))}
        {!loading && !error && requests.length === 0 && (
          <p className="text-sm text-gray-500">
            You haven't accepted any request yet. Open the "Nearby" tab and tap "I Can Help".
          </p>
        )}
      </div>

      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedId(null)}
        actions={actions}
      />
    </>
  );
}

function DonorRequests() {
  const [tab, setTab] = useState("nearby");

  return (
    <div>
      <DashboardTopbar title="Blood Requests" />
      <Tabs
        tabs={[
          { value: "nearby", label: "Nearby" },
          { value: "accepted", label: "Accepted by me" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "nearby" ? <NearbyRequests /> : <AcceptedRequests />}
    </div>
  );
}

/* ------------------------------ PATIENT ------------------------------ */

// Requests the patient created. "Active" = still open, "History" = fulfilled / cancelled
function PatientRequestList({ scope, showCreate, setShowCreate, onNewRequest }) {
  const { requests, loading, error, refetch } = useMyRequests(scope);
  const actions = useRequestActions(refetch);

  const [selectedId, setSelectedId] = useState(null);
  const selectedRequest = useMemo(
    () => requests.find((r) => r._id === selectedId) ?? null,
    [requests, selectedId]
  );
  const handleView = useCallback((request) => setSelectedId(request._id), []);

  return (
    <>
      {loading && <p className="text-sm text-gray-500">Loading your requests...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {requests.map((request) => (
          <MyRequestCard key={request._id} request={request} onView={handleView} />
        ))}
        {!loading && !error && requests.length === 0 && (
          <p className="text-sm text-gray-500">
            {scope === "active"
              ? 'No active requests. Tap "+ Request Blood" to post one.'
              : "No completed requests yet. Fulfilled and cancelled requests will show up here."}
          </p>
        )}
      </div>

      <NewRequestFlow
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          onNewRequest?.(); // jump to the "Active" tab so the new request is visible
          refetch();
        }}
        onView={(request) => setSelectedId(request._id)}
      />

      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedId(null)}
        actions={actions}
      />
    </>
  );
}

function PatientRequests() {
  const [tab, setTab] = useState("active");
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div>
      <DashboardTopbar title="My Requests" />

      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <Tabs
          tabs={[
            { value: "active", label: "Active" },
            { value: "history", label: "History" },
          ]}
          value={tab}
          onChange={setTab}
        />
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
        >
          + Request Blood
        </button>
      </div>

      <PatientRequestList
        scope={tab}
        showCreate={showCreate}
        setShowCreate={setShowCreate}
        onNewRequest={() => setTab("active")}
      />
    </div>
  );
}

/* ------------------------------ route ------------------------------ */

export default function Requests() {
  const role = useAuthStore((state) => state.user?.role);
  return role === "patient" ? <PatientRequests /> : <DonorRequests />;
}
