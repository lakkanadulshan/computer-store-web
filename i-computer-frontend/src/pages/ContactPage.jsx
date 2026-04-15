import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const backendUrl = import.meta.env.VITE_backend_URL;
    if (!backendUrl) {
      toast.error("Backend URL is not configured");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      message: formData.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/contact`, payload, {
        timeout: 15000,
      });

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        message: "",
      });
      toast.success(response.data?.message || "Message sent successfully");
    } catch (error) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(backendMessage || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-primary text-text">
      <div className="relative overflow-hidden">
        <div className="absolute -left-32 top-6 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto grid w-full max-w-6xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:py-16">
          <article className="fade-in-up rounded-2xl border border-white/10 bg-secondary/70 p-6 sm:p-7">
            <p className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-300">
              Contact
            </p>
            <h1 className="font-heading text-3xl leading-tight sm:text-4xl">Let’s build your next machine.</h1>
            <p className="mt-3 text-sm text-muted sm:text-base">
              Send us your requirements and we will recommend products that match your performance and budget goals.
            </p>

            <div className="mt-6 space-y-3 text-sm text-muted">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-primary/70 px-4 py-3">
                <FaEnvelope className="text-cyan-300" />
                support@apextech.com
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-primary/70 px-4 py-3">
                <FaPhoneAlt className="text-cyan-300" />
                +94 77 123 4567
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-primary/70 px-4 py-3">
                <FaMapMarkerAlt className="text-cyan-300" />
                21 Innovation Avenue, Colombo
              </div>
            </div>
          </article>

          <form
            onSubmit={handleSubmit}
            className="fade-in-up rounded-2xl border border-white/10 bg-secondary/70 p-6 shadow-xl shadow-black/20 sm:p-7"
            style={{ animationDelay: "80ms" }}
          >
            <h2 className="font-heading text-xl">Send a message</h2>
            <div className="mt-4 space-y-4">
              <label className="block text-sm text-muted">
                Full Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-primary/80 px-3 py-2 text-text outline-none transition focus:border-cyan-400"
                  placeholder="Your name"
                />
              </label>

              <label className="block text-sm text-muted">
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-primary/80 px-3 py-2 text-text outline-none transition focus:border-cyan-400"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block text-sm text-muted">
                Message
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-primary/80 px-3 py-2 text-text outline-none transition focus:border-cyan-400"
                  placeholder="Tell us what you are looking for"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-primary transition hover:brightness-110"
            >
              {loading ? "Sending..." : "Submit Inquiry"}
            </button>

            {submitted ? (
              <p className="mt-3 text-center text-sm text-cyan-300">Thanks! We will get back to you soon.</p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
