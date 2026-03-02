import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getCreditLedger, getCreditsBalance } from "@/lib/credits";

export const useCredits = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [creditLedger, setCreditLedger] = useState(() => getCreditLedger());
  const [creditBalance, setCreditBalance] = useState(() => getCreditsBalance());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nextOwner = currentUser?._id || currentUser?.id || "";
    const existingOwner = localStorage.getItem("manara_credits_owner") || "";

    if (nextOwner && nextOwner !== existingOwner) {
      localStorage.setItem("manara_credits_owner", nextOwner);
      window.dispatchEvent(new Event("manara:credits-updated"));
      return;
    }

    if (!nextOwner && existingOwner) {
      localStorage.removeItem("manara_credits_owner");
      window.dispatchEvent(new Event("manara:credits-updated"));
    }
  }, [currentUser?._id, currentUser?.id]);

  useEffect(() => {
    const refreshCredits = () => {
      setCreditLedger(getCreditLedger());
      setCreditBalance(getCreditsBalance());
    };

    refreshCredits();
    const handleStorage = (event) => {
      if (
        event.key === "manara_credits_owner" ||
        event.key?.startsWith("manara_credits_balance") ||
        event.key?.startsWith("manara_credits_ledger")
      ) {
        refreshCredits();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("manara:credits-updated", refreshCredits);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("manara:credits-updated", refreshCredits);
    };
  }, []);

  return {
    creditBalance,
    creditLedger,
    refreshCredits: () => {
      setCreditLedger(getCreditLedger());
      setCreditBalance(getCreditsBalance());
    },
  };
};
