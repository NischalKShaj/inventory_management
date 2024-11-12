// <============================ file to parse the xlsx file ==============>

// importing the required modules
import * as XLSX from "xlsx";

// fetching the data
export const fetchExcelData = async (filePath: string) => {
  const response = await fetch(filePath);
  const blob = await response.blob();

  const file = await blob.arrayBuffer();

  const workBook = XLSX.read(file, { type: "array" });

  const sheetName = workBook.SheetNames[0];
  const sheet = workBook.Sheets[sheetName];

  return XLSX.utils.sheet_to_json(sheet);
};
