/* eslint-disable @typescript-eslint/no-explicit-any */
// <========================== file to calculate the backorder ===================>

// importing the required modules
import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Data {
  data: any[];
}

const Backorder: React.FC<Data> = ({ data }) => {
  const [categories, setCategory] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [backOrders, setBackOrders] = useState({});

  useEffect(() => {
    const category = Array.from(
      new Set(data.map((item: any) => item.CategoryName))
    );
    setCategory(category);
  }, [data]);

  // for calculating the backorder
  const calculateBackOrder = () => {
    const filterData = data.filter(
      (item: any) => item.CategoryName === selectedCategory
    );

    const backOrder = filterData.reduce((acc: any, item: any) => {
      if (item.OrderItemQuantity > item.AvaliableQuantity) {
        const backOrderQty = item.OrderItemQuantity - item.AvaliableQuantity;
        acc[item.ProductName] = (acc[item.ProductName] || 0) + backOrderQty;
      }
      return acc;
    }, {});

    setBackOrders(backOrder);
  };

  useEffect(() => {
    if (selectedCategory) {
      calculateBackOrder();
    }
  }, [selectedCategory]);

  // data for the backOrder
  const chartData = {
    labels: Object.keys(backOrders),
    datasets: [
      {
        data: Object.values(backOrders),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4CAF50",
          "#FF9F40",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4CAF50",
          "#FF9F40",
        ],
      },
    ],
  };

  // setting the options for the graph
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "right",
      },
      title: {
        display: true,
        text: `Backorders for ${selectedCategory}`,
      },
    },
  };

  return (
    <div>
      <div>
        <label htmlFor="category" className="block mb-2 font-medium">
          Select Category
        </label>
        <select
          id="category"
          className="p-2 border rounded w-full"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">-- select a category --</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && Object.keys(backOrders).length > 0 ? (
        <div className="w-full md:w-[600px] h-[400px] mx-auto mt-6">
          <Doughnut data={chartData} options={options} />
        </div>
      ) : selectedCategory ? (
        <p className="text-center mt-6 text-gray-500">
          No backorders found for the selected category.
        </p>
      ) : null}
    </div>
  );
};

export default Backorder;
