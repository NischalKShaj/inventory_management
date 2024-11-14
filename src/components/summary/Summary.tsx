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
      [
        "download-button",
        "table-container",
        "complete-data",
        "inventory-data",
      ].forEach((id) => {
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
      // pdf.addPage();

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
        const element = document.getElementById(elementId) as HTMLElement;
        if (!element) {
          console.warn(`Element with id '${elementId}' not found`);
          return;
        }

        try {
          // Ensure the element is visible before capturing
          element.style.display = "block";

          const canvas = await html2canvas(element, {
            scale: options.scale || 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
          });

          const imgData = canvas.toDataURL("image/png");
          const imgWidth = pageWidth - (margins.left + margins.right);
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

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
        } catch (error) {
          console.error(`Error processing element ${elementId}:`, error);
          alert(
            `Failed to process content for ${elementId}. Please try again.`
          );
        }
      };

      // Add summary section
      await addContentToPdf("summary-container", {
        scale: 2,
        title: "Summary Statistics",
      });

      // Improved graph layout function
      const addGraphsInRow = async () => {
        const graphContainer = document.getElementById("graphs-container");
        if (!graphContainer) {
          console.warn("Graph container not found");
          return;
        }

        // Add title for the graphs section
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text("Analysis Graphs", pageWidth / 2, yPosition, {
          align: "center",
        });
        yPosition += 15;

        const graphs = Array.from(graphContainer.querySelectorAll(".graph"));
        if (graphs.length === 0) {
          console.warn("No graphs found in container");
          return;
        }

        // Calculate dimensions for the row layout
        const availableWidth = pageWidth - (margins.left + margins.right);
        const graphWidth =
          (availableWidth - (graphs.length - 1) * 10) / graphs.length; // 10mm spacing between graphs

        const graphPromises = graphs.map(async (graphElement, index) => {
          if (!(graphElement instanceof HTMLElement)) {
            console.warn(`Graph element not found at index ${index}`);
            return null;
          }

          try {
            // Ensure element is properly rendered for canvas conversion
            graphElement.style.display = "block";

            const canvas = await html2canvas(graphElement, {
              scale: 2,
              useCORS: true,
              backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/png");
            const aspectRatio = canvas.height / canvas.width;
            const imgHeight = graphWidth * aspectRatio;

            console.log(`Graph ${index + 1}:`, {
              width: graphWidth,
              height: imgHeight,
              xPosition: margins.left + index * (graphWidth + 10),
              yPosition: yPosition,
            });

            return {
              imgData,
              width: graphWidth,
              height: imgHeight,
              x: margins.left + index * (graphWidth + 10),
            };
          } catch (error) {
            console.error(`Error processing graph ${index + 1}:`, error);
            alert(`Failed to process graph ${index + 1}. Please try again.`);
            return null;
          }
        });

        const graphsData = await Promise.all(graphPromises);

        const maxHeight = Math.max(
          ...graphsData.map((graph) => graph?.height ?? 0)
        );

        if (yPosition + maxHeight > pageHeight - margins.bottom) {
          pdf.addPage();
          yPosition = margins.top;
        }

        graphsData.forEach((graph) => {
          if (graph) {
            pdf.addImage(
              graph.imgData,
              "PNG",
              graph.x,
              yPosition,
              graph.width,
              graph.height
            );
          }
        });

        yPosition += maxHeight + margins.content;
      };

      // Add the graphs in a row
      await addGraphsInRow();

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
    <div
      id="summary-container"
      className="container mx-auto px-4 py-8 space-y-12"
    >
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Inventory Summary
        </h1>
        <p className="text-xl text-gray-600">
          Comprehensive overview of your inventory status
        </p>
      </header>

      <button
        onClick={handleDownloadPdf}
        id="download-button"
        className="absolute top-24 right-20 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 z-10"
      >
        <i className="fas fa-file-pdf mr-2"></i> Download PDF
      </button>
      <div id="complete-data">
        <CompleteData data={data} />
      </div>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-500 text-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105">
            <h3 className="text-xl font-semibold mb-2">Total Categories</h3>
            <p className="text-3xl font-bold">{categoryCount.size}</p>
          </div>
          <div className="bg-green-500 text-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105">
            <h3 className="text-xl font-semibold mb-2">Total Warehouses</h3>
            <p className="text-3xl font-bold">{warehouseCount.size}</p>
          </div>
          <div className="bg-yellow-500 text-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105">
            <h3 className="text-xl font-semibold mb-2">Total Products</h3>
            <p className="text-3xl font-bold">{productCount.size}</p>
          </div>
          <div className="bg-red-500 text-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105">
            <h3 className="text-xl font-semibold mb-2">Total Vendors</h3>
            <p className="text-3xl font-bold">{vendorCount.size}</p>
          </div>
          <div className="bg-purple-500 text-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105">
            <h3 className="text-xl font-semibold mb-2">Total Orders Shipped</h3>
            <p className="text-3xl font-bold">{statusCount.shipped}</p>
          </div>
          <div className="bg-indigo-500 text-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105">
            <h3 className="text-xl font-semibold mb-2">
              Total Orders Received
            </h3>
            <p className="text-3xl font-bold">{statusCount.received}</p>
          </div>
        </div>
      </section>

      <section className="mb-12" id="inventory-data">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Product Inventory
        </h2>
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Order Item Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Available Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentProducts.map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.ProductName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.OrderItemQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.AvaliableQuantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            }`}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            onClick={() =>
              currentPage < Math.ceil(data.length / itemsPerPage) &&
              paginate(currentPage + 1)
            }
            className={`px-4 py-2 rounded ${
              currentPage === Math.ceil(data.length / itemsPerPage)
                ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            }`}
            disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
          >
            Next
          </button>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Graphical Analysis
        </h2>
        <Graphs data={data} />
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Detailed Inventory Tables
        </h2>
        <div id="table-container">
          <Table data={data} />
        </div>
      </section>
    </div>
  );
};

export default Summary;
