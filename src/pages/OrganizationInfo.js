import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Input, message, Select } from "antd";
import {
  BankOutlined,
  TagsOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { states } from "../assets/constants";
import { getOrgInfo, saveOrgInfo } from "../services/clientOrganizations";
const { Option } = Select;

const OrganizationInfo = () => {
  const [organizationInfo, setOrganizationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [orgInfoComplete, setOrgInfoComplete] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  // const getIsComplete = () => {
  //   const orgs = JSON.parse(localStorage.getItem("organizations") || "[]");
  //   if (orgs.length > 0) {
  //     setOrgInfoComplete(orgs[0].is_complete);
  //   }
  // };
  useEffect(() => {
    //getIsComplete();
    //getOrgInfo();
  }, []);

  useEffect(() => {
    setLoading(true);
    async function fetchOrgInfo() {
      try {
        const data = await getOrgInfo();
        //console.log("data.id ", data.response);
        setOrgInfoComplete(data.response.id);
        setOrganizationInfo(data.response);
        //console.log("data here", organizationInfo);
        messageApi.success("Organization Details Fetched Successfully");
      } catch (error) {
        setOrganizationInfo({
          org_name: "",
          company_name: "",
          gst_number: "",
          invoice_prefix: "",
          invoice_sequence_start: "",
          address: "",
          phone: "",
          email: "",
        });

        messageApi.error(
          error?.message || "Failed to fetch organization Information"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrgInfo();
  }, []);

  const openModal = () => {
    form.setFieldsValue(organizationInfo);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleSubmit = async (values) => {
    try {
      console.log("handleSubmit sid >> ", values);
      const savedData = await saveOrgInfo(values);
      console.log("handleSubmit sid >> ", values);
      setOrganizationInfo(values);
      messageApi.success("Organization information updated successfully!");

      setOrgInfoComplete(true);
      setModalVisible(false);
    } catch (error) {
      console.log(error);
      messageApi.error("Failed to update organization info");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg">
        Loading billing information...
      </div>
    );
  }

  const Field = ({ icon, label, value }) => (
    <div className="flex flex-col space-y-1 min-w-0">
      <div className="flex items-center font-semibold text-gray-800 text-base sm:text-lg space-x-2 truncate">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-gray-900 text-base truncate">{value || "-"}</div>
    </div>
  );

  return (
    <>
      {contextHolder}
      <div className="min-h-screen flex flex-col flex-1 px-2 md:px-12 lg:px-24 py-8">
        <div
          className={`
        w-full
        bg-white
        rounded-2xl
        shadow-xl
        py-12
        px-2
        md:px-12
        lg:px-20
        mx-auto
        flex flex-col
        `}
          style={{
            minHeight: "70vh",
          }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Billing Information
          </h2>

          {!orgInfoComplete ? (
            <div className="flex flex-col items-center justify-center space-y-6 min-h-[200px] text-center">
              <p className="text-lg text-yellow-600 font-medium">
                Organization information is incomplete or missing.
              </p>
              <Button type="primary" size="large" onClick={openModal}>
                Complete Information
              </Button>
            </div>
          ) : (
            <>
              {/*--- Responsive grid ---*/}
              <div
                className="
                grid grid-cols-1 sm:grid-cols-2
                gap-x-14 gap-y-8
                w-full
                max-w-full
              "
              >
                <Field
                  icon={<BankOutlined className="text-lg text-indigo-600" />}
                  label="Organization Brand Name"
                  value={organizationInfo.org_name}
                />
                <Field
                  icon={<TagsOutlined className="text-lg text-indigo-600" />}
                  label="Company Name"
                  value={organizationInfo.company_name}
                />
                <Field
                  icon={<IdcardOutlined className="text-lg text-indigo-600" />}
                  label="Company GST Number"
                  value={organizationInfo.gst_number}
                />
                <Field
                  icon={<IdcardOutlined className="text-lg text-indigo-600" />}
                  label="Invoice Prefix"
                  value={organizationInfo.invoice_prefix}
                />
                <Field
                  icon={<IdcardOutlined className="text-lg text-indigo-600" />}
                  label="Invoice Sequence Start"
                  value={organizationInfo.invoice_sequence_start?.toString()}
                />
                <Field
                  icon={<HomeOutlined className="text-lg text-indigo-600" />}
                  label="Billing Address"
                  value={organizationInfo.address}
                />
                <Field
                  icon={<PhoneOutlined className="text-lg text-indigo-600" />}
                  label="Billing Phone"
                  value={organizationInfo.phone}
                />
                <Field
                  icon={<MailOutlined className="text-lg text-indigo-600" />}
                  label="Billing Email"
                  value={organizationInfo.email}
                />
              </div>
              <div className="flex justify-center mt-12">
                <Button type="primary" size="large" onClick={openModal}>
                  Edit Information
                </Button>
              </div>
            </>
          )}

          <Modal
            title="Complete Organization Information"
            visible={modalVisible}
            onCancel={handleCancel}
            onOk={() => {
              form
                .validateFields()
                .then((values) => {
                  handleSubmit(values);
                })
                .catch((info) => {
                  console.log("Validation Failed:", info);
                });
            }}
            okText="Save"
            bodyStyle={{ paddingTop: 0 }}
            centered
            className="rounded-xl"
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={organizationInfo}
            >
              <Form.Item
                label="Organization Brand Name"
                name="org_name"
                rules={[
                  {
                    required: true,
                    message: "Please enter the organization name",
                  },
                ]}
              >
                <Input
                  placeholder="Enter organization Brand Name"
                  size="large"
                />
              </Form.Item>
              <Form.Item
                label="Company Name"
                name="company_name"
                rules={[
                  {
                    required: true,
                    message: "Please enter the Company Name name",
                  },
                ]}
              >
                <Input placeholder="Enter Company Name " size="large" />
              </Form.Item>
              <Form.Item
                label="Company's GST Number"
                name="gst_number"
                rules={[
                  {
                    required: true,
                    message: "Please enter the Company's GST number",
                  },
                ]}
              >
                <Input placeholder="Enter GST number" size="large" />
              </Form.Item>
              <Form.Item
                label="Invoice Prefix"
                name="invoice_prefix"
                rules={[
                  {
                    required: true,
                    message: "Please enter the invoice prefix",
                  },
                ]}
              >
                <Input
                  maxLength={10}
                  placeholder="Enter invoice prefix"
                  size="large"
                />
              </Form.Item>
              <Form.Item
                label="Invoice Sequence Start"
                name="invoice_sequence_start"
                rules={[
                  {
                    required: true,
                    message: "Please enter the invoice sequence start",
                  },
                ]}
              >
                <Input
                  type="number"
                  min={1}
                  placeholder="Enter start value"
                  size="large"
                />
              </Form.Item>
              <Form.Item
                label="Billing Address"
                name="address"
                rules={[
                  {
                    required: true,
                    message: "Please enter the Address",
                  },
                ]}
              >
                <Input.TextArea rows={3} placeholder="Address" size="large" />
              </Form.Item>
              <Form.Item
                label="Billing Mobile"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Please enter the Phone Number",
                  },
                ]}
              >
                <Input
                  maxLength={20}
                  placeholder="Please Enter Phone Number"
                  size="large"
                />
              </Form.Item>
              <Form.Item
                label="Billing Email"
                name="email"
                rules={[{ required: true, message: "Please enter the Email" }]}
              >
                <Input
                  maxLength={100}
                  placeholder="Email address"
                  size="large"
                />
              </Form.Item>
              <Form.Item
                label="State"
                name="state"
                rules={[{ required: true, message: "Please select State." }]}
              >
                <Select
                  placeholder="Select state"
                  showSearch
                  //defaultValue={defaultState}
                >
                  {states?.map((s) => {
                    return (
                      <Option key={s.value} value={s.value}>
                        {s.label}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default OrganizationInfo;
