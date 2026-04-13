import { useState, useEffect, useMemo, useRef } from "react";
import {
  Modal,
  Button,
  Input,
  Form,
  Select,
  Card,
  Divider,
  Space,
  InputNumber,
  Tag,
  Tooltip,
  Switch,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import debounce from "lodash/debounce";

import { fetchServices } from "../services/OrgServices.js";
import { fetchClients } from "../services/clientServices.js";
import { BACKEND_URL } from "../assets/constants/index.js";
import axios from "axios";
import { useNotification } from "../utils/messageWrapper.js";
import { getOrgInfo } from "../services/clientOrganizations.js";
import DataTable from "../components/DataTable";
import {
  normalizeInventoryItem,
  normalizeInventoryBatch,
  inventoryGetErrorMessage,
} from "../utils/inventoryHelpers.js";

const { TextArea } = Input;
const { Option } = Select;

/** Batch IDs already selected on another line for the same item (current row excluded). */
function inventoryBatchIdsUsedElsewhere(inventoryItems, itemId, excludeRowIndex) {
  const used = new Set();
  if (!itemId) return used;
  inventoryItems.forEach((row, i) => {
    if (i === excludeRowIndex) return;
    if (row.inventoryItemId === itemId && row.inventoryBatchId != null) {
      used.add(row.inventoryBatchId);
    }
  });
  return used;
}

export default function GenerateInvoiceModal({
  visible,
  type = "invoice",
  initialData,
  setRefresh,
  onClose,
  onSuccess,
  editData = null,
}) {
  const [form] = Form.useForm();
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [billTo, setBillTo] = useState(null);
  const [serviceItems, setServiceItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  const lineItemsCombined = useMemo(
    () => [
      ...serviceItems.map((i) => ({ ...i, kind: "SERVICE" })),
      ...inventoryItems.map((i) => ({ ...i, kind: "INVENTORY" })),
    ],
    [serviceItems, inventoryItems]
  );

  function ensureItemShape(item) {
    const kind = item?.kind || item?.line_kind || "SERVICE";
    return {
      id: item?.id ?? Date.now(),
      kind: kind === "INVENTORY" ? "INVENTORY" : "SERVICE",
      serviceId: item?.serviceId,
      inventoryItemId: item?.inventoryItemId,
      inventoryBatchId: item?.inventoryBatchId,
      inventoryBatchNumber: item?.inventoryBatchNumber,
      description: item?.description ?? "",
      qty: item?.qty ?? 1,
      rate: item?.rate ?? 0,
      amount: item?.amount ?? 0,
      gst: kind === "INVENTORY" ? 0 : Number(item?.gst ?? item?.gst_percentage ?? 0),
    };
  }

  const [clientSearchValue, setClientSearchValue] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [manualGrandTotal, setManualGrandTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment due within 30 days");
  const [showAdvanced, setShowAdvanced] = useState(false);
  //const [shippingCharges, setShippingCharges] = useState(0);
  const [roundOff, setRoundOff] = useState(true);
  const [bankChargesEnabled, setBankChargesEnabled] = useState(false);

  const [billToText, setBillToText] = useState("");
  const [billFromOrg, setBillFromOrg] = useState(null);
  const [billFromText, setBillFromText] = useState("");
  const [orgState, setOrgState] = useState("");
  const [orgDetail, setOrgDetail] = useState(null);

  const notification = useNotification();

  const currentDate = dayjs();
  const dueDate = currentDate.add(30, "day");
  const typingRef = useRef(false);

  const roundTo2Decimals = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  const debouncedFetchClients = useMemo(() => debounce(fetchClients, 300), []);
  const debouncedFetchInventoryItems = useMemo(
    () =>
      debounce(async (search, cb) => {
        const items = await fetchInventoryItems(search);
        cb(items);
      }, 300),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable debounced wrapper; fetch uses latest org/token from localStorage
    []
  );

  const [inventoryCatalog, setInventoryCatalog] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventorySearchValue, setInventorySearchValue] = useState("");
  const [batchesByItemId, setBatchesByItemId] = useState({});
  const [batchesLoadingByItemId, setBatchesLoadingByItemId] = useState({});

  const fetchInventoryItems = async (search) => {
    const token = localStorage.getItem("token");
    const orgId = localStorage.getItem("selectedOrgId");
    if (!token || !orgId) return [];
    setInventoryLoading(true);
    try {
      const res = await axios.get(
        `${BACKEND_URL}/clientadmin/inventoryManagement/getItems`,
        {
          params: { orgId, page: 1, limit: 50, search: search || undefined },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const payload = res.data?.data ?? res.data ?? {};
      const raw = payload.items ?? payload.data?.items ?? [];
      return raw.map(normalizeInventoryItem).filter(Boolean);
    } catch (err) {
      notification.error({
        message: "Could not load inventory items",
        description: inventoryGetErrorMessage(err, "Failed to fetch items"),
      });
      return [];
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchBatchesForItem = async (inventoryItemId) => {
    if (!inventoryItemId) return [];
    const token = localStorage.getItem("token");
    const orgId = localStorage.getItem("selectedOrgId");
    if (!token || !orgId) return [];

    if (batchesByItemId[inventoryItemId]) return batchesByItemId[inventoryItemId];

    setBatchesLoadingByItemId((prev) => ({ ...prev, [inventoryItemId]: true }));
    try {
      const res = await axios.get(
        `${BACKEND_URL}/clientadmin/inventoryManagement/getBatches`,
        {
          params: { orgId, itemId: inventoryItemId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const list = res.data?.data ?? res.data ?? [];
      const batches = (Array.isArray(list) ? list : [])
        .map(normalizeInventoryBatch)
        .filter(Boolean);
      setBatchesByItemId((prev) => ({ ...prev, [inventoryItemId]: batches }));
      return batches;
    } catch (err) {
      notification.error({
        message: "Could not load batches",
        description: inventoryGetErrorMessage(err, "Failed to fetch batches"),
      });
      setBatchesByItemId((prev) => ({ ...prev, [inventoryItemId]: [] }));
      return [];
    } finally {
      setBatchesLoadingByItemId((prev) => ({ ...prev, [inventoryItemId]: false }));
    }
  };

  const handleClientSearch = async (value) => {
    setClientSearchValue(value);
    try {
      const results = await debouncedFetchClients(value);
      setClients(results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInventorySearch = async (value) => {
    setInventorySearchValue(value);
    debouncedFetchInventoryItems(value, (items) => {
      setInventoryCatalog(items || []);
    });
  };

  //Load client Billling info
  useEffect(() => {
    const getinfo = async () => {
      const response = await getOrgInfo();
      console.log("123", response.response);
      if (response) {
        setOrgDetail(response.response);
      }
    };
    getinfo();
  }, []);

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
              orgDetail.company_name,
              orgDetail.address ? orgDetail.address : "",
              orgDetail.email ? orgDetail.email : "",
              orgDetail.state ? orgDetail.state : "",
              type === "invoice"
                ? orgDetail.gst_number
                  ? orgDetail.gst_number
                  : ""
                : "",
            ]
              .filter(Boolean)
              .join("\n")
              .trim();

            // console.log("Generated orgText:", orgText); // Debug log
            setBillFromText(orgText);
            setOrgState(selectedOrg?.state);
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
        const rawItems = editData.items || [];
        const svc = [];
        const inv = [];
        rawItems.forEach((row) => {
          const k = row.kind || row.line_kind || "SERVICE";
          const shaped = ensureItemShape(row);
          if (k === "INVENTORY") {
            inv.push({ ...shaped, kind: "INVENTORY", gst: 0 });
          } else {
            svc.push({ ...shaped, kind: "SERVICE" });
          }
        });
        setServiceItems(svc.length ? svc : []);
        setInventoryItems(inv);
        inv.forEach((row) => {
          if (row.inventoryItemId) fetchBatchesForItem(row.inventoryItemId);
        });
        setDiscountPercent(editData.discountPercent || 0);
        setNotes(editData.notes || "");
        setTerms(editData.terms || "Payment due within 30 days");
        // Check if bank charges were previously applied (not null and not empty string)
        const hasBankCharges = editData.bankCharges !== null && editData.bankCharges !== "" && editData.bankCharges !== undefined;
        setBankChargesEnabled(hasBankCharges);
        // If bank charges were applied, show the advanced options section
        if (hasBankCharges) {
          setShowAdvanced(true);
        }
        //setShippingCharges(editData.shippingCharges || 0);
        setBillToText(editData.billToText || "");
        setBillFromText(editData.billFromText || "");
      } else {
        form.resetFields();
        // const newInvoiceNumber = generateInvoiceNumber();
        form.setFieldsValue({
          // invoiceNumber: newInvoiceNumber,
          invoiceDate: currentDate,
          dueDate: dueDate,
          terms: "Payment due within 30 days",
        });
        setBillTo(null);
        setServiceItems([
          {
            id: Date.now(),
            kind: "SERVICE",
            serviceId: undefined,
            description: "",
            qty: 1,
            rate: 0,
            amount: 0,
            gst: 0,
          },
        ]);
        setInventoryItems([]);
        setDiscountPercent(0);
        setNotes("");
        setTerms("Payment due within 30 days");
        // setShippingCharges(0);
        setBankChargesEnabled(false);
        // setInvoiceNumber(newInvoiceNumber);
        setBillToText("");
        setManualGrandTotal(0);
        setBankChargesEnabled(false);
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
        notification.error({
          message: "Failed to Load Data",
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (visible) {
      loadData();
    }
  }, [visible]);

  useEffect(() => {
    const preloadInventory = async () => {
      const items = await fetchInventoryItems("");
      setInventoryCatalog(items || []);
    };
    if (visible) preloadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- preload on open
  }, [visible]);

  const handleClientChange = (value) => {
    const client = clients.find((c) => c.id === value);
    if (client) {
      setBillTo(client);
      form.setFieldValue("billTo", value);

      // Generate default text for client
      const defaultText = [
        client.first_name && client.last_name
          ? `${client.first_name} ${client.last_name}`
          : client.first_name || client.last_name || "",
        client.email || "",
        client.phone || "",
        client.address || "",
        client.state || "",
      ]
        .filter(Boolean)
        .join("\n");

      setBillToText(defaultText);
    }
  };

  const handleServiceChange = (index, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    setServiceItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
            ...item,
            serviceId,
            description: service.description || service.name,
            rate: Number(service.price) || 0,
            gst: Number(service.tax) || 0,
            amount: (Number(item.qty) || 1) * (Number(service.price) || 0),
          }
          : item
      )
    );
  };

  const handleInventoryItemChange = async (index, inventoryItemId) => {
    const inv = inventoryCatalog.find((x) => x.id === inventoryItemId);
    setInventoryItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const next = {
          ...ensureItemShape({ ...item, kind: "INVENTORY" }),
          inventoryItemId,
          inventoryBatchId: undefined,
          inventoryBatchNumber: undefined,
          gst: 0,
        };
        if (inv) {
          next.description = next.description || inv.description || inv.name || "";
          const hint =
            Number(inv.sellingPrice) > 0 ? Number(inv.sellingPrice) : 0;
          next.rate = next.rate && Number(next.rate) > 0 ? next.rate : hint;
        }
        return next;
      })
    );
    const batches = await fetchBatchesForItem(inventoryItemId);
    setInventoryItems((prev) => {
      const taken = inventoryBatchIdsUsedElsewhere(prev, inventoryItemId, index);
      const available = batches.filter((b) => !taken.has(b.id));
      if (available.length !== 1) return prev;
      const b0 = available[0];
      const sell = Number(b0.sellingPrice) > 0 ? Number(b0.sellingPrice) : undefined;
      return prev.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          inventoryBatchId: b0.id,
          inventoryBatchNumber: b0.batchNumber,
          ...(sell ? { rate: sell } : {}),
        };
      });
    });
  };

  const handleInventoryBatchChange = (index, batchId) => {
    const row = inventoryItems[index];
    const batches = batchesByItemId[row?.inventoryItemId] || [];
    const b = batches.find((x) => x.id === batchId);
    const sell = b && Number(b.sellingPrice) > 0 ? Number(b.sellingPrice) : null;
    setInventoryItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const next = {
          ...item,
          inventoryBatchId: batchId,
          inventoryBatchNumber: b?.batchNumber,
        };
        if (sell != null) next.rate = sell;
        return next;
      })
    );

    if (b && b.quantityOnHand != null) {
      setInventoryItems((prev) =>
        prev.map((item, i) => {
          if (i !== index) return item;
          const qty = Number(item.qty) || 0;
          const max = Number(b.quantityOnHand) || 0;
          if (qty > max) return { ...item, qty: Math.max(1, max) };
          return item;
        })
      );
    }
  };

  const addServiceLine = () => {
    setServiceItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        kind: "SERVICE",
        serviceId: undefined,
        description: "",
        qty: 1,
        rate: 0,
        amount: 0,
        gst: 0,
      },
    ]);
  };

  const addInventoryLine = () => {
    setInventoryItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        kind: "INVENTORY",
        inventoryItemId: undefined,
        inventoryBatchId: undefined,
        inventoryBatchNumber: undefined,
        description: "",
        qty: 1,
        rate: 0,
        amount: 0,
        gst: 0,
      },
    ]);
  };

  const removeServiceLine = (index) => {
    setServiceItems((prev) => prev.filter((_, i) => i !== index));
  };

  const removeInventoryLine = (index) => {
    setInventoryItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleServiceFieldChange = (index, field, value) => {
    setServiceItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updatedItem = { ...item, [field]: value };
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

  const handleInventoryFieldChange = (index, field, value) => {
    setInventoryItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updatedItem = { ...item, [field]: value };
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

  const handleServiceQtyChange = (index, rawValue) => {
    let next = Number(rawValue) || 0;
    if (next < 1) next = 1;
    handleServiceFieldChange(index, "qty", next);
  };

  const handleInventoryQtyChange = (index, rawValue) => {
    const row = inventoryItems[index];
    let next = Number(rawValue) || 0;
    if (next < 1) next = 1;
    if (row?.inventoryItemId && row?.inventoryBatchId) {
      const batches = batchesByItemId[row.inventoryItemId] || [];
      const b = batches.find((x) => x.id === row.inventoryBatchId);
      const onHand = Number(b?.quantityOnHand);
      if (Number.isFinite(onHand)) next = Math.min(next, onHand);
    }
    handleInventoryFieldChange(index, "qty", next);
  };

  const getLineItemTaxDetails = (item, itemIndex) => {
    const lineAmount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
    const kind = item.kind || "SERVICE";

    const lineShareOfTotal =
      calculations.subTotal > 0 ? lineAmount / calculations.subTotal : 0;
    const lineDiscountShare = roundTo2Decimals(
      lineShareOfTotal * calculations.discountAmount
    );
    const taxableLineAmount = Math.max(
      0,
      roundTo2Decimals(lineAmount - lineDiscountShare)
    );

    // INVENTORY: no GST; server normalizes taxable = rate×qty − line_discount_share, final = taxable
    if (kind === "INVENTORY") {
      return {
        lineAmount,
        lineDiscountShare,
        taxableLineAmount,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalLineTax: 0,
        finalAmount: taxableLineAmount,
      };
    }

    const gstRate = Number(item.gst || 0);
    let cgst = 0,
      sgst = 0,
      igst = 0,
      totalLineTax = 0;

    if (billTo?.state && orgState) {
      if (billTo.state.toUpperCase() === orgState.toUpperCase()) {
        cgst = (taxableLineAmount * gstRate) / 200;
        sgst = (taxableLineAmount * gstRate) / 200;
        totalLineTax = cgst + sgst;
      } else {
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
    const subTotal = lineItemsCombined.reduce((sum, item) => {
      return sum + (Number(item.qty) || 0) * (Number(item.rate) || 0);
    }, 0);

    // 2. Calculate discount amount
    // const discountAmount = (subTotal * discountPercent) / 100;
    const discountAmount = roundTo2Decimals((subTotal * discountPercent) / 100);

    // 3. Taxable amount after discount
    const taxableAfterDiscount = subTotal - discountAmount;

    // 4. Calculate taxes on the discounted amount
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    // Group items by GST rate for proper tax calculation
    const gstGroups = {};

    lineItemsCombined.forEach((item) => {
      const kind = item.kind || "SERVICE";
      if (kind === "INVENTORY") return;
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
    const bankCharges = bankChargesEnabled
      ? roundTo2Decimals(taxableAfterDiscount * 0.02)
      : 0;
    const grandTotalBeforeRounding =
      taxableAfterDiscount + totalTax + bankCharges;
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
      bankCharges,
      grandTotalBeforeRounding,
      grandTotal,
      roundOffAmount,
      gstGroups,
    };
  }, [
    lineItemsCombined,
    discountPercent,
    bankChargesEnabled,
    roundOff,
    billTo?.state,
    orgState,
  ]);

  const handleGrandTotalChange = (value) => {
    const desiredTotal = Number(value) || 0;

    // Calculate base amounts
    const subTotal = calculations.subTotal;
    //const shippingAmount = shippingCharges || 0;

    // Calculate what the total would be with 0% discount
    const totalWithoutDiscount = subTotal + calculations.totalTax;

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
      const testDiscountAmount = roundTo2Decimals(
        (subTotal * testDiscount) / 100
      );
      const testTaxableAmount = subTotal - testDiscountAmount;

      // Calculate tax with this discount
      let testTotalTax = 0; //test
      Object.keys(calculations.gstGroups || {}).forEach((gstRate) => {
        const gstRateNum = Number(gstRate);
        const groupAmount = calculations.gstGroups[gstRate];
        const groupDiscountShare = roundTo2Decimals(
          subTotal > 0 ? (groupAmount / subTotal) * testDiscountAmount : 0
        );
        const groupTaxableAmount = groupAmount - groupDiscountShare;

        if (billTo?.state && orgState) {
          if (billTo.state.toUpperCase() === orgState.toUpperCase()) {
            testTotalTax += (groupTaxableAmount * gstRateNum) / 100; // CGST + SGST = full rate
          } else {
            testTotalTax += (groupTaxableAmount * gstRateNum) / 100; // IGST = full rate
          }
        }
      });

      const testGrandTotal = testTaxableAmount + testTotalTax;

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
    setDiscountPercent(
      roundTo2Decimals(Math.min(Math.max(bestDiscount, 0), 100))
    );
  };

  const debouncedGrandTotalChange = useMemo(
    () =>
      debounce((value) => {
        handleGrandTotalChange(value);
        typingRef.current = false;
      }, 500),
    [calculations.subTotal, calculations.totalTax, bankChargesEnabled]
  );

  useEffect(() => {
    if (!typingRef.current) {
      setManualGrandTotal(calculations.grandTotal.toFixed(2));
    }
  }, [calculations.grandTotal]);

  const validateForm = () => {
    if (!billTo) {
      notification.error({
        message: "Please select a client",
      });
      return false;
    }
    if (lineItemsCombined.length === 0) {
      notification.error({
        message: "Please add at least one item",
      });
      return false;
    }

    for (let i = 0; i < lineItemsCombined.length; i++) {
      const item = lineItemsCombined[i];
      const kind = item.kind || "SERVICE";
      if (kind === "SERVICE") {
        if (!item.serviceId) {
          notification.error({
            message: `Please select a service for item ${i + 1}`,
          });
          return false;
        }
      } else {
        if (!item.inventoryItemId) {
          notification.error({
            message: `Please select an inventory item for item ${i + 1}`,
          });
          return false;
        }
        if (!item.inventoryBatchId && !item.inventoryBatchNumber) {
          notification.error({
            message: `Please select a batch for item ${i + 1}`,
          });
          return false;
        }
      }
      if (!item.qty || item.qty <= 0) {
        notification.error({
          message: `Please enter a valid quantity for item ${i + 1}`,
        });
        return false;
      }

      if (kind === "INVENTORY") {
        const batches = batchesByItemId[item.inventoryItemId] || [];
        const b = batches.find((x) => x.id === item.inventoryBatchId);
        const onHand = Number(b?.quantityOnHand);
        const qty = Number(item.qty) || 0;
        if (Number.isFinite(onHand) && qty > onHand) {
          notification.error({
            message: `Quantity exceeds on-hand for item ${i + 1}`,
            description: `Selected batch has ${onHand} on hand, but this line has quantity ${qty}.`,
          });
          return false;
        }
      }
      if (item.rate === undefined || item.rate < 0) {
        notification.error({
          message: `Please enter a valid rate for item ${i + 1}`,
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Basic validations
      const selectedOrgId = localStorage.getItem("selectedOrgId");
      if (!selectedOrgId) {
        notification.error({
          message: "Organization not selected",
        });
        setLoading(false);
        setRefresh(Math.random());
        return;
      }

      // Client selection validation
      if (!billTo || !billTo.id) {
        notification.error({
          message: "Client selection is mandatory",
        });
        setLoading(false);
        setRefresh(Math.random());
        return;
      }

      // Minimum one line item validation (service or inventory)
      if (!lineItemsCombined || lineItemsCombined.length === 0) {
        notification.error({
          message: "Add at least one service or inventory item",
        });
        setLoading(false);
        setRefresh(Math.random());
        return;
      }

      const hasAtLeastOneValidLine = lineItemsCombined.some((item) => {
        const kind = item.kind || "SERVICE";
        const qty = Number(item.qty) || 0;
        const rate = Number(item.rate) || 0;
        if (qty <= 0 || rate < 0) return false;
        if (kind === "SERVICE") {
          return !!item.serviceId && rate >= 0;
        }
        // INVENTORY
        return (
          !!item.inventoryItemId &&
          (!!item.inventoryBatchId || !!item.inventoryBatchNumber) &&
          rate >= 0
        );
      });

      if (!hasAtLeastOneValidLine) {
        notification.error({
          message:
            "At least one service or inventory item with valid quantity is required",
        });
        setLoading(false);
        setRefresh(Math.random());
        return;
      }

      // Grand total validation
      if (!calculations.grandTotal || Number(calculations.grandTotal) <= 0) {
        notification.error({
          message: "Grand total cannot be zero or negative",
        });
        setLoading(false);
        setRefresh(Math.random());
        return;
      }

      const formValues = await form.validateFields();

      // Debug log to check billFromText value before sending
      console.log("Submitting with billFromText:", billFromText);

      const invoiceDate = formValues.invoiceDate
        ? dayjs(formValues.invoiceDate).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD");
      const dueDateFormatted = formValues.dueDate
        ? dayjs(formValues.dueDate).format("YYYY-MM-DD")
        : null;

      const payload = {
        organization_id: selectedOrgId,
        client_id: billTo.id,
        invoice_date: invoiceDate,
        due_date: dueDateFormatted,
        sub_total: calculations.subTotal,
        discount_amount: calculations.discountAmount,
        discount_percentage: discountPercent,
        taxable_after_discount: calculations.taxableAfterDiscount,
        total_cgst: calculations.totalCGST,
        total_sgst: calculations.totalSGST,
        total_igst: calculations.totalIGST,
        total_tax: calculations.totalTax,
        //shipping_charges: shippingCharges || 0,
        bankCharges: bankChargesEnabled
          ? String(calculations.bankCharges)
          : null,
        //bankCharges: bankChargesEnabled || 0,
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
        line_items: lineItemsCombined.map((item, index) => {
          const taxDetails = getLineItemTaxDetails(item, index);
          const kind = item.kind || "SERVICE";
          const isInv = kind === "INVENTORY";
          return {
            line_kind: kind,
            ...(kind === "SERVICE"
              ? {
                service_id: item.serviceId,
                service_name:
                  services.find((s) => s.id === item.serviceId)?.name || "",
              }
              : {
                inventory_item_id: item.inventoryItemId,
                inventory_batch_id: item.inventoryBatchId,
                inventory_batch_number: item.inventoryBatchNumber,
                service_name:
                  inventoryCatalog.find((x) => x.id === item.inventoryItemId)
                    ?.name || item.description || "",
              }),
            description: item.description,
            quantity: Number(item.qty) || 0,
            rate: Number(item.rate) || 0,
            amount: taxDetails.lineAmount,
            gst_percentage: isInv ? 0 : Number(item.gst || 0),
            line_discount_share: taxDetails.lineDiscountShare,
            taxable_amount: taxDetails.taxableLineAmount,
            cgst_amount: isInv ? 0 : taxDetails.cgst,
            sgst_amount: isInv ? 0 : taxDetails.sgst,
            igst_amount: isInv ? 0 : taxDetails.igst,
            total_tax_amount: isInv ? 0 : taxDetails.totalLineTax,
            final_amount: taxDetails.finalAmount,
          };
        }),
      };
      if (editData && editData.id) {
        console.log("should update");
        payload.id = editData.id;
      }

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

      notification.success({
        message: `${type} ${result.data?.invoice_number || ""} ${editData ? "updated" : "created"
          } successfully!`,
      });
      setRefresh(Math.random());

      onClose();
    } catch (error) {
      console.error("Error submitting invoice:", error);
      notification.error({
        message: error.response.data.message,
      });
      notification.error({
        message:
          error.message ||
          `Failed to ${editData ? "update" : "create"} ${type}`,
      });
    } finally {
      setRefresh(Math.random());
      setLoading(false);
    }
  };

  const serviceColumns = [
    {
      title: "#",
      width: 44,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Service",
      width: 220,
      render: (_, record, index) => (
        <Select
          value={record.serviceId}
          placeholder="Select service"
          onChange={(val) => handleServiceChange(index, val)}
          style={{ width: "100%" }}
          showSearch
          optionFilterProp="children"
          allowClear
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
      title: "Qty",
      dataIndex: "qty",
      width: 88,
      render: (qty, record, index) => (
        <InputNumber
          value={qty}
          onChange={(value) => handleServiceQtyChange(index, value)}
          parser={(val) => {
            const raw = String(val ?? "");
            const cleaned = raw.replace(/[^\d.]/g, "");
            const n = Number(cleaned);
            if (!cleaned) return "";
            if (!Number.isFinite(n)) return "";
            return cleaned;
          }}
          min={1}
          step={1}
          controls={false}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Rate",
      dataIndex: "rate",
      width: 108,
      render: (rate, record, index) => (
        <InputNumber
          value={rate}
          onChange={(value) => handleServiceFieldChange(index, "rate", value || 0)}
          min={0}
          step={0.01}
          formatter={(value) =>
            `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          controls={false}
          parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "GST %",
      dataIndex: "gst",
      width: 72,
      render: (gst) => (
        <Tag color="blue">{Number(gst ?? 0)}%</Tag>
      ),
    },
    {
      title: "Amount",
      width: 100,
      render: (_, record) => (
        <strong>
          ₹
          {((record.qty || 0) * (record.rate || 0)).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}
        </strong>
      ),
    },
    {
      title: "After discount",
      width: 112,
      render: (_, record, index) => {
        const taxDetails = getLineItemTaxDetails(record, index);
        return (
          <strong className="text-gw-primary-dark">
            ₹
            {taxDetails.taxableLineAmount.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </strong>
        );
      },
    },
    ...(billTo?.state &&
      orgState &&
      billTo.state.toUpperCase() === orgState.toUpperCase()
      ? [
        {
          title: "CGST",
          width: 80,
          render: (_, record, index) => {
            const taxDetails = getLineItemTaxDetails(record, index);
            return (
              <span className="text-xs text-gray-500">
                ₹
                {taxDetails.cgst.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </span>
            );
          },
        },
        {
          title: "SGST",
          width: 80,
          render: (_, record, index) => {
            const taxDetails = getLineItemTaxDetails(record, index);
            return (
              <span className="text-xs text-gray-500">
                ₹
                {taxDetails.sgst.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </span>
            );
          },
        },
      ]
      : [
        {
          title: "IGST",
          width: 80,
          render: (_, record, index) => {
            const taxDetails = getLineItemTaxDetails(record, index);
            return (
              <span className="text-xs text-gray-500">
                ₹
                {taxDetails.igst.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </span>
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
      width: 120,
      render: (_, record, index) => {
        const taxDetails = getLineItemTaxDetails(record, index);
        return (
          <strong className="text-green-600">
            ₹
            {taxDetails.finalAmount.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </strong>
        );
      },
    },
    {
      title: "",
      width: 48,
      render: (_, __, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeServiceLine(index)}
        />
      ),
    },
  ];

  const inventoryColumns = [
    {
      title: "#",
      width: 44,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Item",
      width: 220,
      render: (_, record, index) => (
        <Select
          value={record.inventoryItemId}
          placeholder="Select inventory item"
          onChange={(val) => handleInventoryItemChange(index, val)}
          style={{ width: "100%" }}
          showSearch
          onSearch={handleInventorySearch}
          filterOption={false}
          loading={inventoryLoading}
          allowClear
          notFoundContent="No inventory items"
          optionFilterProp="children"
        >
          {inventoryCatalog.map((it) => (
            <Option key={it.id} value={it.id}>
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate">
                  {it.name} {it.sku ? `(${it.sku})` : ""}
                </span>
                <span className="shrink-0 text-xs text-gray-500">
                  {it.quantity} on hand
                </span>
              </div>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Batch",
      width: 240,
      render: (_, record, index) => {
        if (!record.inventoryItemId) return <span className="text-gray-400">Select item</span>;
        const batches = batchesByItemId[record.inventoryItemId] || [];
        const loadingBatches = !!batchesLoadingByItemId[record.inventoryItemId];
        const takenElsewhere = inventoryBatchIdsUsedElsewhere(
          inventoryItems,
          record.inventoryItemId,
          index
        );
        const batchOptions = batches.filter(
          (b) => !takenElsewhere.has(b.id) || b.id === record.inventoryBatchId
        );
        return (
          <Select
            value={record.inventoryBatchId}
            placeholder="Select batch"
            onChange={(val) => handleInventoryBatchChange(index, val)}
            style={{ width: "100%" }}
            loading={loadingBatches}
            disabled={loadingBatches}
            showSearch
            optionFilterProp="label"
            options={batchOptions.map((b) => {
              const sp =
                b.sellingPrice != null && Number(b.sellingPrice) > 0
                  ? ` @ ₹${Number(b.sellingPrice).toFixed(2)}`
                  : "";
              return {
                value: b.id,
                label: `${b.batchNumber} — ${b.quantityOnHand} on hand${sp}${b.expiryDate
                  ? ` — exp ${dayjs(b.expiryDate).format("YYYY-MM-DD")}`
                  : ""
                  }`,
              };
            })}
          />
        );
      },
    },
    {
      title: "Qty",
      dataIndex: "qty",
      width: 88,
      render: (qty, record, index) => {
        let max;
        if (record.inventoryItemId && record.inventoryBatchId) {
          const batches = batchesByItemId[record.inventoryItemId] || [];
          const b = batches.find((x) => x.id === record.inventoryBatchId);
          const onHand = Number(b?.quantityOnHand);
          if (Number.isFinite(onHand)) max = onHand;
        }
        return (
          <InputNumber
            value={qty}
            onChange={(value) => handleInventoryQtyChange(index, value)}
            parser={(val) => {
              const raw = String(val ?? "");
              const cleaned = raw.replace(/[^\d.]/g, "");
              const n = Number(cleaned);
              if (!cleaned) return "";
              if (!Number.isFinite(n)) return "";
              if (Number.isFinite(max)) return String(Math.min(n, max));
              return cleaned;
            }}
            min={1}
            max={max}
            step={1}
            controls={false}
            style={{ width: "100%" }}
          />
        );
      },
    },
    {
      title: "Rate",
      dataIndex: "rate",
      width: 108,
      render: (rate, record, index) => (
        <InputNumber
          value={rate}
          onChange={(value) =>
            handleInventoryFieldChange(index, "rate", value || 0)
          }
          min={0}
          step={0.01}
          formatter={(value) =>
            `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          controls={false}
          parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "MRP",
      width: 88,
      render: (_, record) => {
        if (!record.inventoryItemId || !record.inventoryBatchId) {
          return <span className="text-gray-400">—</span>;
        }
        const batches = batchesByItemId[record.inventoryItemId] || [];
        const b = batches.find((x) => x.id === record.inventoryBatchId);
        const mrp = b != null ? Number(b.mrp) : NaN;
        if (!Number.isFinite(mrp) || mrp <= 0) {
          return <span className="text-gray-400">—</span>;
        }
        return (
          <span>
            ₹
            {mrp.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      title: "Amount",
      width: 100,
      render: (_, record) => (
        <strong>
          ₹
          {((record.qty || 0) * (record.rate || 0)).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}
        </strong>
      ),
    },
    {
      title: "After discount",
      width: 112,
      render: (_, record, index) => {
        const combinedIndex = serviceItems.length + index;
        const taxDetails = getLineItemTaxDetails(record, combinedIndex);
        return (
          <strong className="text-gw-primary-dark">
            ₹
            {taxDetails.taxableLineAmount.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </strong>
        );
      },
    },
    {
      title: "Total",
      width: 100,
      render: (_, record, index) => {
        const combinedIndex = serviceItems.length + index;
        const taxDetails = getLineItemTaxDetails(record, combinedIndex);
        return (
          <strong className="text-green-600">
            ₹
            {taxDetails.finalAmount.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </strong>
        );
      },
    },
    {
      title: "",
      width: 48,
      render: (_, __, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeInventoryLine(index)}
        />
      ),
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width="min(1350px, calc(100vw - 24px))"
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
      centered
      styles={{
        content: {
          top: 2,
        },
        body: {
          padding: 0,
          maxHeight: "min(calc(100vh - 120px), calc(100dvh - 120px))",
          overflow: "hidden",
        },
      }}
      title={
        <Space>
          <FileTextOutlined />
          {editData ? "Edit" : "Generate"}
          {type === "invoice" ? "Invoice" : "Quotation"}
        </Space>
      }
      destroyOnClose
    >
      <div
        className="box-border px-3 py-4 sm:p-6"
        style={{
          maxHeight: "min(calc(100vh - 140px), calc(100dvh - 140px))",
          overflowY: "auto",
        }}
      >
        <Form form={form} layout="vertical" size="large">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
            {/* Bill From - Organization Information */}
            <Card
              title={
                <Space>
                  <UserOutlined />
                  Bill From
                </Space>
              }
              size="small"
              bodyStyle={{ padding: "12px" }}
            >
              {billFromText ? (
                <div className="whitespace-pre-line text-sm">
                  {billFromText}
                </div>
              ) : (
                <div className="text-gray-400 italic">
                  Organization information will appear here
                </div>
              )}
            </Card>

            <Card
              title={
                <Space>
                  <UserOutlined />
                  Bill To
                </Space>
              }
              size="small"
              bodyStyle={{ padding: "12px" }}
            >
              <Form.Item
                name="billTo"
                label="Select Client"
                rules={[{ required: true, message: "Please select a client" }]}
                style={{ marginBottom: "12px" }}
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
                <Form.Item
                  label="Client Information"
                  style={{ marginBottom: 0 }}
                >
                  <TextArea
                    value={billToText}
                    onChange={(e) => setBillToText(e.target.value)}
                    placeholder="Client information will appear here. You can edit it as needed."
                    rows={4}
                    className="text-sm"
                  />
                </Form.Item>
              )}
            </Card>
          </div>

          <Divider style={{ margin: "16px 0" }} />

          {/* Line items: services (GST) and inventory (no GST, per API) */}
          <Card
            title={
              <Space>
                <DollarOutlined />
                Services
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addServiceLine}
                size="small"
              >
                Add service
              </Button>
            }
            className="mb-4"
            bodyStyle={{ padding: "12px" }}
          >
            <p className="mb-3 text-sm text-gray-500">
              Service lines include GST in totals. Bill discount applies across services and
              inventory.
            </p>
            <div style={{ overflowX: "auto" }}>
              <DataTable
                columns={serviceColumns}
                dataSource={serviceItems}
                pagination={false}
                rowKey={(record, index) => record.id || `svc-${index}`}
                size="small"
                scroll={{ x: "max-content" }}
                style={{ minWidth: "720px" }}
              />
            </div>
          </Card>

          <Card
            title={
              <Space>
                <DollarOutlined />
                Inventory
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addInventoryLine}
                size="small"
              >
                Add inventory
              </Button>
            }
            className="mb-4"
            bodyStyle={{ padding: "12px" }}
          >
            <p className="mb-3 text-sm text-gray-500">
              Inventory lines are billed without GST: total = rate × quantity minus share of
              bill discount. Default rate comes from the selected batch when available.
            </p>
            <div style={{ overflowX: "auto" }}>
              <DataTable
                columns={inventoryColumns}
                dataSource={inventoryItems}
                pagination={false}
                rowKey={(record, index) => record.id || `inv-${index}`}
                size="small"
                scroll={{ x: "max-content" }}
                style={{ minWidth: "720px" }}
              />
            </div>
          </Card>

          <Divider style={{ margin: "16px 0" }} />

          {/* Bottom Section - Notes and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Additional Information */}
            <Card
              title="Additional Information"
              size="small"
              bodyStyle={{ padding: "12px" }}
            >
              <Form.Item
                name="notes"
                label="Notes"
                style={{ marginBottom: "12px" }}
              >
                <TextArea
                  rows={3}
                  placeholder="Add any additional notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Form.Item>

              <Form.Item
                name="terms"
                label="Terms & Conditions"
                style={{ marginBottom: "12px" }}
              >
                <TextArea
                  rows={2}
                  placeholder="Payment terms and conditions..."
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                />
              </Form.Item>

              <div className="rounded-md border border-gray-200 bg-gray-50/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 min-h-[32px]">
                  <span className="text-sm font-medium text-gray-800">
                    Advanced Options
                  </span>
                  <Switch
                    checked={showAdvanced}
                    onChange={setShowAdvanced}
                    checkedChildren="Show"
                    unCheckedChildren="Hide"
                  />
                </div>

                {showAdvanced && (
                  <div className="mt-3 border-t border-gray-200 pt-3 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      <span className="text-sm text-gray-700">
                        Bank Charges (2%)
                      </span>
                      <Switch
                        checked={bankChargesEnabled}
                        onChange={setBankChargesEnabled}
                        checkedChildren="On"
                        unCheckedChildren="Off"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      <span className="text-sm text-gray-700">Round Off</span>
                      <Switch
                        checked={roundOff}
                        onChange={setRoundOff}
                        checkedChildren="Yes"
                        unCheckedChildren="No"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Summary */}
            <Card title="Summary" size="small" bodyStyle={{ padding: "12px" }}>
              <div className="text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span>Sub Total:</span>
                  <strong>
                    ₹
                    {calculations.subTotal.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span>Discount:</span>
                    <InputNumber
                      value={discountPercent}
                      onChange={(value) =>
                        setDiscountPercent(roundTo2Decimals(value || 0))
                      }
                      min={0}
                      max={100}
                      precision={2}
                      formatter={(value) => `${value}%`}
                      parser={(value) => value.replace("%", "")}
                      size="small"
                      className="w-16"
                    />
                  </div>
                  <span className="text-red-600">
                    -₹
                    {calculations.discountAmount.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
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

                {/* {showAdvanced && shippingCharges > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Shipping:</span>
                    <span>
                      ₹
                      {shippingCharges.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )} */}

                {showAdvanced &&
                  bankChargesEnabled &&
                  calculations.bankCharges > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Bank Charges (2%):</span>
                      <span>
                        ₹
                        {calculations.bankCharges.toLocaleString("en-IN", {
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
                      className="w-32 font-bold"
                      size="small"
                    />
                  </Tooltip>
                </div>
              </div>
            </Card>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
