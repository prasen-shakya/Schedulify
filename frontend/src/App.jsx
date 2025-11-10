import axios from "axios";
import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { EventPage } from "./pages/EventPage";
import { Home } from "./pages/Home";

const App = () => {
  // Always send cookies with axios requests
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="event/:eventId" element={<EventPage />} />
          </Route>
          <Route
            path="*"
            element={
              <div className="flex h-screen w-screen flex-col items-center justify-center">
                <h1 className="mb-4 text-7xl font-bold">404</h1>
                <p className="mb-6 text-2xl">Page Not Found</p>
                <a href="/" className="btn">
                  Go to Home
                </a>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
