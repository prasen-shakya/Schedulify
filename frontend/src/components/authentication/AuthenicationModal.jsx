import { useState } from "react";

const AuthenticationModal = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(isLogin ? "Logging in with" : "Registering with", formData);
    document.getElementById("authentication-modal").close();
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
          <label className="form-control w-full">
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
          </label>

          <label className="form-control w-full">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="input input-bordered w-full"
              required
              onChange={handleChange}
              value={formData.password}
            />
          </label>

          <button type="submit" className="btn btn-primary mt-3">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </dialog>
  );
};

export default AuthenticationModal;
