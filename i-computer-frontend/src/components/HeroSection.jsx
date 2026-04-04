import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-secondary p-6 shadow-xl shadow-black/30 sm:p-10">
      <div className="tech-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="fade-in-up">
          <p className="mb-3 inline-flex rounded-full border border-white/10 bg-hover px-3 py-1 text-xs font-medium text-accent">
            High Performance Components
          </p>
          <h1 className="font-heading text-4xl leading-tight text-text sm:text-5xl">
            Build Your Next
            <span className="bg-linear-to-r from-accent to-accent-2 bg-clip-text text-transparent"> Dream Rig</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted sm:text-base">
            Shop premium PCs, components, and accessories with fast checkout and trusted support for gamers, professionals, and everyday users.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-primary transition duration-200 hover:brightness-110 active:scale-[0.98]"
            >
              Shop Products
            </Link>
            <Link
              to="/contact"
              className="rounded-lg border border-white/15 bg-transparent px-5 py-3 text-sm font-medium text-text transition duration-200 hover:bg-hover active:scale-[0.98]"
            >
              Contact Sales
            </Link>
          </div>
        </div>

        <div className="fade-in-up relative">
          <div className="rounded-2xl border border-white/10 bg-primary/60 p-6">
            <img src="/logo.png" alt="Featured setup" className="mx-auto h-44 w-44 object-contain sm:h-52 sm:w-52" />
            <p className="mt-4 text-center text-xs font-medium tracking-wide text-muted">
              PERFORMANCE SERIES 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
