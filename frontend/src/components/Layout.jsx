import { Outlet } from "react-router";
import { Navbar } from "./Navbar";

const Layout = () => {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default Layout;