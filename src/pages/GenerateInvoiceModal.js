import { useState, useEffect, useMemo, useRef } from "react";
import { Modal, Button, Input, Form, Select, message } from "antd";

import { fetchServices } from "../services/OrgServices.js";
import { fetchClients } from "../services/clientServices.js";
import debounce from "lodash/debounce";

export default function GenerateInvoiceModal({
  visible,
  type = "",
  onClose,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [billTo, setBillTo] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [clientSearchValue, setClientSearchValue] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [manualGrandTotal, setManualGrandTotal] = useState(0);

  const orgState = "HARYANA";

  const debouncedFetchClients = useMemo(() => debounce(fetchClients, 300), []);
  const handleClientSearch = async (value) => {
    setClientSearchValue(value);

    try {
      const results = await debouncedFetchClients(value);
      setClients(results || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setBillTo(null);
      setInvoiceItems([]);
      setDiscountPercent(0);
    }
  }, [visible, form]);

  useEffect(() => {
    const loadData = async () => {
      const servicesData = await fetchServices();
      const clientsData = await fetchClients();
      setServices(servicesData || []);
      setClients(clientsData || []);
    };
    loadData();
  }, []);

  const handleClientChange = (value) => {
    const client = clients.find((c) => c.id === value);
    if (client) setBillTo(client);
  };

  const handleServiceChange = (index, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    setInvoiceItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              serviceId,
              amount: Number(service.price) || 0,
              gst: Number(service.tax) || 0,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setInvoiceItems((prev) => [
      ...prev,
      { serviceId: undefined, qty: 1, amount: 0, gst: 0 },
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index][field] = Number(value) || 0;
    setInvoiceItems(updatedItems);
  };

  const taxablePerRow = (item) => item.qty * item.amount;

  const gstSplitPerRow = (item) => {
    const taxable = taxablePerRow(item);
    const gstRate = item.gst || 0;
    let cgst = 0,
      sgst = 0,
      igst = 0;

    if (billTo?.state && orgState) {
      if (billTo.state.toUpperCase() === orgState.toUpperCase()) {
        cgst = (taxable * gstRate) / 200;
        sgst = (taxable * gstRate) / 200;
      } else {
        igst = (taxable * gstRate) / 100;
      }
    }
    return { cgst, sgst, igst };
  };

  const taxableTotal = invoiceItems.reduce(
    (sum, item) => sum + taxablePerRow(item),
    0
  );
  const discountAmount = (taxableTotal * discountPercent) / 100;
  const taxableAfterDiscount = taxableTotal - discountAmount;

  const totalCGST = invoiceItems.reduce((sum, item) => {
    const lineAmount = item.qty * Number(item.amount || 0);
    const lineShare = taxableTotal > 0 ? lineAmount / taxableTotal : 0;
    const discountedLineAmount = lineAmount - discountAmount * lineShare;
    const gstRate = item.gst || 0;

    if (
      billTo?.state &&
      orgState &&
      billTo.state.toUpperCase() === orgState.toUpperCase()
    ) {
      return sum + (discountedLineAmount * gstRate) / 200;
    }
    return sum;
  }, 0);

  const totalSGST = invoiceItems.reduce((sum, item) => {
    const lineAmount = item.qty * Number(item.amount || 0);
    const lineShare = taxableTotal > 0 ? lineAmount / taxableTotal : 0;
    const discountedLineAmount = lineAmount - discountAmount * lineShare;
    const gstRate = item.gst || 0;

    if (
      billTo?.state &&
      orgState &&
      billTo.state.toUpperCase() === orgState.toUpperCase()
    ) {
      return sum + (discountedLineAmount * gstRate) / 200;
    }
    return sum;
  }, 0);

  const totalIGST = invoiceItems.reduce((sum, item) => {
    const lineAmount = item.qty * Number(item.amount || 0);
    const lineShare = taxableTotal > 0 ? lineAmount / taxableTotal : 0;
    const discountedLineAmount = lineAmount - discountAmount * lineShare;
    const gstRate = item.gst || 0;

    if (
      billTo?.state &&
      orgState &&
      billTo.state.toUpperCase() !== orgState.toUpperCase()
    ) {
      return sum + (discountedLineAmount * gstRate) / 100;
    }
    return sum;
  }, 0);

  const grandTotal = taxableAfterDiscount + totalCGST + totalSGST + totalIGST;

  // Track typing state to avoid overwriting input mid-typing
  const typingRef = useRef(false);

  const handleGrandTotalChange = (value) => {
    const desiredTotal = Number(value) || 0;

    const totalTax = totalCGST + totalSGST + totalIGST;
    let newDiscount = taxableTotal + totalTax - desiredTotal;
    let newDiscountPercent =
      taxableTotal > 0 ? (newDiscount / taxableTotal) * 100 : 0;
    if (newDiscountPercent < 0) newDiscountPercent = 0;

    setDiscountPercent(newDiscountPercent);
  };

  const debouncedGrandTotalChange = useMemo(
    () =>
      debounce((value) => {
        handleGrandTotalChange(value);
        typingRef.current = false; // finished typing
      }, 500),
    [taxableTotal, totalCGST, totalSGST, totalIGST]
  );

  // Keep manualGrandTotal in sync only when not typing
  useEffect(() => {
    if (!typingRef.current) {
      setManualGrandTotal(grandTotal.toFixed(2));
    }
  }, [grandTotal]);

  const handleSubmit = async () => {
    const payload = {
      items: invoiceItems,
      discountPercent,
      totals: {
        taxableTotal,
        discountAmount,
        taxableAfterDiscount,
        totalCGST,
        totalSGST,
        totalIGST,
        grandTotal,
      },
      billTo,
    };

    try {
      await fetch(`/api/${type === "invoice" ? "invoices" : "quotations"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      message.success(`${type} saved successfully!`);
      onSuccess(payload);
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to save");
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      width={800}
      title={`Generate ${type === "invoice" ? "Invoice" : "Quotation"}`}
      okText={`Save ${type === "invoice" ? "Invoice" : "Quotation"}`}
    >
      <Form form={form} layout="vertical">
        {/* Bill To */}
        <Form.Item label="Bill To">
          <Select
            showSearch
            placeholder="Select client"
            onChange={handleClientChange}
            onSearch={handleClientSearch}
            allowClear
            filterOption={false}
            value={billTo?.id || undefined}
          >
            {clients.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.first_name}
              </Select.Option>
            ))}
          </Select>

          <Input
            style={{ marginTop: 8 }}
            placeholder="Bill To"
            value={billTo ? billTo.first_name : ""}
            readOnly
          />
        </Form.Item>

        {/* Items Table */}
        <div className="grid grid-cols-5 gap-2 font-bold mb-2">
          <div>Service</div>
          <div>Qty</div>
          <div>Amount</div>
          <div>GST%</div>
          <div>Taxable</div>
        </div>

        {invoiceItems.map((item, index) => (
          <div key={index} className="grid grid-cols-5 gap-2 mb-2">
            <Select
              value={item.serviceId ?? null}
              placeholder="Select Service"
              onChange={(val) => handleServiceChange(index, val)}
            >
              {services.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>

            <Input
              type="number"
              value={item.qty}
              onChange={(e) => handleItemChange(index, "qty", e.target.value)}
            />
            <Input
              type="number"
              value={item.amount}
              onChange={(e) =>
                handleItemChange(index, "amount", e.target.value)
              }
            />
            <div className="flex items-center">{item.gst || 0}%</div>
            <div className="flex items-center">
              {taxablePerRow(item).toFixed(2)}
            </div>
          </div>
        ))}

        <Button onClick={addItem} style={{ marginTop: 8 }}>
          + Add Item
        </Button>

        {/* Summary */}
        <div className="mt-6 space-y-2">
          <div>Taxable Total: {taxableTotal.toFixed(2)}</div>
          <div>
            Discount (%):{" "}
            <Input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
              style={{ width: 100, marginLeft: 8 }}
            />{" "}
            → {discountAmount.toFixed(2)}
          </div>
          <div>Taxable after Discount: {taxableAfterDiscount.toFixed(2)}</div>

          <table
            style={{
              width: "100%",
              marginTop: "10px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}
                >
                  Service
                </th>
                <th
                  style={{ borderBottom: "1px solid #ddd", textAlign: "right" }}
                >
                  GST %
                </th>
                <th
                  style={{ borderBottom: "1px solid #ddd", textAlign: "right" }}
                >
                  Taxable Amt
                </th>
                <th
                  style={{ borderBottom: "1px solid #ddd", textAlign: "right" }}
                >
                  Tax Amt
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item, idx) => {
                const service = services.find((s) => s.id === item.serviceId);
                if (!service) return null;

                const lineAmount = item.qty * Number(item.amount || 0);
                const lineShare =
                  taxableTotal > 0 ? lineAmount / taxableTotal : 0;
                const discountedLineAmount =
                  lineAmount - discountAmount * lineShare;
                const taxRate = item.gst || 0;
                const taxAmount = (discountedLineAmount * taxRate) / 100;

                return (
                  <tr key={idx}>
                    <td>{service.name}</td>
                    <td style={{ textAlign: "right" }}>{taxRate}%</td>
                    <td style={{ textAlign: "right" }}>
                      {discountedLineAmount.toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {taxAmount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div>CGST: {totalCGST.toFixed(2)}</div>
          <div>SGST: {totalSGST.toFixed(2)}</div>
          <div>IGST: {totalIGST.toFixed(2)}</div>

          <div className="font-bold">
            Grand Total:{" "}
            <Input
              value={manualGrandTotal}
              onChange={(e) => {
                const val = e.target.value;
                typingRef.current = true;
                setManualGrandTotal(val);
                debouncedGrandTotalChange(val);
              }}
              style={{ width: 150, marginLeft: 8 }}
            />
          </div>
        </div>
      </Form>
    </Modal>
  );
}
