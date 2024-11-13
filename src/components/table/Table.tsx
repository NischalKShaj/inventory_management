/* eslint-disable @typescript-eslint/no-explicit-any */
// <================================= file to show the tabular data ==================>

// importing the required modules
import React, { useMemo } from "react";
import { Column, useTable } from "react-table";
import * as XLSX from "xlsx";
import "@fortawesome/fontawesome-free/css/all.min.css";

// function to convert json to xlsx
const handleDownloadXML = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, fileName);

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.xlsx`;
  link.click();
};

// helper function for conversion
const s2ab = (s: string) => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);

  for (let i = 0; i !== s.length; ++i) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
};

interface CategoryData {
  category: string;
  totalOrderQty: number;
  totalAvailableQty: number;
}

interface WarehouseData {
  warehouse: string;
  totalOrderQty: number;
  totalAvailableQty: number;
  shipped: number;
  received: number;
}

interface Data {
  data: any[];
}

const Table: React.FC<Data> = ({ data }) => {
  // for categories
  const categoryData = useMemo(() => {
    const categoryMap: Record<
      string,
      { totalOrderQty: number; totalAvailableQty: number }
    > = {};

    data.forEach((item) => {
      const category = item.CategoryName;
      const orderQty = item.OrderItemQuantity || 0;
      const availableQty = item.AvaliableQuantity || 0;

      if (!categoryMap[category]) {
        categoryMap[category] = { totalOrderQty: 0, totalAvailableQty: 0 };
      }
      categoryMap[category].totalOrderQty += orderQty;
      categoryMap[category].totalAvailableQty += availableQty;
    });

    return Object.entries(categoryMap).map(([category, value]) => ({
      category,
      totalOrderQty: value.totalOrderQty,
      totalAvailableQty: value.totalAvailableQty,
    }));
  }, [data]);

  const columns: Column<CategoryData>[] = useMemo(
    () => [
      {
        Header: "Category",
        accessor: "category",
      },
      {
        Header: "Total Order Quantity",
        accessor: "totalOrderQty",
      },
      {
        Header: "Total Available Quantity",
        accessor: "totalAvailableQty",
      },
    ],
    []
  );

  const tableInstance = useTable({ columns, data: categoryData });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  // for warehouse
  const warehouseData = useMemo(() => {
    const warehouseMap: Record<
      string,
      {
        totalOrderQty: number;
        totalAvailableQty: number;
        shipped: number;
        received: number;
      }
    > = {};

    data.map((item) => {
      const warehouse = item.WarehouseName;
      const orderQty = item.OrderItemQuantity || 0;
      const availableQty = item.AvaliableQuantity || 0;
      const status = item.Status;

      if (!warehouseMap[warehouse]) {
        warehouseMap[warehouse] = {
          totalOrderQty: 0,
          totalAvailableQty: 0,
          shipped: 0,
          received: 0,
        };
      }
      warehouseMap[warehouse].totalOrderQty += orderQty;
      warehouseMap[warehouse].totalAvailableQty += availableQty;

      if (status === "Shipped") {
        warehouseMap[warehouse].shipped += orderQty;
      } else if (status === "Received") {
        warehouseMap[warehouse].received += orderQty;
      }
    });

    return Object.entries(warehouseMap).map(([warehouse, value]) => ({
      warehouse,
      totalOrderQty: value.totalOrderQty,
      totalAvailableQty: value.totalAvailableQty,
      shipped: value.shipped,
      received: value.received,
    }));
  }, [data]);

  const warehouseColumns: Column<WarehouseData>[] = useMemo(
    () => [
      {
        Header: "Warehouse",
        accessor: "warehouse",
      },
      {
        Header: "Total Order Quantity",
        accessor: "totalOrderQty",
      },
      {
        Header: "Total Available Quantity",
        accessor: "totalAvailableQty",
      },
      {
        Header: "Shipped Quantity",
        accessor: "shipped",
      },
      {
        Header: "Received Quantity",
        accessor: "received",
      },
    ],
    []
  );

  const warehouseInstance = useTable({
    columns: warehouseColumns,
    data: warehouseData,
  });

  const {
    getTableProps: getWarehouseTableProps,
    getTableBodyProps: getWarehouseTableBodyProps,
    headerGroups: warehouseHeaderGroups,
    rows: warehouseRows,
    prepareRow: prepareWarehouseRow,
  } = warehouseInstance;

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4">Category-wise Summary</h1>
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table
          {...getTableProps()}
          className="min-w-full border-collapse border border-gray-300 bg-white"
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className="bg-gray-200"
              >
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps()}
                    className="py-2 px-4 border-b text-left text-gray-700 font-semibold"
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="hover:bg-gray-50">
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className="border-b border-gray-300 px-4 py-2 text-gray-700"
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          onClick={() => handleDownloadXML(categoryData, "CategoryData")}
          className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold text-sm rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          <i className="fas fa-download mr-2"></i> Download Excel (Category)
        </button>
      </div>

      <h1 className="text-lg font-semibold mt-8 mb-4">
        Warehouse-wise Summary
      </h1>
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table
          {...getWarehouseTableProps()}
          className="min-w-full border-collapse border border-gray-300 bg-white"
        >
          <thead>
            {warehouseHeaderGroups.map((headerGroup) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className="bg-gray-200"
              >
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps()}
                    className="py-2 px-4 border-b text-left text-gray-700 font-semibold"
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getWarehouseTableBodyProps()}>
            {warehouseRows.map((row) => {
              prepareWarehouseRow(row);
              return (
                <tr {...row.getRowProps()} className="hover:bg-gray-50">
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className="border-b border-gray-300 px-4 py-2 text-gray-700"
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          onClick={() => handleDownloadXML(warehouseData, "WarehouseData")}
          className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold text-sm rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          <i className="fas fa-download mr-2"></i>Download Excel (Warehouse)
        </button>
      </div>
    </div>
  );
};

export default Table;
