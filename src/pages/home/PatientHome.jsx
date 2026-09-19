import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardTopbar from "../../components/DashboardTopbar.jsx";
import { PageLoader, Spinner } from "../../components/Spinner.jsx";
import MyRequestCard from "../../components/requests/MyRequestCard.jsx";
import NewRequestFlow from "../../components/requests/NewRequestFlow.jsx";
import MatchingDonorsModal from "../../components/requests/MatchingDonorsModal.jsx";
import RequestDetailModal from "../../components/RequestDetailModal.jsx";
import { useMyRequests, useMatchingDonors } from "../../hooks/useRequests.js";
import useRequestActions from "../../hooks/useRequestActions.js";

// Dashboard for users who signed up via "Need Blood"
export default function PatientHome() {
  const location = useLocation();
  const navigate = useNavigate();

  const { requests, loading, error, refetch } = useMyRequests("active");
  const actions = useRequestActions(refetch);

  // Onboarding's "View Request" button sends us here with the new request's id
  const [selectedId, setSelectedId] = useState(location.state?.openRequestId ?? null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDonors, setShowDonors] = useState(false);

  // Clear the router state so a refresh doesn't re-open the modal
  useEffect(() => {
    if (location.state?.openRequestId) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedRequest = useMemo(
    () => requests.find((r) => r._id === selectedId) ?? null,
    [requests, selectedId]
  );

  // Donor matching is shown for the most urgent active request (list is sorted server-side)
  const topRequest = requests[0] ?? null;
  const { donors, count: donorCount, loading: donorsLoading } = useMatchingDonors(topRequest?._id);

  const handleView = useCallback((request) => setSelectedId(request._id), []);

  return (
    <div>
      <DashboardTopbar title="Home" />

      <div className="mb-6 grid gap-4 sm:mb-8 sm:gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Need Blood?</h2>
          <p className="mt-2 text-gray-500">
            Post a request and we'll start matching donors near you right away.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-2xl bg-brand-600 p-5 text-lg font-extrabold text-white transition-colors hover:bg-brand-700 sm:p-6"
        >
          + Request Blood
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Your Active Requests</h2>

          {loading && <PageLoader label="Loading your requests" />}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="space-y-4">
            {requests.map((request) => (
              <MyRequestCard key={request._id} request={request} onView={handleView} />
            ))}
            {!loading && !error && requests.length === 0 && (
              <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
                You have no active requests. Tap "+ Request Blood" to post one.
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Matching Donors</h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            {topRequest ? (
              <>
                <div className="mb-4 text-gray-800">
                  {donorsLoading ? (
                    <span className="flex items-center gap-2 text-gray-600">
                      <Spinner size={18} />
                      Searching for donors…
                    </span>
                  ) : (
                    `${donorCount} potential donor${donorCount === 1 ? "" : "s"} found near you`
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowDonors(true)}
                  disabled={donorsLoading || donorCount === 0}
                  className="w-full rounded-lg border border-brand-500 py-2.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-50"
                >
                  View Donors
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Post a request to see donors who can help.
              </p>
            )}
          </div>
        </section>
      </div>

      <NewRequestFlow
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={refetch}
        onView={(request) => setSelectedId(request._id)}
      />

      {showDonors && <MatchingDonorsModal donors={donors} onClose={() => setShowDonors(false)} />}

      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedId(null)}
        actions={actions}
      />
    </div>
  );
}
