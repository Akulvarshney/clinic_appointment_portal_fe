
import { apiGet, } from "../utils/axiosCalls";

const orgId = localStorage.getItem("selectedOrgId");
const token = localStorage.getItem("token");
const basic_config = {
  headers: { Authorization: `Bearer ${token}` },
};
export const fetchServices = async () => {
  try {
    const response = await apiGet(
      `/clientAdmin/serviceManagement/getActiveServices?orgId=${orgId}`,
      basic_config
    );

    const services = response.data || [];
    //console.log("services ", services);
    const formattedServices = services.map((service) => ({
      id: service.id,
      name: service.name,
      tax: service.tax_percentage,
      price: service.price,
      dot: service.color || "#789",
    }));
    //console.log("formatted services>> ", formatted )
    return formattedServices;
  } catch (err) {
    console.error(err);
  }
};
