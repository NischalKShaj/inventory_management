import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import SummaryPage from "./components/summary/Summary";
import ReportPage from "./components/report/Report";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen">
        <aside className="bg-primary text-primary-foreground w-64 p-4 fixed top-0 left-0 h-full">
          <h1 className="text-2xl font-bold mb-8">Netlabs</h1>
          <nav className="flex flex-col space-y-4">
            <Link
              to="/"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Summary
            </Link>
            <Link
              to="/reports"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Reports
            </Link>
          </nav>
        </aside>

        <main className="flex-grow bg-gray-100 p-4 ml-64">
          <Routes>
            <Route path="/" element={<SummaryPage />} />
            <Route path="/reports" element={<ReportPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
