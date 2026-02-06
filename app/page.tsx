import Navbar from "@/src/components/navbar";
import { FaArrowRight, FaBell, FaBolt, FaChartBar } from "react-icons/fa";
import Footer from "@/src/components/footer";
import { CiBoxes, CiCircleCheck } from "react-icons/ci";
import { FaPlug, FaShield } from "react-icons/fa6";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen min-w-full dark:bg-gray-700">
      <Navbar />
      <main className="flex flex-col min-h-screen w-full">
        <div className="p-10 bg-[#e3eaff] dark:text-white dark:bg-gray-800">
          <h1 className="text-4xl font-bold max-w-md">
            Manage Your Inventory with Confidence
          </h1>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
            Streamline your stock management, track products in real-time, and
            make data-driven decisions with our powerful inventory management
            system.
          </p>
          <div className="mt-4 space-x-2">
            <Link
              href="#"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md inline-flex items-center"
            >
              Start Free Trial
              <FaArrowRight className="inline-block ml-1" />
            </Link>
            <Link
              href="/"
              className="bg-white hover:bg-gray-400 text-indigo-500 hover:text-indigo-600 border-indigo-500 hover:border-indigo-600 px-4 py-2 rounded-md border-2  inline-flex items-center"
            >
              Watch Demo
            </Link>
          </div>
        </div>
        <section id="features" className="py-20 lg:py-32">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Everything You Need
              </h2>
              <p className="text-xl max-w-2xl mx-auto">
                Powerful features designed to simplify your inventory management
                and boost productivity.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-8 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
                <h3 className="text-xl font-semibold mb-2">
                  <CiBoxes className="text-5xl text-white my-2 bg-indigo-600 rounded-md p-1.5" />
                  Real-Time Tracking
                </h3>
                <p>
                  Monitor your inventory levels across all locations in
                  real-time with automatic updates and alerts.
                </p>
              </div>
              <div className="p-8 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
                <h3 className="text-xl font-semibold mb-2">
                  <FaChartBar className="text-5xl text-white my-2 bg-indigo-600 rounded-md p-1.5" />
                  Analytics & Reports
                </h3>
                <p>
                  Get detailed insights with customizable reports and powerful
                  analytics and dashboards.
                </p>
              </div>
              <div className="p-8 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
                <h3 className="text-xl font-semibold mb-2">
                  <FaBell className="text-5xl text-white my-2 bg-indigo-600 rounded-md p-1.5" />
                  Smart Alerts
                </h3>
                <p>
                  Receive notifications for low stock, expiring items, and
                  reorder recommendations.
                </p>
              </div>
              <div className="p-8 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
                <h3 className="text-xl font-semibold mb-2">
                  <FaBolt className="text-5xl text-white my-2 bg-indigo-600 rounded-md p-1.5" />
                  Quick Operations
                </h3>
                <p>
                  Perform inventory tasks faster with barcode scanning and bulk
                  operations.
                </p>
              </div>
              <div className="p-8 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
                <h3 className="text-xl font-semibold mb-2">
                  <FaShield className="text-5xl text-white my-2 bg-indigo-600 rounded-md p-1.5" />
                  Secure & Reliable
                </h3>
                <p>
                  Enterprise-grade security with automatic backups and 99.9%
                  uptime guarantee.
                </p>
              </div>
              <div className="p-8 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
                <h3 className="text-xl font-semibold mb-2">
                  <FaPlug className="text-5xl text-white my-2 bg-indigo-600 rounded-md p-1.5" />
                  Easy Integration
                </h3>
                <p>
                  Connect seamlessly with your existing tools and platforms via
                  our API.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="benefits"
          className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-800"
        >
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 items-center gap-4">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Transform How You Manage Inventory
                </h2>
                <p className="text-xl mb-8">
                  Join thousands of business that have streamlined their
                  operations and increased their efficiency with InventoryPro
                </p>
                <div className="space-y-4">
                  <p className="flex items-center">
                    <CiCircleCheck className="text-green-500 text-2xl mr-1" />
                    Reduce stockouts by up to 80% with predictive analytics
                  </p>
                  <p className="flex items-center">
                    <CiCircleCheck className="text-green-500 text-2xl mr-1" />
                    Save 15+ hours per week on manual inventory tasks
                  </p>
                  <p className="flex items-center">
                    <CiCircleCheck className="text-green-500 text-2xl mr-1" />
                    Minimize waste with expiration date tracking
                  </p>
                  <p className="flex items-center">
                    <CiCircleCheck className="text-green-500 text-2xl mr-1" />
                    Improve accuracy with barcode scanning
                  </p>
                  <p className="flex items-center">
                    <CiCircleCheck className="text-green-500 text-2xl mr-1" />
                    Scale across multiple locations effortlessly
                  </p>
                  <p className="flex items-center">
                    <CiCircleCheck className="text-green-500 text-2xl mr-1" />
                    Access your inventory data anytime, anywhere
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-700">
                  <div className="absolute inset-0 bg-opacity-10 backdrop-blur-sm p-8">
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm">Total Items</span>
                        <span className="text-2xl font-bold">12,847</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm">Low Stock Alert</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          3 items
                        </span>
                      </div>
                      <p className="text-sm">Reorder recommended</p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg mb-4">
                      <span className="text-sm block mb-2">
                        Today&apos;s Activity
                      </span>
                      <div className="flex gap-4">
                        <div>
                          <div className="text-xl font-bold">+284</div>
                          <div className="text-xs">New Orders</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold">-156</div>
                          <div className="text-xs">Items Out</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 lg:py-32 bg-indigo-600">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-indigo-100">
              Ready to Optimize Your Inventory?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Start your free 14-day trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/trial"
                className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Start Free Trial <FaArrowRight />
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 bg-transparent text-white rounded-lg border-2 border-white hover:bg-white hover:text-indigo-600 transition-colors"
              >
                Schedule a Demo
              </Link>
            </div>
            <p className="text-indigo-200 mt-6">
              Join 5,000+ businesses already using InventoryPro
            </p>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
