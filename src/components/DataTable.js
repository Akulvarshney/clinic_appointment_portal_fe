import { Table } from "antd";

const TABLE_CLASS =
  "gw-data-table max-w-full rounded-xl border border-gray-200 shadow-md overflow-hidden " +
  "[&_.ant-table]:rounded-xl " +
  "[&_.ant-table-thead>tr>th]:bg-gw-primary-dark " +
  "[&_.ant-table-thead>tr>th]:text-white " +
  "[&_.ant-table-thead>tr>th]:font-semibold " +
  "[&_.ant-table-thead>tr>th]:text-center " +
  "[&_.ant-table-tbody>tr>td]:text-gray-700 " +
  "[&_.ant-table-tbody>tr>td]:text-sm";

/** Shared pagination copy and controls for every table. */
function uniformShowTotal(total, range) {
  if (typeof total !== "number") return null;
  if (Array.isArray(range) && range.length === 2) {
    const [start, end] = range;
    if (start != null && end != null) {
      return `${start}–${end} of ${total}`;
    }
  }
  return `Total ${total}`;
}

function normalizePagination(pagination) {
  if (pagination === false) return false;

  const policy = {
    pageSize: 10,
    showSizeChanger: false,
    showQuickJumper: false,
    hideOnSinglePage: false,
    showTotal: uniformShowTotal,
  };

  if (pagination == null || pagination === true) {
    return policy;
  }

  return {
    ...policy,
    ...pagination,
    showSizeChanger: false,
    showQuickJumper: false,
    hideOnSinglePage: false,
    showTotal: uniformShowTotal,
  };
}

function stripedRowClass(record, index) {
  return index % 2 === 0
    ? "bg-gray-50 hover:bg-gray-100 transition"
    : "bg-white hover:bg-gray-100 transition";
}

function mergeScroll(scroll) {
  if (scroll === false) return undefined;
  const fromProp = scroll && typeof scroll === "object" ? scroll : {};
  return {
    ...fromProp,
    x: fromProp.x != null ? fromProp.x : "max-content",
  };
}

function mergeRowClassName(striped, rowClassName) {
  if (!striped && rowClassName == null) return undefined;

  return (record, index) => {
    const parts = [];
    if (striped) parts.push(stripedRowClass(record, index));
    if (rowClassName != null) {
      if (typeof rowClassName === "function") {
        const extra = rowClassName(record, index);
        if (extra) parts.push(extra);
      } else {
        parts.push(rowClassName);
      }
    }
    const merged = parts.filter(Boolean).join(" ");
    return merged || undefined;
  };
}

/**
 * App-wide Ant Design Table with consistent header, borders, row striping, and pagination.
 * Forwards other Table props; set `pagination={false}` to hide. Override `pageSize` / `current` / `total` / `onChange` as needed.
 */
function DataTable({
  className,
  rowClassName,
  bordered = false,
  striped = false,
  pagination,
  scroll,
  ...rest
}) {
  return (
    <Table
      {...rest}
      bordered={bordered}
      pagination={normalizePagination(pagination)}
      scroll={mergeScroll(scroll)}
      className={[TABLE_CLASS, className].filter(Boolean).join(" ")}
      rowClassName={mergeRowClassName(striped, rowClassName)}
    />
  );
}

export default DataTable;
