import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Button,
  Select,
  Form,
  InputNumber,
  Row,
  Col,
  message,
} from "antd";
import debounce from "lodash/debounce";
import toast from "react-hot-toast";
import { fetchServices } from "../services/OrgServices.js";
import { fetchClients } from "../services/clientServices.js";
import { saveReceipt } from "../services/invoicesServices.js";

const { Option } = Select;

export default function ReceiptModal({
  visible,
  onCancel,
  orgName,
  selectedOrg,
  onSaved,
}) {
  const [form] = Form.useForm();
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [saving, setSaving] = useState(false);

  const debouncedFetchClients = useMemo(() => debounce(fetchClients, 300), []);

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
    setSelectedServices([]);
    setSelectedClient(null);
    setTotalAmount(0);

    const loadData = async () => {
      try {
        const [servicesData, clientsData] = await Promise.all([
          fetchServices(),
          fetchClients(),
        ]);
        setServices(servicesData || []);
        setClients(clientsData || []);
      } catch (error) {
        console.error("Error loading clients or services:", error);
      }
    };
    loadData();
  }, [visible]);

  const handleClientSearch = async (value) => {
    try {
      const results = await debouncedFetchClients(value);
      setClients(results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addService = () =>
    setSelectedServices([...selectedServices, { id: null, qty: 1 }]);

  const updateService = (index, field, value) => {
    const updated = [...selectedServices];
    updated[index][field] = value;
    setSelectedServices(updated);
  };

  useEffect(() => {
    const total = selectedServices.reduce((sum, s) => {
      const srv = services.find((srv) => srv.id === s.id);
      const price = srv ? parseFloat(srv.price) || 0 : 0;
      return sum + price * (s.qty || 0);
    }, 0);
    setTotalAmount(total);
  }, [selectedServices, services]);

  const getServiceAmount = (s) => {
    const srv = services.find((srv) => srv.id === s.id);
    return srv ? (srv.price || 0) * (s.qty || 0) : 0;
  };

  const handleSubmit = async () => {
    form.validateFields().then(async () => {
      if (!selectedClient) {
        message.error("Please select a client.");
        return;
      }
      try {
        setSaving(true);
        const response = await saveReceipt({
          clientId: selectedClient.id,
          total: totalAmount,
          services: selectedServices.map((s) => ({
            id: s.id,
            name: services.find((srv) => srv.id === s.id)?.name || "",
            qty: s.qty,
          })),
        });
        toast.success("Receipt Generated Successfully");
        //message.success("Receipt saved successfully!");
        onSaved(response.data);
        form.resetFields();
        onCancel(); // ✅ closes modal
      } catch (err) {
        console.error(err);
        message.error("Failed to save receipt.");
      } finally {
        setSaving(false);
      }
    });
  };

  return (
    <Modal
      title="Generate Receipt"
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel{" "}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={saving}
        >
          Generate Receipt{" "}
        </Button>,
      ]}
    >
      {" "}
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Client"
          name="client"
          rules={[{ required: true, message: "Please select a client" }]}
        >
          <Select
            showSearch
            placeholder="Select Client"
            onSearch={handleClientSearch}
            onChange={(val) =>
              setSelectedClient(clients.find((c) => c.id === val))
            }
            filterOption={false}
            allowClear
          >
            {clients.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.first_name} {c.last_name} || {c.phone}{" "}
              </Option>
            ))}{" "}
          </Select>
        </Form.Item>
        {selectedServices.map((s, index) => (
          <Row gutter={8} key={index} style={{ marginBottom: 8 }}>
            <Col span={10}>
              <Select
                placeholder="Select Service"
                style={{ width: "100%" }}
                value={s.id || undefined}
                onChange={(val) => updateService(index, "id", val)}
                optionLabelProp="label"
              >
                {services.map((srv) => (
                  <Option key={srv.id} value={srv.id} label={srv.name}>
                    {srv.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                value={s.qty || 1}
                onChange={(val) => updateService(index, "qty", val)}
              />
            </Col>
            <Col span={8} style={{ textAlign: "right", paddingTop: 4 }}>
              ₹{getServiceAmount(s).toLocaleString()}
            </Col>
          </Row>
        ))}
        <Button
          type="dashed"
          onClick={addService}
          style={{ width: "100%", marginBottom: 16 }}
        >
          + Add Service
        </Button>
        <Form.Item label="Total Amount">
          <InputNumber
            style={{ width: "100%" }}
            value={totalAmount}
            onChange={(val) => setTotalAmount(val)}
            min={0}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
