import { Tabs, Spin } from "antd";
import DataTable from "../../components/DataTable";
import { useEffect, useState } from "react";
import {
  handleActionOnApplication,
  organizationlisting,
} from "../../services/organisationListingService";
import { Dropdown, Menu, Button, message } from "antd";
import { DownOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

const OrganisationListing = () => {
  const [status, setStatus] = useState("PENDING");
  const [listing, setListing] = useState([]);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const data = await organizationlisting(status);
      setListing(data);
    } catch (err) {
      console.error("Error fetching organizations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [status]);

  const columns = [
    {
      title: "ID",
      dataIndex: "trackingid",
      key: "id",
      render: (text) => <span style={{ fontWeight: "bold" }}>{text}</span>,
    },
    {
      title: "Organization Name",
      dataIndex: "organization_name",
      key: "organization_name",
    },
    {
      title: "Short Name",
      dataIndex: "org_short_name",
      key: "org_short_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Status",
      dataIndex: "application_status",
      key: "application_status",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const handleMenuClick = async (e) => {
          const action = e.key;
          try {
            console.log(`Updating status for ${record.id} to ${action}`);
            setLoading(true);
            await handleActionOnApplication(record.id, action, remark);
            message.success(
              `${record.organization_name} ${action.toLowerCase()} successfully`
            );
            setLoading(false);
            fetchOrganizations();
          } catch (error) {
            setLoading(false);
            message.error("Failed to update status");
          }
        };

        const menu = (
          <Menu onClick={handleMenuClick}>
            <Menu.Item key="APPROVED">Accept</Menu.Item>
            <Menu.Item key="REJECTED">Reject</Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu}>
            <Button>
              Action <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <div className="pageCss min-w-0 max-w-full">
        <Tabs
          defaultActiveKey="PENDING"
          onChange={setStatus}
          className="min-w-0 [&_.ant-tabs-nav-wrap]:overflow-x-auto [&_.ant-tabs-nav-wrap]:pb-1 [&_.ant-tabs-nav-list]:flex-nowrap"
        >
          <TabPane tab="PENDING" key="PENDING" />
          <TabPane tab="APPROVED" key="APPROVED" />
          <TabPane tab="REJECTED" key="REJECTED" />
        </Tabs>

        {loading ? (
          <div className="mt-5 text-center">
            <Spin tip="Loading organization data..." />
          </div>
        ) : (
          <div className="mt-4 min-w-0 overflow-hidden rounded-lg bg-white shadow sm:mt-5">
            <DataTable
              columns={columns}
              dataSource={listing}
              rowKey="id"
              scroll={{ x: 1100 }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default OrganisationListing;
