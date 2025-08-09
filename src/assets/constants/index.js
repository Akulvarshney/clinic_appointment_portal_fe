export const BACKEND_URL = "http://localhost:8080/api/v1";

const data = localStorage.getItem("organizations");
const data1 = data ? JSON.parse(data) : null;
console.log("data", data);

export const isFeatureValid = (data, tabUniqueName, featureUniqueName) => {
  if (!data || !tabUniqueName || !featureUniqueName) {
    console.log("Missing data or identifiers");
    return false;
  }

  for (const org of data) {
    for (const role of org.roles || []) {
      console.log("Checking role:", role.role_name);
      for (const tab of role.tabs || []) {
        console.log("Checking tab:", tab.tab_unique_name);
        if (tab.tab_unique_name === tabUniqueName && tab.is_valid) {
          console.log("✅ Tab matched and is valid");

          if (!tab.features || tab.features.length === 0) {
            console.log("❌ Tab has no features");
            return false;
          }

          const feature = tab.features.find(
            (f) => f.feature_unique_name === featureUniqueName
          );

          if (!feature) {
            console.log("❌ Feature not found");
            return false;
          }

          console.log("✅ Feature found, is_valid:", feature.is_valid);
          return feature.is_valid === true;
        }
      }
    }
  }

  console.log("❌ Tab not found or not valid");
  return false;
};
