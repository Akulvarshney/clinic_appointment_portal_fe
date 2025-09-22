import { useState, useEffect, useMemo, useRef } from "react";
import {
  Modal,
  Button,
  Input,
  Form,
  Select,
  message,
  DatePicker,
  Card,
  Divider,
  Space,
  InputNumber,
  Table,
  Typography,
  Tag,
  Tooltip,
  Switch,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import debounce from "lodash/debounce";

import { fetchServices } from "../services/OrgServices.js";
import { fetchClients } from "../services/clientServices.js";
import { BACKEND_URL } from "../assets/constants/index.js";
import axios from "axios";

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

export default function GenerateInvoiceModal({
  visible,
  type = "invoice",
  onClose,
  onSuccess,
  editData = null,
}) {
  const [form] = Form.useForm();
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [billTo, setBillTo] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [clientSearchValue, setClientSearchValue] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [manualGrandTotal, setManualGrandTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment due within 30 days");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [roundOff, setRoundOff] = useState(true);
  const [billToText, setBillToText] = useState("");
  const [billFromOrg, setBillFromOrg] = useState(null);
  const [billFromText, setBillFromText] = useState("");

  const orgState = "HARYANA";
  const currentDate = dayjs();
  const dueDate = currentDate.add(30, "day");
  const typingRef = useRef(false);

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const prefix = type === "invoice" ? "INV" : "QUO";
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${currentDate.format("YYYY")}-${timestamp}`;
  };

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

  // Load organization data from localStorage
  useEffect(() => {
    const loadOrgData = async () => {
      try {
        const selectedOrgId = localStorage.getItem("selectedOrgId");
        const orgData = JSON.parse(
          localStorage.getItem("organizations") || "[]"
        );

        // console.log("Loading org data:", { selectedOrgId, orgData }); // Debug log

        if (selectedOrgId && orgData.length > 0) {
          const selectedOrg = orgData.find(
            (org) => org.organizationId === selectedOrgId
          );

          // console.log("Selected org:", selectedOrg); // Debug log

          if (selectedOrg) {
            setBillFromOrg(selectedOrg);
            const orgText = [
              selectedOrg.organizationName,
              selectedOrg.address ? selectedOrg.address : "",
              selectedOrg.state ? selectedOrg.state : "",
              selectedOrg.gstnumber ? selectedOrg.gstnumber : "",
            ]
              .filter(Boolean)
              .join("\n")
              .trim();

            // console.log("Generated orgText:", orgText); // Debug log
            setBillFromText(orgText);
          } else {
            // console.log("No matching org found"); // Debug log
            setBillFromOrg(null);
            setBillFromText("");
          }
        } else {
          // console.log("No selectedOrgId or orgData"); // Debug log
          setBillFromOrg(null);
          setBillFromText("");
        }
      } catch (error) {
        console.error("Error loading organization data:", error);
        setBillFromOrg(null);
        setBillFromText("");
      }
    };

    if (visible) {
      loadOrgData();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      if (editData) {
        form.setFieldsValue({
          invoiceNumber: editData.invoiceNumber,
          invoiceDate: dayjs(editData.invoiceDate),
          dueDate: dayjs(editData.dueDate),
          billTo: editData.billTo?.id,
          notes: editData.notes,
          terms: editData.terms,
        });
        setBillTo(editData.billTo);
        setInvoiceItems(editData.items || []);
        setDiscountPercent(editData.discountPercent || 0);
        setNotes(editData.notes || "");
        setTerms(editData.terms || "Payment due within 30 days");
        setShippingCharges(editData.shippingCharges || 0);
        setBillToText(editData.billToText || "");
        setBillFromText(editData.billFromText || "");
      } else {
        form.resetFields();
        const newInvoiceNumber = generateInvoiceNumber();
        form.setFieldsValue({
          invoiceNumber: newInvoiceNumber,
          invoiceDate: currentDate,
          dueDate: dueDate,
          terms: "Payment due within 30 days",
        });
        setBillTo(null);
        setInvoiceItems([]);
        setDiscountPercent(0);
        setNotes("");
        setTerms("Payment due within 30 days");
        setShippingCharges(0);
        setInvoiceNumber(newInvoiceNumber);
        setBillToText("");
        // Don't reset billFromText here - let it be set by the loadOrgData effect
      }
    }
  }, [visible, form, editData, type]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [servicesData, clientsData] = await Promise.all([
          fetchServices(),
          fetchClients(),
        ]);
        setServices(servicesData || []);
        setClients(clientsData || []);
      } catch (error) {
        message.error("Failed to load data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (visible) {
      loadData();
    }
  }, [visible]);

  const handleClientChange = (value) => {
    const client = clients.find((c) => c.id === value);
    if (client) {
      setBillTo(client);
      form.setFieldValue("billTo", value);

      // Generate default text for client
      const defaultText = [
        `${client.first_name} ${client.last_name}`,
        client.email ? client.email : "",
        client.phone ? client.phone : "",
        client.address ? client.address : "",
        client.state ? client.state : "",
      ]
        .filter(Boolean)
        .join("\n");

      setBillToText(defaultText);
    }
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
              description: service.description || service.name,
              rate: Number(service.price) || 0,
              gst: Number(service.tax) || 0,
              // Recalculate amount with current quantity
              amount: (Number(item.qty) || 1) * (Number(service.price) || 0),
            }
          : item
      )
    );
  };

  const addItem = () => {
    setInvoiceItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        serviceId: undefined,
        description: "",
        qty: 1,
        rate: 0,
        amount: 0,
        gst: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    setInvoiceItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setInvoiceItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const updatedItem = { ...item, [field]: value };

        // Recalculate amount when qty or rate changes
        if (field === "qty" || field === "rate") {
          const qty =
            field === "qty" ? Number(value) || 0 : Number(item.qty) || 0;
          const rate =
            field === "rate" ? Number(value) || 0 : Number(item.rate) || 0;
          updatedItem.amount = qty * rate;
        }

        return updatedItem;
      })
    );
  };

  const getLineItemTaxDetails = (item, itemIndex) => {
    const lineAmount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
    const gstRate = Number(item.gst || 0);

    // Calculate this line's proportion of the subtotal
    const lineShareOfTotal =
      calculations.subTotal > 0 ? lineAmount / calculations.subTotal : 0;

    // This line's share of total discount
    const lineDiscountShare = lineShareOfTotal * calculations.discountAmount;

    // Taxable amount for this line after discount
    const taxableLineAmount = lineAmount - lineDiscountShare;

    // Calculate tax for this line
    let cgst = 0,
      sgst = 0,
      igst = 0,
      totalLineTax = 0;

    if (billTo?.state && orgState) {
      if (billTo.state.toUpperCase() === orgState.toUpperCase()) {
        // Intra-state: CGST + SGST
        cgst = (taxableLineAmount * gstRate) / 200;
        sgst = (taxableLineAmount * gstRate) / 200;
        totalLineTax = cgst + sgst;
      } else {
        // Inter-state: IGST
        igst = (taxableLineAmount * gstRate) / 100;
        totalLineTax = igst;
      }
    }

    return {
      lineAmount,
      lineDiscountShare,
      taxableLineAmount,
      cgst,
      sgst,
      igst,
      totalLineTax,
      finalAmount: taxableLineAmount + totalLineTax,
    };
  };
  // All calculations in one place using useMemo
  const calculations = useMemo(() => {
    // 1. Calculate subtotal (sum of all line amounts)
    const subTotal = invoiceItems.reduce((sum, item) => {
      return sum + (Number(item.qty) || 0) * (Number(item.rate) || 0);
    }, 0);

    // 2. Calculate discount amount
    const discountAmount = (subTotal * discountPercent) / 100;

    // 3. Taxable amount after discount
    const taxableAfterDiscount = subTotal - discountAmount;

    // 4. Calculate taxes on the discounted amount
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    // Group items by GST rate for proper tax calculation
    const gstGroups = {};

    invoiceItems.forEach((item) => {
      const lineAmount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
      const gstRate = Number(item.gst || 0);

      if (!gstGroups[gstRate]) {
        gstGroups[gstRate] = 0;
      }
      gstGroups[gstRate] += lineAmount;
    });

    // Calculate tax for each GST group
    Object.keys(gstGroups).forEach((gstRate) => {
      const gstRateNum = Number(gstRate);
      const groupAmount = gstGroups[gstRate];

      // Calculate this group's share of discount
      const groupDiscountShare =
        subTotal > 0 ? (groupAmount / subTotal) * discountAmount : 0;
      const groupTaxableAmount = groupAmount - groupDiscountShare;

      if (billTo?.state && orgState) {
        if (billTo.state.toUpperCase() === orgState.toUpperCase()) {
          // Intra-state: CGST + SGST
          const cgst = (groupTaxableAmount * gstRateNum) / 200;
          const sgst = (groupTaxableAmount * gstRateNum) / 200;
          totalCGST += cgst;
          totalSGST += sgst;
        } else {
          // Inter-state: IGST
          const igst = (groupTaxableAmount * gstRateNum) / 100;
          totalIGST += igst;
        }
      }
    });

    const totalTax = totalCGST + totalSGST + totalIGST;

    // 5. Final calculations
    const grandTotalBeforeRounding =
      taxableAfterDiscount + totalTax + shippingCharges;
    const grandTotal = roundOff
      ? Math.round(grandTotalBeforeRounding)
      : grandTotalBeforeRounding;
    const roundOffAmount = grandTotal - grandTotalBeforeRounding;

    return {
      subTotal,
      discountAmount,
      taxableAfterDiscount,
      totalCGST,
      totalSGST,
      totalIGST,
      totalTax,
      grandTotalBeforeRounding,
      grandTotal,
      roundOffAmount,
      gstGroups, // For line item display
    };
  }, [
    invoiceItems,
    discountPercent,
    shippingCharges,
    roundOff,
    billTo?.state,
    orgState,
  ]);

  const handleGrandTotalChange = (value) => {
    const desiredTotal = Number(value) || 0;

    // Calculate base amounts
    const subTotal = calculations.subTotal;
    const shippingAmount = shippingCharges || 0;

    // Calculate what the total would be with 0% discount
    const totalWithoutDiscount =
      subTotal + calculations.totalTax + shippingAmount;

    // If desired total is greater than or equal to total without discount, set discount to 0
    if (desiredTotal >= totalWithoutDiscount) {
      setDiscountPercent(0);
      return;
    }

    // Binary search to find the correct discount percentage
    let lowDiscount = 0;
    let highDiscount = 100;
    let bestDiscount = 0;

    // Iterate to find the discount that gets closest to desired total
    for (let iteration = 0; iteration < 20; iteration++) {
      const testDiscount = (lowDiscount + highDiscount) / 2;
      const testDiscountAmount = (subTotal * testDiscount) / 100;
      const testTaxableAmount = subTotal - testDiscountAmount;

      // Calculate tax with this discount
      let testTotalTax = 0;
      Object.keys(calculations.gstGroups || {}).forEach((gstRate) => {
        const gstRateNum = Number(gstRate);
        const groupAmount = calculations.gstGroups[gstRate];
        const groupDiscountShare =
          subTotal > 0 ? (groupAmount / subTotal) * testDiscountAmount : 0;
        const groupTaxableAmount = groupAmount - groupDiscountShare;

        if (billTo?.state && orgState) {
          if (billTo.state.toUpperCase() === orgState.toUpperCase()) {
            testTotalTax += (groupTaxableAmount * gstRateNum) / 100; // CGST + SGST = full rate
          } else {
            testTotalTax += (groupTaxableAmount * gstRateNum) / 100; // IGST = full rate
          }
        }
      });

      const testGrandTotal = testTaxableAmount + testTotalTax + shippingAmount;

      if (Math.abs(testGrandTotal - desiredTotal) < 0.01) {
        bestDiscount = testDiscount;
        break;
      }

      if (testGrandTotal > desiredTotal) {
        lowDiscount = testDiscount;
      } else {
        highDiscount = testDiscount;
      }

      bestDiscount = testDiscount;
    }

    // Ensure discount doesn't exceed 100%
    setDiscountPercent(Math.min(Math.max(bestDiscount, 0), 100));
  };

  const debouncedGrandTotalChange = useMemo(
    () =>
      debounce((value) => {
        handleGrandTotalChange(value);
        typingRef.current = false;
      }, 500),
    [calculations.subTotal, calculations.totalTax, shippingCharges]
  );

  useEffect(() => {
    if (!typingRef.current) {
      setManualGrandTotal(calculations.grandTotal.toFixed(2));
    }
  }, [calculations.grandTotal]);

  const validateForm = () => {
    if (!billTo) {
      message.error("Please select a client");
      return false;
    }
    if (invoiceItems.length === 0) {
      message.error("Please add at least one item");
      return false;
    }

    // Check if any item has missing required fields
    for (let i = 0; i < invoiceItems.length; i++) {
      const item = invoiceItems[i];
      if (!item.serviceId) {
        message.error(`Please select a service for item ${i + 1}`);
        return false;
      }
      if (!item.qty || item.qty <= 0) {
        message.error(`Please enter a valid quantity for item ${i + 1}`);
        return false;
      }
      if (item.rate === undefined || item.rate < 0) {
        message.error(`Please enter a valid rate for item ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const formValues = await form.validateFields();

      const selectedOrgId = localStorage.getItem("selectedOrgId");
      if (!selectedOrgId) {
        message.error("Organization not selected");
        return;
      }

      // Debug log to check billFromText value before sending
      console.log("Submitting with billFromText:", billFromText);

      const payload = {
        organization_id: selectedOrgId,
        client_id: billTo.id,
        invoice_date: formValues.invoiceDate.format("YYYY-MM-DD"),
        due_date: formValues.dueDate
          ? formValues.dueDate.format("YYYY-MM-DD")
          : null,
        sub_total: calculations.subTotal,
        discount_amount: calculations.discountAmount,
        discount_percentage: discountPercent,
        taxable_after_discount: calculations.taxableAfterDiscount,
        total_cgst: calculations.totalCGST,
        total_sgst: calculations.totalSGST,
        total_igst: calculations.totalIGST,
        total_tax: calculations.totalTax,
        shipping_charges: shippingCharges || 0,
        round_off_amount: calculations.roundOffAmount || 0,
        grand_total_before_rounding: calculations.grandTotalBeforeRounding,
        grand_total: calculations.grandTotal,
        bill_to_text: billToText,
        bill_from_text: billFromText, // This should now have the correct value
        notes,
        terms,
        round_off_enabled: roundOff,
        bill_type: type === "invoice" ? "INVOICE" : "QUOTATION",
        status: "SUBMITTED",
        line_items: invoiceItems.map((item, index) => {
          const taxDetails = getLineItemTaxDetails(item, index);
          return {
            service_id: item.serviceId,
            service_name:
              services.find((s) => s.id === item.serviceId)?.name || "",
            description: item.description,
            quantity: Number(item.qty) || 0,
            rate: Number(item.rate) || 0,
            amount: taxDetails.lineAmount,
            gst_percentage: Number(item.gst || 0),
            line_discount_share: taxDetails.lineDiscountShare,
            taxable_amount: taxDetails.taxableLineAmount,
            cgst_amount: taxDetails.cgst,
            sgst_amount: taxDetails.sgst,
            igst_amount: taxDetails.igst,
            total_tax_amount: taxDetails.totalLineTax,
            final_amount: taxDetails.finalAmount,
          };
        }),
      };

      const token = localStorage.getItem("token");

      const endpoint =
        type === "invoice"
          ? "/clientadmin/invoices/create"
          : "/clientadmin/invoices/quotation/create";

      const response = await axios.post(`${BACKEND_URL}${endpoint}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = response.data;

      message.success(
        `${type} ${result.data?.invoice_number || ""} ${
          editData ? "updated" : "created"
        } successfully!`
      );

      onClose(); // keep this if you still want the modal to close
    } catch (error) {
      console.error("Error submitting invoice:", error);
      message.error(
        error.message || `Failed to ${editData ? "update" : "create"} ${type}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Table columns for items
  const itemColumns = [
    {
      title: "#",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Service/Item",
      dataIndex: "serviceId",
      width: 200,
      render: (serviceId, record, index) => (
        <Select
          value={serviceId}
          placeholder="Select Service"
          onChange={(val) => handleServiceChange(index, val)}
          style={{ width: "100%" }}
          showSearch
          optionFilterProp="children"
        >
          {services.map((s) => (
            <Option key={s.id} value={s.id}>
              {s.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (description, record, index) => (
        <TextArea
          value={description}
          onChange={(e) =>
            handleItemChange(index, "description", e.target.value)
          }
          placeholder="Item description"
          autoSize={{ minRows: 1, maxRows: 3 }}
        />
      ),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      width: 80,
      render: (qty, record, index) => (
        <InputNumber
          value={qty}
          onChange={(value) => handleItemChange(index, "qty", value || 0)}
          min={0}
          step={1}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Rate",
      dataIndex: "rate",
      width: 100,
      render: (rate, record, index) => (
        <InputNumber
          value={rate}
          onChange={(value) => handleItemChange(index, "rate", value || 0)}
          min={0}
          step={0.01}
          formatter={(value) =>
            `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "GST %",
      dataIndex: "gst",
      width: 80,
      render: (gst) => <Tag color="blue">{gst || 0}%</Tag>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 120,
      render: (_, record) => (
        <Text strong>
          ₹
          {((record.qty || 0) * (record.rate || 0)).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}
        </Text>
      ),
    },
    {
      title: "Amount After Discount",
      dataIndex: "amount_after_discount",
      width: 140,
      render: (_, record, index) => {
        const taxDetails = getLineItemTaxDetails(record, index);
        return (
          <Text strong className="text-blue-600">
            ₹
            {taxDetails.taxableLineAmount.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </Text>
        );
      },
    },
    // New tax columns
    ...(billTo?.state &&
    orgState &&
    billTo.state.toUpperCase() === orgState.toUpperCase()
      ? [
          {
            title: "CGST",
            width: 90,
            render: (_, record, index) => {
              const taxDetails = getLineItemTaxDetails(record, index);
              return (
                <div className="text-center">
                  <Text className="text-xs text-gray-500">
                    ₹
                    {taxDetails.cgst.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </div>
              );
            },
          },
          {
            title: "SGST",
            width: 90,
            render: (_, record, index) => {
              const taxDetails = getLineItemTaxDetails(record, index);
              return (
                <div className="text-center">
                  <Text className="text-xs text-gray-500">
                    ₹
                    {taxDetails.sgst.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </div>
              );
            },
          },
        ]
      : [
          {
            title: "IGST",
            width: 90,
            render: (_, record, index) => {
              const taxDetails = getLineItemTaxDetails(record, index);
              return (
                <div className="text-center">
                  <Text className="text-xs text-gray-500">
                    ₹
                    {taxDetails.igst.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </div>
              );
            },
          },
        ]),
    {
      title: (
        <Tooltip title="Final amount including discount and tax">
          <span>
            Total <InfoCircleOutlined className="ml-1" />
          </span>
        </Tooltip>
      ),
      width: 130,
      render: (_, record, index) => {
        const taxDetails = getLineItemTaxDetails(record, index);
        return (
          <Text strong className="text-green-600">
            ₹
            {taxDetails.finalAmount.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </Text>
        );
      },
    },
    {
      title: "Action",
      width: 60,
      render: (_, __, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(index)}
          disabled={invoiceItems.length === 1}
        />
      ),
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {editData ? "Update" : "Save"}{" "}
          {type === "invoice" ? "Invoice" : "Quotation"}
        </Button>,
      ]}
      width={1400}
      centered
      title={
        <Space>
          <FileTextOutlined />
          {editData ? "Edit" : "Generate"}
          {type === "invoice" ? "Invoice" : "Quotation"}
        </Space>
      }
      destroyOnClose
    >
      <Form form={form} layout="vertical" size="large">
        {/* Header Section - Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Form.Item
            name="invoiceDate"
            label={`${type === "invoice" ? "Invoice" : "Quotation"} Date`}
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              prefix={<CalendarOutlined />}
            />
          </Form.Item>
        </div>

        {/* Header Section - Organization and Client Details in One Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bill From - Organization Information */}
          <Card
            title={
              <Space>
                <UserOutlined />
                Bill From
              </Space>
            }
            size="small"
          >
            {billFromText ? (
              <div className="whitespace-pre-line text-sm">{billFromText}</div>
            ) : (
              <div className="text-gray-400 italic">
                Organization information will appear here
              </div>
            )}
          </Card>

          {/* Client Information */}
          <Card
            title={
              <Space>
                <UserOutlined />
                Bill To
              </Space>
            }
            size="small"
          >
            <Form.Item
              name="billTo"
              label="Select Client"
              rules={[{ required: true, message: "Please select a client" }]}
            >
              <Select
                showSearch
                placeholder="Search and select client"
                onChange={handleClientChange}
                onSearch={handleClientSearch}
                allowClear
                filterOption={false}
                loading={loading}
                notFoundContent="No clients found"
              >
                {clients.map((c) => (
                  <Option key={c.id} value={c.id}>
                    <div>
                      <strong>
                        {c.first_name} {c.last_name}
                      </strong>{" "}
                      || {c.phone}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {billTo && (
              <Form.Item label="Client Information">
                <TextArea
                  value={billToText}
                  onChange={(e) => setBillToText(e.target.value)}
                  placeholder="Client information will appear here. You can edit it as needed."
                  rows={5}
                  className="text-sm"
                />
              </Form.Item>
            )}
          </Card>
        </div>

        <Divider />

        {/* Items Section */}
        <Card
          title={
            <Space>
              <DollarOutlined />
              Items & Services
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addItem}
              size="small"
            >
              Add Item
            </Button>
          }
          className="mb-6"
        >
          <Table
            columns={itemColumns}
            dataSource={invoiceItems}
            pagination={false}
            rowKey={(record, index) => record.id || index}
            size="middle"
            scroll={{ x: 1200 }}
          />
        </Card>

        <Divider />

        {/* Bottom Section - Notes and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Additional Information */}
          <Card title="Additional Information" size="small">
            <Form.Item name="notes" label="Notes">
              <TextArea
                rows={3}
                placeholder="Add any additional notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Form.Item>

            <Form.Item name="terms" label="Terms & Conditions">
              <TextArea
                rows={2}
                placeholder="Payment terms and conditions..."
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Advanced Options">
              <Switch
                checked={showAdvanced}
                onChange={setShowAdvanced}
                checkedChildren="Show"
                unCheckedChildren="Hide"
              />
            </Form.Item>

            {showAdvanced && (
              <div className="space-y-4">
                <Form.Item label="Shipping Charges">
                  <InputNumber
                    value={shippingCharges}
                    onChange={(value) => setShippingCharges(value || 0)}
                    min={0}
                    formatter={(value) =>
                      `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                    className="w-full"
                  />
                </Form.Item>

                <Form.Item label="Round Off">
                  <Switch
                    checked={roundOff}
                    onChange={setRoundOff}
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                  />
                </Form.Item>
              </div>
            )}
          </Card>

          {/* Summary */}
          <Card title="Summary" size="small">
            <div className="text-sm space-y-2">
              <div className="flex justify-between items-center">
                <span>Sub Total:</span>
                <Text strong>
                  ₹
                  {calculations.subTotal.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span>Discount:</span>
                  <InputNumber
                    value={discountPercent}
                    onChange={(value) => setDiscountPercent(value || 0)}
                    min={0}
                    max={100}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value.replace("%", "")}
                    size="small"
                    className="w-16"
                  />
                </div>
                <Text type="danger">
                  -₹
                  {calculations.discountAmount.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </div>

              <div className="flex justify-between items-center">
                <span>Taxable Amount:</span>
                <span>
                  ₹
                  {calculations.taxableAfterDiscount.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {billTo?.state &&
              orgState &&
              billTo.state.toUpperCase() === orgState.toUpperCase() ? (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span>CGST:</span>
                    <span>
                      ₹
                      {calculations.totalCGST.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>SGST:</span>
                    <span>
                      ₹
                      {calculations.totalSGST.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span>IGST:</span>
                  <span>
                    ₹
                    {calculations.totalIGST.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              {showAdvanced && shippingCharges > 0 && (
                <div className="flex justify-between items-center">
                  <span>Shipping:</span>
                  <span>
                    ₹
                    {shippingCharges.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              {roundOff && calculations.roundOffAmount !== 0 && (
                <div className="flex justify-between items-center">
                  <span>Round Off:</span>
                  <span>
                    {calculations.roundOffAmount > 0 ? "+" : ""}₹
                    {calculations.roundOffAmount.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              <Divider className="my-3" />

              <div className="flex justify-between items-center text-base font-bold">
                <span>Grand Total:</span>
                <Tooltip title="Click to manually adjust total">
                  <InputNumber
                    value={manualGrandTotal}
                    onChange={(value) => {
                      typingRef.current = true;
                      setManualGrandTotal(value);
                      debouncedGrandTotalChange(value);
                    }}
                    formatter={(value) =>
                      `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                    className="w-36 font-bold"
                  />
                </Tooltip>
              </div>
            </div>
          </Card>
        </div>
      </Form>
    </Modal>
  );
}
