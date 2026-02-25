import { useEffect, useState } from "react";
import { getCreditLedger, getCreditsBalance } from "@/lib/credits";

export const useCredits = () => {
  const [creditLedger, setCreditLedger] = useState(() => getCreditLedger());
  const [creditBalance, setCreditBalance] = useState(() => getCreditsBalance());

  useEffect(() => {
    const refreshCredits = () => {
      setCreditLedger(getCreditLedger());
      setCreditBalance(getCreditsBalance());
    };

    refreshCredits();
    const handleStorage = (event) => {
      if (event.key === "manara_credits_balance" || event.key === "manara_credits_ledger") {
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

