import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-brand-light flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-brand-darkRose mb-2">
        AuraFit Dashboard
      </h1>
      <p className="text-sm text-neutral-600 mb-6">
        Generate your customized 7-day routine and VTO preview from the main planner.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-brand-rose hover:bg-brand-darkRose text-white font-medium text-sm rounded-xl transition duration-200 shadow"
      >
        Back to Home Planner
      </Link>
    </main>
  );
}