import React, { useState } from "react";
import Modal from "../Modal.jsx";
import CreateRequestForm from "./CreateRequestForm.jsx";
import RequestSubmittedModal from "./RequestSubmittedModal.jsx";

// The whole "+ Request Blood" flow in one component:
//   form modal  ->  "Request Submitted" modal (with request ID)  ->  onView(request)
//
// Keep it mounted and toggle `open`:
//   <NewRequestFlow open={show} onClose={() => setShow(false)}
//                   onCreated={refetch} onView={(r) => setSelectedId(r._id)} />
export default function NewRequestFlow({ open, onClose, onCreated, onView }) {
  const [created, setCreated] = useState(null);

  if (created) {
    return (
      <RequestSubmittedModal
        request={created}
        onClose={() => setCreated(null)}
        onView={() => {
          onView?.(created);
          setCreated(null);
        }}
      />
    );
  }

  if (!open) return null;

  return (
    <Modal title="Request Blood" onClose={onClose} maxWidth="max-w-xl">
      <CreateRequestForm
        heading="Let's find the help you need."
        onCreated={(request) => {
          setCreated(request);
          onClose?.();
          onCreated?.(request);
        }}
      />
    </Modal>
  );
}
