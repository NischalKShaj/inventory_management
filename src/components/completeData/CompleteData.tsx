/* eslint-disable @typescript-eslint/no-explicit-any */
// <=============================== file to show the entire data and filtered one =================>

// importing the required modules
import React, { useState } from "react";

interface Data {
  data: any[];
}

// for converting to proper dates
const excelDateToJSDate = (serial: number) => {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  return new Date(utcValue * 1000);
};

const CompleteData: React.FC<Data> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const itemsPerPage = 4;

  // filter data based on OrderDate range
  const filteredData = data.filter((item) => {
    const orderDate = excelDateToJSDate(item.OrderDate);
    if (startDate && new Date(startDate) > orderDate) return false;
    if (endDate && new Date(endDate) < orderDate) return false;
    return true;
  });

  // calculating the current products page
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredData.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // handling the page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex space-x-4">
        <div>
          <label className="block text-gray-700 font-medium">Start Date</label>
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1"
            value={startDate || ""}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">End Date</label>
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1"
            value={endDate || ""}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <table className="min-w-full border-collapse border border-gray-300 bg-white shadow-lg rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Region Name
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Country Name
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              State
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              City
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Postal Code
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Warehouse Address
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Warehouse Name
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Employee Name
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Employee Email
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Employee Phone
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Employee Hire Date
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Employee Job Title
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Category Name
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Product Name
            </th>
            <th className="py-4 px-6 min-w-[550px] border-b text-left text-gray-700 font-semibold">
              Product Description
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Product Standard Cost
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Profit
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Product List Price
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Vendor Name
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Vendor Address
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Customer Credit Limit
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Vendor Email
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Vendor Phone
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Status
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Order Date
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Order Item Quantity
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Per Unit Price
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Available Quantity
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              Product Id
            </th>
            <th className="py-4 px-6 min-w-[150px] border-b text-left text-gray-700 font-semibold">
              GRN Number
            </th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((item, index) => (
            <tr
              key={index}
              className={`${
                index % 2 === 0 ? "bg-gray-100" : "bg-white"
              } hover:bg-gray-50`}
            >
              <td className="py-2 px-4 border-b">{item.RegionName}</td>
              <td className="py-2 px-4 border-b">{item.CountryName}</td>
              <td className="py-2 px-4 border-b">{item.State}</td>
              <td className="py-2 px-4 border-b">{item.City}</td>
              <td className="py-2 px-4 border-b">{item.PostalCode}</td>
              <td className="py-2 px-4 border-b">{item.WarehouseAddress}</td>
              <td className="py-2 px-4 border-b">{item.WarehouseName}</td>
              <td className="py-2 px-4 border-b">{item.EmployeeName}</td>
              <td className="py-2 px-4 border-b">{item.EmployeeEmail}</td>
              <td className="py-2 px-4 border-b">{item.EmployeePhone}</td>
              <td className="py-2 px-4 border-b">
                {excelDateToJSDate(item.EmployeeHireDate).toLocaleDateString()}
              </td>
              <td className="py-2 px-4 border-b">{item.EmployeeJobTitle}</td>
              <td className="py-2 px-4 border-b">{item.CategoryName}</td>
              <td className="py-2 px-4 border-b">{item.ProductName}</td>
              <td className="py-2 px-4 border-b">{item.ProductDescription}</td>
              <td className="py-2 px-4 border-b">{item.ProductStandardCost}</td>
              <td className="py-2 px-4 border-b">{item.Profit}</td>
              <td className="py-2 px-4 border-b">{item.ProductListPrice}</td>
              <td className="py-2 px-4 border-b">{item.VendorName}</td>
              <td className="py-2 px-4 border-b">{item.VendorAddress}</td>
              <td className="py-2 px-4 border-b">{item.CustomerCreditLimit}</td>
              <td className="py-2 px-4 border-b">{item.VendorEmail}</td>
              <td className="py-2 px-4 border-b">{item.VendorPhone}</td>
              <td className="py-2 px-4 border-b">{item.Status}</td>
              <td className="py-2 px-4 border-b">
                {excelDateToJSDate(item.OrderDate).toLocaleDateString()}
              </td>
              <td className="py-2 px-4 border-b">{item.OrderItemQuantity}</td>
              <td className="py-2 px-4 border-b">{item.PerUnitPrice}</td>
              <td className="py-2 px-4 border-b">{item.AvaliableQuantity}</td>
              <td className="py-2 px-4 border-b">{item.ProductId}</td>
              <td className="py-2 px-4 border-b">{item.GRNNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={() => currentPage > 1 && paginate(currentPage - 1)}
          className={`px-4 py-2 rounded ${
            currentPage === 1
              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
              : "bg-blue-500 text-white"
          }`}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
              : "bg-blue-500 text-white"
          }`}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CompleteData;
