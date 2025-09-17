import { useState, useEffect } from "react";
import { Modal, Button, Input, Form, Select } from "antd";

import { fetchServices } from "../services/OrgServices.js";
import { fetchClients } from "../services/clientServices.js";

export default function GenerateInvoiceModal({
  visible,
  type = "",
  onClose,
  onSuccess,
}) {
  const orgId = localStorage.getItem("selectedOrgId");

  const [selectedClient, setSelectedClient] = useState(null);
  const [billTo, setBillTo] = useState("");
  const [items, setItems] = useState([
    { serviceId: "", serviceName: "", qty: "1", amount: "", gst: "" },
  ]);
  const [preview, setPreview] = useState(false);

  // Discount values
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [grandTotal, setGrandTotal] = useState("");
  const [error, setError] = useState("");

  const [clientOptions, setClientOptions] = useState([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientSearchValue, setClientSearchValue] = useState("");

  const [services, setServices] = useState([]);

  useEffect(() => {
    if (!visible) {
      setSelectedClient(null);
      setBillTo("");
      setItems([{ description: "", qty: "1", amount: "", gst: "" }]);
      setPreview(false);
      setDiscountPercent("");
      setDiscountAmount("");
      setGrandTotal("");
      setError("");
    }
  }, [visible]);

  useEffect(() => {
    const loadClients = async () => {
      if (!orgId) return;
      setClientLoading(true);
      try {
        const data = await fetchClients(clientSearchValue, 1, 10, orgId);
        setClientOptions(data || []);
      } catch (err) {
        console.error("Failed to load clients:", err);
      } finally {
        setClientLoading(false);
      }
    };

    loadClients();
  }, [orgId, clientSearchValue]);

  useEffect(() => {
    const loadServices = async () => {
      if (!orgId) return;
      setClientLoading(true);
      try {
        const data = await fetchServices();
        console.log("data>> ", data);
        setServices(data || []);
      } catch (err) {
        console.error("Failed to load clients:", err);
      } finally {
        setClientLoading(false);
      }
    };
    loadServices();
  }, [orgId]);

  // Auto-fill Bill To when selecting client
  const handleClientChange = (id) => {
    const client = clientOptions.find((c) => c.id === id);
    setSelectedClient(client);
    if (client)
      setBillTo(`${client.first_name || ""} ${client.last_name || ""}`.trim());
  };

  // Compute total for a single item
  const computeItemFinal = (item) => {
    const gross = (parseFloat(item.amount) || 0) * (parseFloat(item.qty) || 0);
    const gstAmt = gross * ((parseFloat(item.gst) || 0) / 100);
    return Number(gross + gstAmt) || 0;
  };

  // Compute subtotal
  const computeSubtotal = (items) =>
    items.reduce((sum, item) => sum + computeItemFinal(item), 0);

  const subtotal = computeSubtotal(items);

  // Handle changes to item fields
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);

    recalcTotals(subtotal, discountPercent, discountAmount);
  };

  const addItem = () =>
    setItems([...items, { description: "", qty: "1", amount: "", gst: "" }]);

  // Recalculate totals whenever discount changes
  const recalcTotals = (subtotal, percent, amount) => {
    let finalDiscountPercent = parseFloat(percent) || 0;
    let finalDiscountAmount = parseFloat(amount) || 0;

    // Keep both in sync
    if (amount !== "" && percent === "") {
      finalDiscountPercent = subtotal
        ? (finalDiscountAmount / subtotal) * 100
        : 0;
      setDiscountPercent(finalDiscountPercent.toFixed(2));
    } else if (percent !== "" && amount === "") {
      finalDiscountAmount = (subtotal * finalDiscountPercent) / 100;
      setDiscountAmount(finalDiscountAmount.toFixed(2));
    }

    // Ensure discount not more than subtotal
    if (finalDiscountAmount > subtotal) {
      finalDiscountAmount = subtotal;
      finalDiscountPercent = 100;
      setDiscountAmount(finalDiscountAmount.toFixed(2));
      setDiscountPercent(finalDiscountPercent.toFixed(2));
    }

    const newGrand = subtotal - finalDiscountAmount;
    setGrandTotal(newGrand.toFixed(2));
  };

  // Handle discount percent edit
  const handleDiscountPercentChange = (value) => {
    setDiscountPercent(value);
    recalcTotals(subtotal, value, "");
  };

  // Handle discount amount edit
  const handleDiscountAmountChange = (value) => {
    setDiscountAmount(value);
    recalcTotals(subtotal, "", value);
  };

  // Handle grand total edit
  const handleGrandTotalChange = (value) => {
    let val = parseFloat(value) || 0;
    if (val > subtotal) val = subtotal;

    setGrandTotal(val.toFixed(2));

    const discountAmt = subtotal - val;
    setDiscountAmount(discountAmt.toFixed(2));

    const discountPct = subtotal ? (discountAmt / subtotal) * 100 : 0;
    setDiscountPercent(discountPct.toFixed(2));
  };

  const validate = () => {
    if (!selectedClient) {
      setError("Please select a client.");
      return false;
    }
    if (!billTo) {
      setError("Please enter the Bill to Name");
      return false;
    }
    console.log("items.length", items);
    if (items.length === 0) {
      setError("Please add at least one item.");
      return false;
    }

    if (!(parseFloat(grandTotal) > 0)) {
      setError("Grand Total must be > 0.");
      return false;
    }
    setError("");
    return true;
  };

  const handleGenerate = async () => {
    if (!validate()) return;

    const payload = {
      client: selectedClient,
      billTo,
      items,
      discountPercent,
      discountAmount,
      grandTotal,
      type,
    };

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create entry");
      const result = await response.json();
      setPreview(true);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err.message || "Error generating entry");
    }
  };

  const modalTitle = preview
    ? `${type ? type.charAt(0).toUpperCase() + type.slice(1) : ""} Preview`
    : `Create ${type ? type.charAt(0).toUpperCase() + type.slice(1) : ""}`;

  const submitButtonText =
    type === "invoice"
      ? "Generate Invoice"
      : type === "quotation"
      ? "Generate Quotation"
      : "Submit";

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 25 }}
    >
      {preview ? (
        <>
          <Form layout="vertical">
            <Form.Item label="Bill To">
              <p>{billTo || "-"}</p>
            </Form.Item>

            <Form.Item label="Items">
              <div className="grid grid-cols-5 font-semibold gap-2">
                <span>Services</span>
                <span>Qty</span>
                <span>Amount</span>
                <span>GST %</span>
                <span>Final</span>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-5 gap-2">
                  <span>{item.description || "-"}</span>
                  <span>{item.qty}</span>
                  <span>{item.amount || 0}</span>
                  <span>{item.gst || 0}%</span>
                  <span>{computeItemFinal(item).toFixed(2)}</span>
                </div>
              ))}
            </Form.Item>

            <Form.Item rules={[{ required: false }]}>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex justify-between w-64">
                  <span>Discount %:</span>
                  <span>{discountPercent || 0}%</span>
                </div>
                <div className="flex justify-between w-64">
                  <span>Discount Amount:</span>
                  <span>{discountAmount || 0}</span>
                </div>
                <div className="flex justify-between w-64 font-bold">
                  <span>Grand Total:</span>
                  <span>{grandTotal}</span>
                </div>
              </div>
            </Form.Item>
          </Form>

          <Button type="primary" onClick={() => setPreview(false)}>
            Back to Edit
          </Button>
        </>
      ) : (
        <Form layout="vertical">
          <Form.Item label="Client" rules={[{ required: true }]}>
            <Select
              value={selectedClient?.id || ""}
              onChange={(val) => handleClientChange(val)}
              placeholder="Select Client"
            >
              {clientOptions.map((c) => (
                <Select.Option key={c.first_name} value={c.id}>
                  {c.first_name} ({c.client_organization_category[0].portal_id}{" "}
                  )
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Bill To">
            <Input.TextArea
              value={billTo}
              onChange={(e) => setBillTo(e.target.value)}
            />
          </Form.Item>

          <Form.Item label="Items" rules={[{ required: true }]}>
            <div className="grid grid-cols-5 gap-2 items-center font-semibold">
              <span>Services</span>
              <span>Qty</span>
              <span>Amount</span>
              <span>GST %</span>
              <span>Final</span>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 mt-2">
                {/* Service Dropdown */}
                <Select
                  placeholder="Select Service"
                  value={item.serviceId || undefined}
                  onChange={(serviceId) => {
                    const service = services.find((s) => s.id === serviceId);
                    if (service) {
                      handleItemChange(i, "serviceId", service.id);
                      handleItemChange(i, "serviceName", service.name);
                      handleItemChange(i, "amount", service.price);
                      handleItemChange(i, "gst", service.tax);
                    }
                  }}
                >
                  {services.map((s) => (
                    <Select.Option key={s.id} value={s.id}>
                      {s.name}
                    </Select.Option>
                  ))}
                </Select>

                {/* Qty */}
                <Input
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => handleItemChange(i, "qty", e.target.value)}
                />

                {/* Amount (auto-filled) */}
                <Input
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) =>
                    handleItemChange(i, "amount", e.target.value)
                  }
                />

                {/* GST (auto-filled) */}
                <Input
                  placeholder="GST %"
                  value={item.gst}
                  onChange={(e) => handleItemChange(i, "gst", e.target.value)}
                />

                {/* Final (calculated) */}
                <Input value={computeItemFinal(item).toFixed(2)} readOnly />
              </div>
            ))}

            <Button type="dashed" onClick={addItem} className="mt-2">
              + Add Item
            </Button>
          </Form.Item>

          <Form.Item label="Discount %">
            <Input
              value={discountPercent}
              onChange={(e) => handleDiscountPercentChange(e.target.value)}
            />
          </Form.Item>

          <Form.Item label="Discount Amount">
            <Input
              value={discountAmount}
              onChange={(e) => handleDiscountAmountChange(e.target.value)}
            />
          </Form.Item>

          <Form.Item label="Grand Total">
            <Input
              value={grandTotal || subtotal.toFixed(2)}
              onChange={(e) => handleGrandTotalChange(e.target.value)}
            />
          </Form.Item>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="primary" className="mt-4" onClick={handleGenerate}>
            {submitButtonText}
          </Button>
        </Form>
      )}
    </Modal>
  );
}
