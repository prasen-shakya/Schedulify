import { Outlet } from "react-router";
import { Navbar } from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default Layout;
