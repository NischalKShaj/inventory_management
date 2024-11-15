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
import Backorder from "../backeorder/Backorder";

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
  const [products, setProducts] = useState<string[]>([]);
  const [selectedProducts, setSelectedProduct] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      const response = await fetchExcelData("/data/inventoryData.xlsx");
      setData(response);
      const categorySet = new Set(
        response.map((item: any) => item.CategoryName)
      );
      setCategory(Array.from(categorySet));

      const productSet = new Set(response.map((item: any) => item.ProductName));
      setProducts(Array.from(productSet));
    };
    loadData();
  }, []);

  const today = Date.now();

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(e.target.value);
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

    // filter data based on selected category
    const filteredData = data.filter(
      (item) => item.CategoryName === selectedCategory
    );

    filteredData.forEach((item) => {
      const orderDate = new Date(excelDateToJSDate(item.OrderDate).toString());
      const availableQty = item.AvaliableQuantity || 0;

      const daysInStock = Math.floor(
        (today - orderDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // update the category report based on days in stock
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

    // return the calculated category age report
    return categoryAgeReport;
  };

  // calculating the ageing report
  const categoryAge: any = selectedCategory ? calculateAgeReport() : {};

  // calculating the aging
  const productAgeingReport = () => {
    const productAgeReport = {
      "0-30 Days": 0,
      "31-60 Days": 0,
      "61-90 Days": 0,
      "91-120 Days": 0,
      Others: 0,
    };

    // filter data based on product
    const filteredData = data.filter(
      (item) => item.ProductName === selectedProducts
    );

    filteredData.forEach((item) => {
      const orderDate = new Date(excelDateToJSDate(item.OrderDate).toString());
      const availableQty = item.AvaliableQuantity || 0;

      const daysInStock = Math.floor(
        (today - orderDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // update the category report based on days in stock
      if (daysInStock <= 30) {
        productAgeReport["0-30 Days"] += availableQty;
      } else if (daysInStock <= 60) {
        productAgeReport["31-60 Days"] += availableQty;
      } else if (daysInStock <= 90) {
        productAgeReport["61-90 Days"] += availableQty;
      } else if (daysInStock <= 120) {
        productAgeReport["91-120 Days"] += availableQty;
      } else {
        productAgeReport["Others"] += availableQty;
      }
    });
    return productAgeReport;
  };

  const productAge: any = selectedProducts ? productAgeingReport() : {};

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
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const stockQuantity = context.raw;
            return `${context.dataset.label}: ${stockQuantity} Stock Quantity`;
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Stock Quantity",
        },
        beginAtZero: true,
      },
      x: {
        title: {
          display: true,
          text: "Age Range (Days)",
        },
      },
    },
  };

  // setting the data for the product
  const productChartData = {
    labels: ["0-30 Days", "31-60 Days", "61-90 Days", "91-120 Days", "Others"],
    datasets: [
      {
        label: `Inventory Ageing Report for the product:${selectedProducts}`,
        data: [
          productAge["0-30 Days"],
          productAge["31-60 Days"],
          productAge["61-90 Days"],
          productAge["91-120 Days"],
          productAge["Others"],
        ],
        backgroundColor: "#4caf50",
        borderColor: "#388e3c",
        borderWidth: 1,
      },
    ],
  };

  // setting the options for the category
  const productChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Inventory Aging by Product",
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const stockQuantity = context.raw;
            return `${context.dataset.label}: ${stockQuantity} Stock Quantity`;
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Stock Quantity",
        },
        beginAtZero: true,
      },
      x: {
        title: {
          display: true,
          text: "Age Range (Days)",
        },
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Inventory Analysis Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Inventory Aging Report</h2>
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
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <div className="w-full h-[300px]">
              {categoryChartData && (
                <Bar data={categoryChartData} options={categoryChartOptions} />
              )}
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="select-product"
              className="block text-sm font-semibold mb-2"
            >
              Choose a Product:
            </label>
            <select
              id="product-select"
              value={selectedProducts}
              onChange={handleProductChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Product</option>
              {products.map((product, index) => (
                <option key={index} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <div className="w-full h-[300px]">
              {productChartData && (
                <Bar data={productChartData} options={productChartOptions} />
              )}
            </div>
          </div>
        </div>

        <Backorder data={data} />
      </div>
    </div>
  );
};

export default Report;
