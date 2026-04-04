import { FaDesktop, FaHeadset, FaKeyboard, FaMicrochip, FaPlug } from "react-icons/fa";

const categories = [
  { title: "Gaming PCs", icon: FaDesktop },
  { title: "Processors", icon: FaMicrochip },
  { title: "Peripherals", icon: FaKeyboard },
  { title: "Accessories", icon: FaHeadset },
  { title: "Cables & Power", icon: FaPlug },
];

export default function CategoryGrid() {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-2xl text-text sm:text-3xl">Shop By Category</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((item) => (
          <article
            key={item.title}
            className="group rounded-2xl border border-white/10 bg-secondary p-5 transition duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-[0_8px_32px_rgba(0,194,255,0.12)]"
          >
            <item.icon className="text-2xl text-accent" />
            <h3 className="mt-3 text-base font-medium text-text">{item.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
