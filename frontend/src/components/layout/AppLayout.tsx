import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.js";
import { Navbar } from "./Navbar.js";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
