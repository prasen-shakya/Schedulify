import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./components/Layout";
import { Home } from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
        <Route
          path="*"
          element={
            <div className="flex flex-col justify-center items-center h-screen w-screen">
              <h1 className="font-bold text-7xl mb-4">404</h1>
              <p className="text-2xl mb-6">Page Not Found</p>
              <a href="/" className="btn">
                Go to Home
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
