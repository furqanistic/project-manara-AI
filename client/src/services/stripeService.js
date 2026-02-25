import axiosInstance from "../config/config";

export const stripeService = {
  createCheckoutSession: async ({ planId, priceId, purchaseType }) => {
    const response = await axiosInstance.post("/stripe/create-checkout-session", {
      planId,
      priceId,
      purchaseType,
    });
    return response.data;
  },

  createSetupSession: async () => {
    const response = await axiosInstance.post("/stripe/create-setup-session");
    return response.data;
  },

  createPortalSession: async () => {
    const response = await axiosInstance.post("/stripe/create-portal-session");
    return response.data;
  },

  getPaymentMethods: async () => {
    const response = await axiosInstance.get("/stripe/payment-methods");
    return response.data;
  },

  setDefaultPaymentMethod: async (paymentMethodId) => {
    const response = await axiosInstance.patch(`/stripe/payment-methods/${paymentMethodId}/default`);
    return response.data;
  },

  deletePaymentMethod: async (paymentMethodId) => {
    const response = await axiosInstance.delete(`/stripe/payment-methods/${paymentMethodId}`);
    return response.data;
  },

  getBillingStatus: async () => {
    const response = await axiosInstance.get("/stripe/billing-status");
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await axiosInstance.post("/stripe/subscription/cancel");
    return response.data;
  },

  cancelScheduledPlanChange: async () => {
    const response = await axiosInstance.post("/stripe/subscription/cancel-scheduled-change");
    return response.data;
  },

  resumeSubscription: async () => {
    const response = await axiosInstance.post("/stripe/subscription/resume");
    return response.data;
  },

  changeSubscriptionPlan: async ({ planId, priceId, renewNow }) => {
    const response = await axiosInstance.post("/stripe/subscription/change-plan", {
      planId,
      priceId,
      renewNow,
    });
    return response.data;
  },

  syncCheckoutSession: async (sessionId) => {
    const response = await axiosInstance.post("/stripe/sync-checkout-session", { sessionId });
    return response.data;
  },
};
