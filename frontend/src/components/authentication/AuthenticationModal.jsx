import useAuth from "@/hooks/useAuth";
import { useState } from "react";

const AuthenticationModal = () => {
  const { signIn, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let success = false;

    if (isLogin) {
      success = await signIn(formData.email, formData.password);
    } else {
      success = await register(
        formData.name,
        formData.email,
        formData.password,
      );
    }

    if (success == "success") {
      document.getElementById("authentication-modal").close();
      setError("");
    } else {
      setError(success.message || "An error occurred. Please try again.");
    }
  };

  return (
    <dialog id="authentication-modal" className="modal">
      <div className="modal-box relative max-w-sm">
        {/* Close button */}
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2">
            ✕
          </button>
        </form>

        {/* Header */}
        <div className="mb-4 flex flex-col items-center gap-2">
          <h3 className="text-2xl font-semibold">
            {isLogin ? "Login" : "Register"}
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              className={`btn btn-sm ${isLogin ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              type="button"
              className={`btn btn-sm ${!isLogin ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="input input-bordered w-full"
              required
              onChange={handleChange}
              value={formData.name}
              autoComplete="off"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input input-bordered w-full"
            required
            onChange={handleChange}
            value={formData.email}
            autoComplete="off"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input input-bordered w-full"
            required
            onChange={handleChange}
            value={formData.password}
          />

          {error && <p className="text-error text-sm">{error}</p>}

          <button type="submit" className="btn btn-primary mt-3">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </dialog>
  );
};

export default AuthenticationModal;
