/* eslint-disable @typescript-eslint/no-explicit-any */
// <=========================================== file to show the graphs =========================>

// importing the required modules
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

interface Data {
  data: any[];
}

// setting teh chart js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Graphs: React.FC<Data> = ({ data }) => {
  const [statusCount, setStatusCount] = useState({ received: 0, shipped: 0 });
  const [venderData, setVenderData] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filteredData, setFilteredData] = useState({
    totalOrderQty: 0,
    totalAvailableQty: 0,
    shipped: 0,
    received: 0,
  });

  useEffect(() => {
    // for setting status graph
    const statCount = data.reduce(
      (acc: { shipped: number; received: number }, item: any) => {
        if (item.Status === "Shipped") acc.shipped += 1;
        if (item.Status === "Received") acc.received += 1;
        return acc;
      },
      { shipped: 0, received: 0 }
    );
    setStatusCount(statCount);

    // for setting the orderQty and availableQty based on vendors
    const venderMap: Record<
      string,
      { totalOrderQuantity: number; totalAvailableQuantity: number }
    > = {};

    // grouping the data
    data.forEach((item) => {
      const vender = item.VendorName;
      const orderQty = item.OrderItemQuantity || 0;
      const availableQty = item.AvaliableQuantity || 0;

      if (!venderMap[vender]) {
        venderMap[vender] = {
          totalOrderQuantity: 0,
          totalAvailableQuantity: 0,
        };
      }
      venderMap[vender].totalOrderQuantity += orderQty;
      venderMap[vender].totalAvailableQuantity += availableQty;
    });

    // processing the data
    const processedData = Object.entries(venderMap).map(([vender, value]) => ({
      vender,
      totalOrderQuantity: value.totalOrderQuantity,
      totalAvailableQuantity: value.totalAvailableQuantity,
    }));
    setVenderData(processedData);

    // for setting the category
    const category = Array.from(new Set(data.map((item) => item.CategoryName)));
    setCategories(category);
    setSelectedCategory(category[0] || "");
  }, [data]);

  // use-effect for setting the category
  useEffect(() => {
    if (selectedCategory) {
      const categoryData = data.filter(
        (item) => item.CategoryName === selectedCategory
      );

      const totalOrderQty = categoryData.reduce(
        (sum, item) => sum + (item.OrderItemQuantity || 0),
        0
      );

      const totalAvailableQty = categoryData.reduce(
        (sum, item) => sum + (item.AvaliableQuantity || 0),
        0
      );

      const shipped = categoryData.filter(
        (item) => item.Status === "Shipped"
      ).length;

      const received = categoryData.filter(
        (item) => item.Status === "Received"
      ).length;
      setFilteredData({ totalOrderQty, totalAvailableQty, shipped, received });
    }
  }, [data, selectedCategory]);

  // for status
  const chartData = {
    labels: ["Shipped", "Received"],
    datasets: [
      {
        label: "Order Status",
        data: [statusCount.shipped, statusCount.received],
        backgroundColor: ["#3498db", "#2ecc71"],
        borderColor: ["#2980b9", "#27ae60"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Shipped vs Received",
      },
    },
    height: 400,
  };

  // for vendor's order quantity and available quantity
  const venderChartData = {
    labels: venderData.map((item) => item.vender),
    datasets: [
      {
        label: "Total Order Quantity",
        data: venderData.map((item) => item.totalOrderQuantity),
        backgroundColor: "#3498db",
        borderColor: "#2980b9",
        borderWidth: 1,
      },
      {
        label: "Total Available Quantity",
        data: venderData.map((item) => item.totalAvailableQuantity),
        backgroundColor: "#2ecc71",
        borderColor: "#27ae60",
        borderWidth: 1,
      },
    ],
  };

  const venderChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Vendor Wise: Total Order Quantity and Total Available Quantity",
      },
    },
    height: 400,
  };

  // for category
  const categoryChartData = {
    labels: ["Metrics"],
    datasets: [
      {
        label: "Total Order Qty",
        data: [filteredData.totalOrderQty],
        backgroundColor: "#3498db",
        borderColor: "#2980b9",
        borderWidth: 1,
        yAxisID: "y",
      },
      {
        label: "Total Available Qty",
        data: [filteredData.totalAvailableQty],
        backgroundColor: "#2ecc71",
        borderColor: "#27ae60",
        borderWidth: 1,
        yAxisID: "y",
      },
      {
        label: "Shipped",
        data: [filteredData.shipped],
        backgroundColor: "#f39c12",
        borderColor: "#d68910",
        borderWidth: 1,
        yAxisID: "y1",
      },
      {
        label: "Received",
        data: [filteredData.received],
        backgroundColor: "#e74c3c",
        borderColor: "#c0392b",
        borderWidth: 1,
        yAxisID: "y1",
      },
    ],
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Category Metrics for ${selectedCategory}`,
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Total Quantities",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Shipped/Received Count",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    height: 400,
  };

  // drop down for category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div className="flex flex-wrap justify-around gap-4 p-4">
      <div className="w-full md:w-[600px] h-[400px]">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div className="w-full md:w-[600px] h-[400px]">
        <Bar data={venderChartData} options={venderChartOptions} />
      </div>
      <div className="mb-4">
        <label
          htmlFor="select-category"
          className="block text-lg font-semibold mb-2"
        >
          Choose a Product Category:
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="p-2 border border-gray-300 rounded"
        >
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
        <div className="w-full md:w-[600px] h-[400px]">
          <Bar data={categoryChartData} options={categoryChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Graphs;
