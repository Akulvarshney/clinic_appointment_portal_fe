import React, { useState, useEffect, useRef, useMemo } from "react";
import { Modal, Button, Select, Form, InputNumber, Row, Col, Card } from "antd";
import debounce from "lodash/debounce";
import { fetchServices } from "../services/OrgServices.js";
import { fetchClients } from "../services/clientServices.js";

const { Option } = Select;

export default function ReceiptModal({ visible, onCancel, onSubmit, orgName }) {
  const [form] = Form.useForm();
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const printRef = useRef();

  const debouncedFetchClients = useMemo(() => debounce(fetchClients, 300), []);

  // Fetch clients and services when modal opens
  useEffect(() => {
    if (!visible) return;

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
    setSelectedServices([...selectedServices, { id: null, price: 0 }]);

  const updateService = (index, field, value) => {
    const updated = [...selectedServices];
    updated[index][field] = value;
    setSelectedServices(updated);
  };

  const totalPrice = selectedServices.reduce(
    (sum, s) => sum + (parseFloat(s.price) || 0),
    0
  );

  const handleSubmit = () => {
    form.validateFields().then(() => {
      onSubmit({
        client: selectedClient,
        services: selectedServices,
        total: totalPrice,
      });
    });
  };

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const newWindow = window.open("", "", "width=800,height=600");
    newWindow.document.write("<html><head><title>Receipt</title>");
    newWindow.document.write(
      "<style>body{font-family:Arial, sans-serif; padding:20px;} h2{text-align:center;} ul{list-style:decimal;margin-left:20px;} h3{text-align:right;}</style>"
    );
    newWindow.document.write("</head><body>");
    newWindow.document.write(printContents);
    newWindow.document.write("</body></html>");
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <Modal
      title="Generate Receipt"
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Generate Receipt
        </Button>,
      ]}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form layout="vertical" form={form}>
            <Form.Item
              label="Client"
              name="client"
              rules={[{ required: true }]}
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
                    {c.first_name} {c.last_name} || {c.phone}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedServices.map((s, index) => (
              <Row gutter={8} key={index} style={{ marginBottom: 8 }}>
                <Col span={14}>
                  <Select
                    placeholder="Select Service"
                    style={{ width: "100%" }}
                    value={s.id || undefined}
                    onChange={(val) => updateService(index, "id", val)}
                  >
                    {services.map((srv) => (
                      <Option key={srv.id} value={srv.id}>
                        {srv.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={8}>
                  <InputNumber
                    placeholder="Price"
                    style={{ width: "100%" }}
                    value={s.price || 0}
                    onChange={(val) => updateService(index, "price", val)}
                  />
                </Col>
              </Row>
            ))}

            <Button
              type="dashed"
              onClick={addService}
              style={{ width: "100%" }}
            >
              + Add Service
            </Button>
          </Form>
        </Col>

        <Col span={12}>
          <Card
            title="Receipt Preview"
            extra={<Button onClick={handlePrint}>Print / Download</Button>}
          >
            <div ref={printRef}>
              <h2>{orgName || "Organization Name"}</h2>
              {selectedClient && (
                <p>
                  Received from{" "}
                  <b>
                    {selectedClient.first_name} {selectedClient.last_name}
                  </b>
                </p>
              )}

              {selectedServices.length > 0 && (
                <>
                  <p>For the following services:</p>
                  <ul>
                    {selectedServices.map((s, idx) => {
                      const srv = services.find((srv) => srv.id === s.id);
                      return (
                        <li key={idx}>
                          {srv ? srv.name : ""} - ₹{s.price}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              <h3>Total: ₹{totalPrice}</h3>
            </div>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
}
