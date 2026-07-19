// Must match tabs.tab_path in DB / TabsAndFeatureStatic.js ("/subscription").
export const SUBSCRIPTION_PATH = "/subscription";
export const SUBSCRIPTION_EXPIRED_PATH = "/subscription-expired";

export const getSelectedOrgId = () =>
  localStorage.getItem("selectedOrgId") ||
  localStorage.getItem("selectedOrganizationId") ||
  null;

export const getOrganizationsFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("organizations") || "[]");
  } catch {
    return [];
  }
};

export const getOrgById = (orgId) => {
  if (!orgId) return null;
  return (
    getOrganizationsFromStorage().find((org) => org.organizationId === orgId) ||
    null
  );
};

export const isSelectedOrgExpired = (orgId = getSelectedOrgId()) => {
  const org = getOrgById(orgId);
  return Boolean(org?.isOrgExpired);
};

const resolveRoleName = (userRole) => {
  if (userRole == null) return null;
  if (typeof userRole === "object") {
    return (
      userRole.role_name ||
      userRole.roleName ||
      userRole.name ||
      userRole.role ||
      null
    );
  }
  return String(userRole);
};

/**
 * Builds the same style of allowed URL array as App.js getUserAllowedRoutes
 * (valid tabs → tab_path for the logged-in role). Kept here so expiry checks
 * do not change the existing App route logic.
 */
export const getRoleAllowedRoutes = (selectedOrgId, userRole) => {
  try {
    const org = getOrgById(selectedOrgId);
    if (!org?.roles?.length) return [];

    const roleName = resolveRoleName(userRole);
    const userRoleData =
      (roleName && org.roles.find((role) => role.role_name === roleName)) ||
      org.roles[0];

    if (!userRoleData) return [];

    return (userRoleData.tabs || [])
      .filter((tab) => tab.is_valid && tab.tab_path)
      .map((tab) => tab.tab_path);
  } catch {
    return [];
  }
};

/**
 * When org is expired:
 * - /Subscription if it is in the role's allowed URL array
 * - otherwise the contact-admin expired page
 */
export const getExpiredRedirectPath = (
  orgId = getSelectedOrgId(),
  userRole = null
) => {
  const org = getOrgById(orgId);
  if (!org?.isOrgExpired) return null;

  const role = userRole || org.roles?.[0] || null;
  const allowedRoutes = getRoleAllowedRoutes(orgId, role);

  return allowedRoutes.includes(SUBSCRIPTION_PATH)
    ? SUBSCRIPTION_PATH
    : SUBSCRIPTION_EXPIRED_PATH;
};

/**
 * Returns true if navigation to `targetPath` is allowed for the selected org.
 * Non-expired orgs: always allowed (normal role gating still applies in App.js).
 */
export const canNavigateWhenOrgExpired = (
  targetPath,
  orgId = getSelectedOrgId(),
  userRole = null
) => {
  const org = getOrgById(orgId);
  if (!org?.isOrgExpired) return true;

  const redirectPath = getExpiredRedirectPath(orgId, userRole);
  if (!redirectPath) return true;

  if (targetPath === redirectPath) return true;
  if (
    redirectPath !== "/" &&
    typeof targetPath === "string" &&
    targetPath.startsWith(`${redirectPath}/`)
  ) {
    return true;
  }

  if (targetPath === SUBSCRIPTION_EXPIRED_PATH) return true;

  return false;
};
