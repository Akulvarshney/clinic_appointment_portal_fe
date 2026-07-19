import React from "react";
import { Box } from "@mui/material";
import { PALETTE } from "../theme/palette";

/**
 * Shown when the selected org is expired and the user does not have
 * access to the Subscription tab/feature.
 */
const SubscriptionExpiredPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: PALETTE.surface,
      }}
    >
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-gw-ink-3">
          Access restricted
        </p>
        <h1 className="mt-2 mb-3 text-2xl font-bold text-gw-primary-dark sm:text-3xl">
          Subscription expired
        </h1>
        <p className="m-0 text-sm leading-relaxed text-gw-ink-2 sm:text-base">
          This organization&apos;s subscription has expired. Please contact your
          admin to renew and restore access.
        </p>
      </div>
    </Box>
  );
};

export default SubscriptionExpiredPage;
