export const BACKEND_URL = "http://localhost:8080/api/v1";
// export const BACKEND_URL =
// "https://clinic-appointment-portal-be.onrender.com/api/v1"; // PROD
//export const BACKEND_URL ="https://clinic-appointment-portal-be.onrender.com/api/v1"; // PROD

const data1 = localStorage.getItem("organizations");
const data = data1 ? JSON.parse(data1) : null;
console.log("data", data);

export const isFeatureValid = (tabUniqueName, featureUniqueName) => {
  if (!data || !tabUniqueName || !featureUniqueName) {
    console.log("Missing data or identifiers");
    return false;
  }

  console.log("tabUniqueName", tabUniqueName);
  console.log("featureUniqueName", featureUniqueName);

  for (const org of data) {
    for (const role of org.roles || []) {
      //console.log("Checking role:", role.role_name);
      for (const tab of role.tabs || []) {
        //console.log("Checking tab:", tab.tab_unique_name);
        if (tab.tab_unique_name === tabUniqueName && tab.is_valid) {
          //console.log("✅ Tab matched and is valid");

          if (!tab.features || tab.features.length === 0) {
            //console.log("❌ Tab has no features");
            return false;
          }

          const feature = tab.features.find(
            (f) => f.feature_unique_name === featureUniqueName,
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

export const states = [
  { label: "Andhra Pradesh", value: "ANDHRA_PRADESH" },
  { label: "Arunachal Pradesh", value: "ARUNACHAL_PRADESH" },
  { label: "Assam", value: "ASSAM" },
  { label: "Bihar", value: "BIHAR" },
  { label: "Chhattisgarh", value: "CHHATTISGARH" },
  { label: "Goa", value: "GOA" },
  { label: "Gujarat", value: "GUJARAT" },
  { label: "Haryana", value: "HARYANA" },
  { label: "Himachal Pradesh", value: "HIMACHAL_PRADESH" },
  { label: "Jharkhand", value: "JHARKHAND" },
  { label: "Karnataka", value: "KARNATAKA" },
  { label: "Kerala", value: "KERALA" },
  { label: "Madhya Pradesh", value: "MADHYA_PRADESH" },
  { label: "Maharashtra", value: "MAHARASHTRA" },
  { label: "Manipur", value: "MANIPUR" },
  { label: "Meghalaya", value: "MEGHALAYA" },
  { label: "Mizoram", value: "MIZORAM" },
  { label: "Nagaland", value: "NAGALAND" },
  { label: "Odisha", value: "ODISHA" },
  { label: "Punjab", value: "PUNJAB" },
  { label: "Rajasthan", value: "RAJASTHAN" },
  { label: "Sikkim", value: "SIKKIM" },
  { label: "Tamil Nadu", value: "TAMIL_NADU" },
  { label: "Telangana", value: "TELANGANA" },
  { label: "Tripura", value: "TRIPURA" },
  { label: "Uttar Pradesh", value: "UTTAR_PRADESH" },
  { label: "Uttarakhand", value: "UTTARAKHAND" },
  { label: "West Bengal", value: "WEST_BENGAL" },
  {
    label: "Andaman and Nicobar Islands",
    value: "ANDAMAN_AND_NICOBAR_ISLANDS",
  },
  { label: "Chandigarh", value: "CHANDIGARH" },
  {
    label: "Dadra and Nagar Haveli and Daman and Diu",
    value: "DADRA_AND_NAGAR_HAVELI_AND_DAMAN_AND_DIU",
  },
  { label: "Delhi", value: "DELHI" },
  { label: "Jammu and Kashmir", value: "JAMMU_AND_KASHMIR" },
  { label: "Ladakh", value: "LADAKH" },
  { label: "Lakshadweep", value: "LAKSHADWEEP" },
  { label: "Puducherry", value: "PUDUCHERRY" },
];
