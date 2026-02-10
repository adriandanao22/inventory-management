import Navbar from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import Link from "next/link";
import { Card } from "@/src/components/card";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "For individuals and small teams getting started.",
    features: [
      "Up to 100 items",
      "Basic analytics",
      "Email support",
      "1 location",
    ],
    cta: "Get Started",
    href: "/trial",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29/mo",
    description: "For growing businesses that need more power.",
    features: [
      "Unlimited items",
      "Advanced analytics",
      "Priority support",
      "Up to 5 locations",
      "Barcode scanning",
    ],
    cta: "Start Free Trial",
    href: "/trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Contact Us",
    description: "For large teams and custom requirements.",
    features: [
      "Unlimited items & locations",
      "Custom integrations",
      "Dedicated manager",
      "API access",
      "Custom onboarding",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen min-w-full dark:bg-gray-700">
      <Navbar />
      <main className="flex flex-col min-h-screen w-full bg-[#e3eaff] dark:bg-gray-800 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Choose the plan that fits your business. No hidden fees, no
            surprises.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`rounded-xl border ${
                plan.highlight
                  ? "border-indigo-600 shadow-2xl bg-white dark:bg-gray-600"
                  : "border-gray-200 bg-white dark:bg-gray-700"
              } p-8 flex flex-col items-center transition-all h-full`}
            >
              <div className="flex flex-col items-center w-full flex-1">
                <h2 className="text-2xl font-bold mb-2 dark:text-white">
                  {plan.name}
                </h2>
                <div className="text-3xl font-extrabold mb-2 text-indigo-600">
                  {plan.price}
                </div>
                <p className="mb-6 text-gray-700 dark:text-gray-300 text-center">
                  {plan.description}
                </p>
                <ul className="mb-8 space-y-2 text-gray-700 dark:text-gray-200 text-left w-full max-w-xs mx-auto">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={plan.href}
                className={`w-full text-center px-6 py-3 rounded-md font-semibold transition-colors mt-auto ${
                  plan.highlight
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-white border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                {plan.cta}
              </Link>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
