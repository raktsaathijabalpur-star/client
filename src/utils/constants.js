export const TOKEN_KEY = "Blood Seva_token";
export const USER_KEY = "Blood Seva_user";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const ROLES = {
  DONOR: "donor",
  PATIENT: "patient",
};

export const URGENCY_LEVELS = ["Normal", "Urgent", "Emergency"];

// Used on request cards / modals
export const URGENCY_STYLES = {
  Emergency: {
    border: "border-l-red-600",
    text: "text-red-600",
    dot: "bg-red-500",
    chip: "bg-red-50 text-red-600",
  },
  Urgent: {
    border: "border-l-amber-500",
    text: "text-amber-500",
    dot: "bg-orange-500",
    chip: "bg-orange-50 text-orange-600",
  },
  Normal: {
    border: "border-l-green-600",
    text: "text-green-600",
    dot: "bg-green-500",
    chip: "bg-green-50 text-green-700",
  },
};

// Used on the "Let's find the help you need" urgency chooser
export const URGENCY_OPTION_STYLES = {
  Normal: { dot: "bg-green-500", selected: "border-green-500 bg-green-50 text-green-700" },
  Urgent: { dot: "bg-orange-500", selected: "border-orange-500 bg-orange-50 text-orange-700" },
  Emergency: { dot: "bg-red-500", selected: "border-red-500 bg-red-50 text-red-600" },
};

// Status bar shown on request cards and in the detail modal
export const REQUEST_STATUS_STYLES = {
  Open: "bg-red-50 text-red-600",
  Accepted: "bg-amber-50 text-amber-700",
  Fulfilled: "bg-green-50 text-green-700",
  Cancelled: "bg-gray-100 text-gray-500",
};
