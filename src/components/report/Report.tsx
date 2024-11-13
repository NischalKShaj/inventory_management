/* eslint-disable @typescript-eslint/no-explicit-any */
// <============== component for showing the reports =====================>

// importing the required modules
import React, { useEffect, useState } from "react";
import { fetchExcelData } from "../../utils/excelParser";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// for converting to proper dates
const excelDateToJSDate = (serial: number) => {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  return new Date(utcValue * 1000);
};

const Report = () => {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategory] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      const response = await fetchExcelData("/data/inventoryData.xlsx");
      setData(response);
      const categorySet = new Set(
        response.map((item: any) => item.CategoryName)
      );
      setCategory(Array.from(categorySet)); // Set unique categories
    };
    loadData();
  }, []);

  const today = Date.now();

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  // for calculating the aging report for the categories
  const calculateAgeReport = () => {
    const categoryAgeReport = {
      "0-30 Days": 0,
      "31-60 Days": 0,
      "61-90 Days": 0,
      "91-120 Days": 0,
      Others: 0,
    };

    // Filter data based on selected category
    const filteredData = data.filter(
      (item) => item.CategoryName === selectedCategory
    );

    filteredData.forEach((item) => {
      const orderDate = new Date(excelDateToJSDate(item.OrderDate).toString());
      const availableQty = item.AvaliableQuantity || 0; // Default to 0 if not present

      const daysInStock = Math.floor(
        (today - orderDate.getTime()) / (1000 * 60 * 60 * 24)
      ); // Days in stock

      // Log values for debugging
      console.log("Order Date:", item.OrderDate, "Parsed Date:", orderDate);
      console.log("Days in Stock:", daysInStock, "Qty:", availableQty);

      // Update the category report based on days in stock
      if (daysInStock <= 30) {
        categoryAgeReport["0-30 Days"] += availableQty;
      } else if (daysInStock <= 60) {
        categoryAgeReport["31-60 Days"] += availableQty;
      } else if (daysInStock <= 90) {
        categoryAgeReport["61-90 Days"] += availableQty;
      } else if (daysInStock <= 120) {
        categoryAgeReport["91-120 Days"] += availableQty;
      } else {
        categoryAgeReport["Others"] += availableQty;
      }
    });

    // Return the calculated category age report
    return categoryAgeReport;
  };

  // calculating the ageing report
  const categoryAge: any = selectedCategory ? calculateAgeReport() : {};

  // setting the data for the category
  const categoryChartData = {
    labels: ["0-30 Days", "31-60 Days", "61-90 Days", "91-120 Days", "Others"],
    datasets: [
      {
        label: `Inventory Ageing Report for the category:${selectedCategory}`,
        data: [
          categoryAge["0-30 Days"],
          categoryAge["31-60 Days"],
          categoryAge["61-90 Days"],
          categoryAge["91-120 Days"],
          categoryAge["Others"],
        ],
        backgroundColor: "#4caf50",
        borderColor: "#388e3c",
        borderWidth: 1,
      },
    ],
  };

  // setting the options for the category
  const categoryChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Inventory Aging by Category",
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return `${context.dataset.label}: ${context.raw}`;
        },
      },
    },
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-6">
        Inventory Aging Report
      </h1>
      <div className="mb-4">
        <label
          htmlFor="select-category"
          className="block text-sm font-semibold mb-2"
        >
          Choose a Category:
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">Select Category</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <div className="w-full md:w-[600px] h-[400px]">
          <Bar data={categoryChartData} options={categoryChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Report;
