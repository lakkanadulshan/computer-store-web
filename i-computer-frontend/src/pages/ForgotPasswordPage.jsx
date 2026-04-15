import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const backendUrl = import.meta.env.VITE_backend_URL;

  async function handleSendOtp(event) {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    setSendingOtp(true);
    try {
      await axios.get(`${backendUrl}/users/send-otp/${encodeURIComponent(email.trim().toLowerCase())}`);
      setOtpSent(true);
      toast.success("OTP sent to your email.");
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to send OTP. Please try again.";
      toast.error(message);
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();

    if (!email.trim() || !otp.trim() || !newPassword.trim()) {
      toast.error("Email, OTP, and new password are required.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword: newPassword,
      };

      await axios.post(`${backendUrl}/users/validate-otp`, payload);
      toast.success("Password updated successfully. Please login.");
      navigate("/login");
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to update password. Please try again.";
      toast.error(message);
    } finally {
      setUpdatingPassword(false);
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
            Reset your password quickly and get back to building your setup.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-secondary p-8 shadow-xl">
          <div className="space-y-2 text-center">
            <h1 className="font-heading text-3xl text-text">Forgot password</h1>
            <p className="text-sm text-muted">Request OTP and set a new password.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={otpSent ? handleResetPassword : handleSendOtp}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
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

            {otpSent && (
              <>
                <div className="space-y-2">
                  <label htmlFor="otp" className="block text-sm font-medium">
                    OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full rounded-lg border border-white/15 bg-primary px-4 py-3 text-text shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium">
                    New password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-lg border border-white/15 bg-primary px-4 py-3 text-text shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium">
                    Confirm password
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
              </>
            )}

            {!otpSent ? (
              <button
                type="submit"
                disabled={sendingOtp}
                className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-primary shadow-md transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingOtp ? "Sending OTP..." : "Send OTP"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-primary shadow-md transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingPassword ? "Updating password..." : "Update password"}
              </button>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Remembered your password?{" "}
            <Link to="/login" className="font-semibold text-accent hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
