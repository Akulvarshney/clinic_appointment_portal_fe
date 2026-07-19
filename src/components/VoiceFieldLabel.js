import React from "react";

/**
 * Plain label rendered above MUI inputs instead of using MUI's built-in
 * floating `label`/`InputLabel` prop. The outlined variant's notched
 * outline does not render correctly in this app (Tailwind's base styles
 * reset the `fieldset`/`legend` elements it relies on), which makes
 * floating labels visually overlap the field value - see HomePage.js's
 * `.gwl-field-label` for the same workaround used elsewhere in the app.
 */
const VoiceFieldLabel = ({ children }) => (
  <span className="block text-[11px] font-semibold uppercase tracking-wide text-gw-ink-2 mb-1">
    {children}
  </span>
);

export default VoiceFieldLabel;
