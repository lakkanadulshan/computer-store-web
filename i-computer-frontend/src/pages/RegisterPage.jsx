import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function register(event) {
    event.preventDefault();

    if (!firstName.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
    };

    try {
      await axios.post(`${import.meta.env.VITE_backend_URL}/users/register`, payload);
      toast.success("Account created successfully. Please log in.");
      navigate("/login");
    } catch (error) {
      const fallbackMessage = "Registration failed. Please try again.";
      const backendMessage = error?.response?.data?.message;

      if (error?.response?.status === 404) {
        try {
          await axios.post(`${import.meta.env.VITE_backend_URL}/users/signup`, payload);
          toast.success("Account created successfully. Please log in.");
          navigate("/login");
          return;
        } catch (secondError) {
          toast.error(secondError?.response?.data?.message || fallbackMessage);
          return;
        }
      }

      toast.error(backendMessage || fallbackMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-primary text-text lg:flex">
      <div className="relative h-64 w-full lg:h-auto lg:w-1/2">
        <img
          src="/bg-img.jpg"
          alt="Computer shop display"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-secondary/70 via-secondary/50 to-transparent" />
        <div className="relative flex h-full w-full items-center justify-center px-8 lg:justify-start lg:px-12">
          <p className="max-w-md text-2xl font-semibold text-text lg:text-3xl">
            Create your account and unlock smoother checkout for every setup.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-secondary p-8 shadow-xl">
          <div className="space-y-2 text-center">
            <h1 className="font-heading text-3xl text-text">Create account</h1>
            <p className="text-sm text-muted">Sign up to start shopping with I-Computer.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={register}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium">
                  First name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="John"
                  className="w-full rounded-lg border border-white/15 bg-primary px-4 py-3 text-text shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Doe"
                  className="w-full rounded-lg border border-white/15 bg-primary px-4 py-3 text-text shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/15 bg-primary px-4 py-3 text-text shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-lg border border-white/15 bg-primary px-4 py-3 text-text shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                Confirm password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-lg border border-white/15 bg-primary px-4 py-3 text-text shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-primary shadow-md transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-accent hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
