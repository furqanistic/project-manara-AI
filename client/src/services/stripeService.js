import axiosInstance from "../config/config";

export const stripeService = {
  createCheckoutSession: async (priceId) => {
    const response = await axiosInstance.post("/stripe/create-checkout-session", { priceId });
    return response.data;
  },

  createPortalSession: async () => {
    const response = await axiosInstance.post("/stripe/create-portal-session");
    return response.data;
  },
};
