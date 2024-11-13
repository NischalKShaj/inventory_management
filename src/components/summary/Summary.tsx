/* eslint-disable @typescript-eslint/no-explicit-any */
// <============================ file for the summary of the inventory ===================>

// importing the required modules
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { fetchExcelData } from "../../utils/excelParser";
import Graphs from "../graph/Graphs";
import Table from "../table/Table";
import CompleteData from "../completeData/CompleteData";
import "@fortawesome/fontawesome-free/css/all.min.css";

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

  // calculate the current page's products
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = data.slice(indexOfFirstProduct, indexOfLastProduct);

  // handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDownloadPdf = async () => {
    const toggleElements = (display: string) => {
      ["download-button", "table-container"].forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          element.style.display = display;
        }
      });
    };

    try {
      toggleElements("none");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // PDF dimension constants
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margins = {
        top: 15,
        bottom: 15,
        left: 20,
        right: 20,
        content: 10,
      };

      // create front page
      const createFrontPage = () => {
        const centerX = pageWidth / 2;

        let yPosition = pageHeight / 3;

        // main title
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(24);
        pdf.text("Inventory Summary Report", centerX, yPosition, {
          align: "center",
        });

        // decorative line
        yPosition += 10;
        pdf.setLineWidth(0.5);
        pdf.line(centerX - 40, yPosition, centerX + 40, yPosition);

        // subtitle or department name
        yPosition += 15;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(16);
        pdf.text("Quarterly Overview", centerX, yPosition, { align: "center" });

        // date and time
        yPosition += 25;
        pdf.setFontSize(12);
        const today = new Date();
        pdf.text(
          today.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          centerX,
          yPosition,
          { align: "center" }
        );

        // time
        yPosition += 8;
        pdf.text(
          today.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          centerX,
          yPosition,
          { align: "center" }
        );

        const bottomY = pageHeight - margins.bottom - 20;
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "italic");
        pdf.text("Confidential Document", centerX, bottomY, {
          align: "center",
        });
      };

      // Create the front page
      createFrontPage();

      // Reset yPosition for content pages
      let yPosition = margins.top;

      // Helper function to add content to PDF
      const addContentToPdf = async (
        elementId: string,
        options: {
          scale?: number;
          title?: string;
          addPageBreak?: boolean;
        } = {}
      ) => {
        const element = document.getElementById(elementId);
        if (!element) {
          console.warn(`Element with id '${elementId}' not found`);
          return;
        }

        // generate high-quality image of the content first to get dimensions
        const canvas = await html2canvas(element, {
          scale: options.scale || 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - (margins.left + margins.right);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // calculate total required height including title and content
        const titleHeight = options.title ? 20 : 0;
        const totalRequiredHeight = titleHeight + imgHeight + margins.content;

        if (yPosition + totalRequiredHeight > pageHeight - margins.bottom) {
          pdf.addPage();
          yPosition = margins.top;
        }

        if (options.title) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(16);
          pdf.text(options.title, pageWidth / 2, yPosition, {
            align: "center",
          });
          yPosition += 15;
        }

        pdf.addImage(
          imgData,
          "PNG",
          margins.left,
          yPosition,
          imgWidth,
          imgHeight
        );

        yPosition += imgHeight + margins.content;

        if (options.addPageBreak) {
          pdf.addPage();
          yPosition = margins.top;
        }
      };

      // add content sections with titles
      await addContentToPdf("summary-container", {
        scale: 2,
        title: "Summary Statistics",
      });

      await addContentToPdf("graphs-container", {
        scale: 2,
        title: "Graphical Analysis",
      });

      try {
        pdf.save("inventory-summary.pdf");
      } catch (error) {
        console.error("Error saving PDF:", error);
        alert("There was an error generating the PDF. Please try again.");
      }

      toggleElements("block");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
      toggleElements("block");
    }
  };

  return (
    <div id="summary-container" className="relative container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Inventory Summary</h1>

      <button
        onClick={handleDownloadPdf}
        id="download-button"
        className="absolute top-24 right-6 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      >
        <i className="fas fa-file-pdf mr-2"></i> Download PDF
      </button>

      <CompleteData data={data} />

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
