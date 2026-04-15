import { Link } from "react-router-dom";
import { FaBolt, FaShieldAlt, FaShippingFast } from "react-icons/fa";

const highlights = [
  {
    title: "Performance First",
    description:
      "We source and build hardware stacks that stay cool, stable, and fast under real workload pressure.",
    icon: FaBolt,
  },
  {
    title: "Trusted Components",
    description:
      "Every product listed is vetted for reliability, warranty support, and long-term compatibility.",
    icon: FaShieldAlt,
  },
  {
    title: "Quick Fulfillment",
    description:
      "From order to delivery, we optimize logistics so your setup arrives ready for your next project.",
    icon: FaShippingFast,
  },
];

export default function AboutPage() {
  return (
    <section className="w-full bg-primary text-text">
      <div className="tech-grid relative overflow-hidden">
        <div className="absolute -left-16 top-12 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-14 sm:px-6 lg:py-16">
          <header className="fade-in-up max-w-2xl">
            <p className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-300">
              About ApexTech
            </p>
            <h1 className="font-heading text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Built for builders, creators, and serious performance.
            </h1>
            <p className="mt-4 text-sm text-muted sm:text-base">
              ApexTech started with one mission: make premium computing hardware easier to discover, compare, and trust. We blend practical specs with clean buying experiences so you can spend less time browsing and more time building.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="fade-in-up rounded-2xl border border-white/10 bg-secondary/70 p-5 shadow-xl shadow-black/20"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
                    <Icon />
                  </div>
                  <h2 className="font-heading text-lg">{item.title}</h2>
                  <p className="mt-2 text-sm text-muted">{item.description}</p>
                </article>
              );
            })}
          </div>

          <div className="fade-in-up rounded-2xl border border-white/10 bg-linear-to-r from-secondary to-slate-900/80 p-6 sm:p-7">
            <h2 className="font-heading text-2xl">Let us help with your next setup.</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Need guidance on laptops, gaming rigs, workstation builds, or accessories? Our team can help you pick the right performance profile for your budget.
            </p>
            <div className="mt-5">
              <Link
                to="/contact"
                className="inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary transition hover:brightness-110"
              >
                Talk to our team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
