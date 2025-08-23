import { BACKEND_URL } from "../assets/constants";

export const fetchCategories = async (setLoading) => {
  try {
    setLoading(true);
    const res = await axios.get(
      `${BACKEND_URL}/clientadmin/userMgmt/category?organization_id=${localStorage.getItem(
        "selectedOrgId"
      )}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (res.status !== 200) {
      throw new Error("Failed to fetch categories");
    }
    console.log("Categories fetched:", res.data.categories);
    return res.data.categories;
  } catch (err) {
    message.error("Failed to fetch categories");
    console.error(err);
    throw new Error("Error fetching categories");
  } finally {
    setLoading(false);
  }
};
