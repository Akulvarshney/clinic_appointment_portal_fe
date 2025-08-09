import React, { useEffect, useState } from "react";
import Sidebar from "../components/SideBar";
import { Box, CircularProgress } from "@mui/material";
import { BACKEND_URL, isFeatureValid } from "../assets/constants";
import axios from "axios";

const ClientInfoTable = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const orgId = localStorage.getItem("selectedOrgId");
  const token = localStorage.getItem("token");
  const limit = 15; // items per page

  const [isMobileView, setisMobileView] = useState(false);

  useEffect(() => {
    const response1 = isFeatureValid("CLIENT_LISTING", "VIEW_MOBILE");

    setisMobileView(response1);

    console.log("isFeatureValid response:", response1);
  }, []);

  console.log("asdasd", isMobileView);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BACKEND_URL}/patient/clients/clientListing`,
        {
          params: { search, page, limit, orgId },

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res);
      setClients(res.data.data || []);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, page]);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(to right, #e6f0ff, #f8fbff)",
      }}
    >
      <div className="flex-1 p-10 bg-transparent">
        {/* Heading */}
        <div className="mb-8 border-b-2 border-blue-200 pb-4 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-blue-900">Clients</h1>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, mobile..."
            value={search}
            onChange={(e) => {
              setPage(1); // reset to first page on search
              setSearch(e.target.value);
            }}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-blue-100">
          {loading ? (
            <div className="flex justify-center py-10">
              <CircularProgress />
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-blue-100 text-blue-900 font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b">Name</th>
                  {isMobileView ? (
                    <th className="px-6 py-4 border-b">Mobile</th>
                  ) : null}
                  <th className="px-6 py-4 border-b">Address</th>
                  <th className="px-6 py-4 border-b">DOB</th>
                  <th className="px-6 py-4 border-b">Gender</th>
                  <th className="px-6 py-4 border-b">Occupation</th>
                </tr>
              </thead>
              <tbody>
                {(clients?.length ?? 0) === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-6 text-center text-gray-400"
                    >
                      No matching clients found.
                    </td>
                  </tr>
                ) : (
                  clients.map((client, idx) => (
                    <tr
                      key={idx}
                      className="border-b hover:bg-blue-50 transition duration-150"
                    >
                      <td className="px-6 py-4">{client.first_name}</td>
                      {isMobileView ? (
                        <td className="px-6 py-4">{client.phone}</td>
                      ) : null}

                      <td className="px-6 py-4">{client.address}</td>
                      <td className="px-6 py-4">
                        {client.date_of_birth
                          ? new Date(client.date_of_birth).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }
                            )
                          : null}
                      </td>
                      <td className="px-6 py-4">{client.gender}</td>
                      <td className="px-6 py-4">{client.occupation}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex justify-center items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-4 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-blue-700 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="px-4 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Box>
  );
};

export default ClientInfoTable;
