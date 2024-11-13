/* eslint-disable @typescript-eslint/no-explicit-any */
// <============================ file for the summary of the inventory ===================>

// importing the required modules
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { fetchExcelData } from "../../utils/excelParser";
import Graphs from "../graph/Graphs";
import Table from "../table/Table";

const Summary = () => {
  const [data, setData] = useState<any[]>([]);
  const [categoryCount, SetCategoryCont] = useState<any>(0);
  const [warehouseCount, setWarehouseCount] = useState<any>(0);
  const [productCount, setProductCount] = useState<any>(0);
  const [vendorCount, setVendorCount] = useState<any>(0);
  const [statusCount, setStatusCount] = useState({ received: 0, shipped: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      const response = await fetchExcelData("/data/inventoryData.xlsx");
      setData(response);
      // for category count
      const uniqueCategory = new Set(
        response.map((item: any) => item.CategoryName)
      );
      SetCategoryCont(uniqueCategory);

      // for warehouse count
      const uniqueWarehouse = new Set(
        response.map((item: any) => item.WarehouseName)
      );
      setWarehouseCount(uniqueWarehouse);

      // for total products
      const totalProduct = new Set(
        response.map((item: any) => item.ProductName)
      );
      setProductCount(totalProduct);

      // for total vendors
      const totalVendors = new Set(
        response.map((item: any) => item.VendorName)
      );
      setVendorCount(totalVendors);

      // for getting the status count
      const counts = response.reduce(
        (acc: { received: 0; shipped: 0 }, item: any) => {
          if (item.Status === "Shipped") acc.shipped += 1;
          if (item.Status === "Received") acc.received += 1;
          return acc;
        },
        { received: 0, shipped: 0 }
      );
      setStatusCount(counts);
    };

    loadData();
  }, []);

  // Calculate the current page's products
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = data.slice(indexOfFirstProduct, indexOfLastProduct);

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDownloadPdf = async () => {
    // Hide the table-container element
    const tableContainer = document.getElementById("table-container");
    if (tableContainer) {
      tableContainer.style.display = "none";
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;

    // Helper function to render a section on a new page
    const renderSection = async (elementId: string) => {
      const element = document.getElementById(elementId);
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
    };

    // Render counts summary on the first page
    await renderSection("summary-container");

    // Add a new page for graphs
    pdf.addPage();
    await renderSection("graphs-container");

    // Save the generated PDF
    pdf.save("inventory-summary.pdf");

    // Restore the visibility of the table-container element
    if (tableContainer) {
      tableContainer.style.display = "block";
    }
  };

  return (
    <div id="summary-container" className="relative container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Inventory Summary</h1>

      <button
        onClick={handleDownloadPdf}
        className="absolute top-8 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        download pdf
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-500 text-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold">Total Categories</h3>
          <p className="text-2xl font-bold">{categoryCount.size}</p>
        </div>
        <div className="bg-green-500 text-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold">Total Warehouses</h3>
          <p className="text-2xl font-bold">{warehouseCount.size}</p>
        </div>
        <div className="bg-yellow-500 text-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold">Total Products</h3>
          <p className="text-2xl font-bold">{productCount.size}</p>
        </div>
        <div className="bg-red-500 text-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold">Total Vendors</h3>
          <p className="text-2xl font-bold">{vendorCount.size}</p>
        </div>
        <div className="bg-purple-500 text-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold">Total Orders Shipped</h3>
          <p className="text-2xl font-bold">{statusCount.shipped}</p>
        </div>
        <div className="bg-indigo-500 text-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold">Total Orders Received</h3>
          <p className="text-2xl font-bold">{statusCount.received}</p>
        </div>
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full border-collapse border border-gray-300 bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border-b text-left text-gray-700 font-semibold">
                Product Name
              </th>
              <th className="py-2 px-4 border-b text-left text-gray-700 font-semibold">
                Order Item Quantity
              </th>
              <th className="py-2 px-4 border-b text-left text-gray-700 font-semibold">
                Available Quantity
              </th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((item: any, index: number) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                } hover:bg-gray-50`}
              >
                <td className="py-2 px-4 border-b">{item.ProductName}</td>
                <td className="py-2 px-4 border-b">{item.OrderItemQuantity}</td>
                <td className="py-2 px-4 border-b">{item.AvaliableQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          previous
        </button>
        <button
          onClick={() =>
            currentPage < Math.ceil(data.length / itemsPerPage) &&
            paginate(currentPage + 1)
          }
          className={`px-4 py-2 rounded ${
            currentPage === Math.ceil(data.length / itemsPerPage)
              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
              : "bg-blue-500 text-white"
          }`}
          disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
        >
          next
        </button>
      </div>
      <Graphs data={data} />
      <div id="table-container" className="mt-8">
        <Table data={data} />
      </div>
    </div>
  );
};

export default Summary;
