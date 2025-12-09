// File: project-manara-AI/client/src/pages/Subscription/Subscription.jsx
import TopBar from "@/components/Layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Check,
  Crown,
  Sparkles,
  Star,
  Download,
  CreditCard,
  AlertCircle,
  X,
} from "lucide-react";
import { useState } from "react";

// Same color palette as Pricing Page
const PRIMARY_COLORS = {
  primary: "#937c60",
  darkPrimary: "#7a654f",
  lightPrimary: "#b8a58c",
  veryLight: "#f5f0ec",
};

const PLANS = [
  {
    id: "luxury",
    name: "Luxury",
    icon: Crown,
    tagline: "Comprehensive whole home transformation",
    price: "AED 24,999",
    originalPrice: "AED 34,999",
    color: "#937c60",
    gradient: "from-[#937c60] to-[#7a654f]",
    lightColor: "#f5f0ec",
    buttonColor: "bg-[#937c60] hover:bg-[#7a654f]",
    description: "Complete home design with dedicated project management.",
    features: [
      "Whole Home Design (4+ Rooms)",
      "Premium AI Features & 3D Renders",
      "Curated Material Lists with UAE Suppliers",
      "Dedicated Installation Professional Network",
      "Budget: up to 40K AED",
      "24/7 VIP Support",
      "Project Manager Assigned",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    icon: Sparkles,
    tagline: "Great value for multiple rooms",
    price: "AED 15,999",
    originalPrice: "AED 22,999",
    color: "#7a654f",
    gradient: "from-[#7a654f] to-[#61503f]",
    lightColor: "#f0e8e0",
    buttonColor: "bg-[#7a654f] hover:bg-[#61503f]",
    description: "Advanced design features for multiple rooms.",
    features: [
      "2-3 Rooms Complete Design",
      "Advanced AI Mood Boards & 3D Renders",
      "Material Lists with UAE Suppliers",
      "Installation Professional Contacts",
      "Budget: Up to 25K AED",
      "24/7 Priority Support",
    ],
  },
  {
    id: "essential",
    name: "Essential",
    icon: Star,
    tagline: "Perfect for single room transformations",
    price: "AED 8,999",
    originalPrice: "AED 12,999",
    color: "#b8a58c",
    gradient: "from-[#b8a58c] to-[#937c60]",
    lightColor: "#f8f4f0",
    buttonColor: "bg-[#b8a58c] hover:bg-[#937c60]",
    description: "Complete design solution for a single room.",
    features: [
      "1 Room Complete Design",
      "AI Mood Boards & 3D Renders",
      "Material Lists with UAE Suppliers",
      "Installation Professional Contacts",
      "Budget: Up to 15K AED",
      "Email Support",
    ],
  },
];

// Decorative elements - same as Pricing Page
const Decorations = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-[#937c60]/15 to-[#7a654f]/15 blur-3xl -translate-y-1/2"></div>
    <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-[#b8a58c]/15 to-[#937c60]/15 blur-3xl translate-y-1/2"></div>

    <motion.div
      className="absolute top-24 left-10 opacity-50"
      animate={{ y: [-5, 5, -5], rotate: [0, 5, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
    >
      <Star size={24} className="text-[#937c60]" />
    </motion.div>

    <motion.div
      className="absolute bottom-32 right-10 opacity-50"
      animate={{ y: [5, -5, 5], rotate: [0, -5, 0] }}
      transition={{
        repeat: Infinity,
        duration: 4,
        ease: "easeInOut",
        delay: 1,
      }}
    >
      <Crown size={24} className="text-[#7a654f]" />
    </motion.div>

    <motion.div
      className="absolute top-1/2 right-16 opacity-50"
      animate={{ y: [-8, 8, -8], rotate: [0, 10, 0] }}
      transition={{
        repeat: Infinity,
        duration: 5,
        ease: "easeInOut",
        delay: 0.5,
      }}
    >
      <Sparkles size={20} className="text-[#b8a58c]" />
    </motion.div>
  </div>
);

// Feature check item - same as Pricing Page
const FeatureItem = ({ children, color }) => (
  <div className="flex items-start gap-3 py-1.5 group">
    <div className="shrink-0 mt-0.5">
      <div
        className="rounded-full p-1 transition-colors"
        style={{ backgroundColor: `${color}20` }}
      >
        <Check size={16} style={{ color }} />
      </div>
    </div>
    <span className="text-gray-700 group-hover:text-gray-900 transition-colors text-sm">
      {children}
    </span>
  </div>
);

// Success Message Component
const SuccessMessage = ({ message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
  >
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg">
      <div className="flex-shrink-0">
        <Check size={20} className="text-green-600" />
      </div>
      <p className="text-green-800 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 text-green-600 hover:text-green-800"
      >
        <X size={18} />
      </button>
    </div>
  </motion.div>
);

// Current Plan Overview Section
const CurrentPlanSection = ({ currentPlan, onChangePlan, onCancel }) => {
  const plan = PLANS.find((p) => p.id === currentPlan) || PLANS[0];
  const { name, icon: Icon, color, gradient } = plan;
  const [autoRenew, setAutoRenew] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 mb-16"
    >
      <Card className="overflow-hidden">
        <div
          className="p-8 text-white rounded"
          style={{
            background: `linear-gradient(to right, ${color}, ${color}dd)`,
          }}
        >
          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Icon size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{name} Plan</h2>
                <p className="text-white/80 mt-1">
                  Current active subscription
                </p>
              </div>
            </div>
            <Badge className="py-2 px-3 bg-white/20 text-white border-white/30 border text-sm font-semibold">
              Active
            </Badge>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Renewal Date */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-gray-600 text-sm mb-2">Renewal Date</p>
              <p className="text-lg md:text-xl font-semibold text-gray-900">
                Jan 15, 2025
              </p>
              <p className="text-xs text-gray-500 mt-1">in 37 days</p>
            </motion.div>

            {/* Billing Cycle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-gray-600 text-sm mb-2">Billing Cycle</p>
              <p className="text-lg md:text-xl font-semibold text-gray-900">
                Annual
              </p>
              <p className="text-xs text-gray-500 mt-1">Renews yearly</p>
            </motion.div>

            {/* Amount */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-gray-600 text-sm mb-2">Next Payment</p>
              <p className="text-lg md:text-xl font-semibold" style={{ color }}>
                AED 24,999
              </p>
              <p className="text-xs text-gray-500 mt-1">on Jan 15, 2025</p>
            </motion.div>

            {/* Auto Renew */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col"
            >
              <p className="text-gray-600 text-sm mb-3">Auto Renew</p>
              <div className="flex items-center gap-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 rounded-full transition-colors peer-checked:bg-[#937c60] bg-gray-400/50">
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 ${
                        !autoRenew && "translate-x-5"
                      }`}
                    ></div>
                  </div>
                </label>
                <span className="text-sm font-medium text-gray-700">
                  {autoRenew ? "Enabled" : "Disabled"}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-6 border-t border-gray-200">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1"
            >
              <Button
                className={`w-full py-5 md:py-6 text-white border-none ${plan.buttonColor}`}
                onClick={onChangePlan}
              >
                Change Plan
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1"
            >
              <Button
                className="w-full py-5 md:py-6 bg-gray-100 text-gray-800 hover:bg-gray-200 border-none"
                onClick={onCancel}
              >
                Cancel Subscription
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Plan Card for Change Plan Section
const ChangePlanCard = ({ plan, isCurrentPlan, onUpgrade, onDowngrade }) => {
  const {
    name,
    icon: Icon,
    tagline,
    price,
    color,
    gradient,
    lightColor,
    buttonColor,
    description,
    features,
  } = plan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Card
        className={`h-full overflow-hidden flex flex-col ${
          isCurrentPlan ? "border-2 shadow-xl relative" : "border shadow"
        }`}
        style={{ borderColor: isCurrentPlan ? color : "" }}
      >
        {isCurrentPlan && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="py-1 px-2.5 bg-gradient-to-r from-[#937c60] to-[#7a654f] text-white border-none">
              <Check className="w-3 h-3 mr-1" /> Current Plan
            </Badge>
          </div>
        )}

        {/* Header */}
        <div
          className="p-6 text-white"
          style={{
            background: `linear-gradient(to right, ${color}, ${color}dd)`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Icon size={20} />
            </div>
            <h3 className="text-xl font-bold">{name}</h3>
          </div>
          <p className="text-white/80 text-sm">{tagline}</p>
        </div>

        <div className="flex flex-col flex-1 px-6 py-5 bg-white">
          <div className="flex-1">
            <div className="mb-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold" style={{ color }}>
                  {price}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-2 leading-snug">
                {description}
              </p>
            </div>
            <div className="space-y-0.5">
              {features.map((feature, index) => (
                <FeatureItem key={index} color={color}>
                  {feature}
                </FeatureItem>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              {isCurrentPlan ? (
                <Button
                  className="w-full py-5 bg-gray-100 text-gray-800 hover:bg-gray-200 border-none"
                  disabled
                >
                  Current Plan
                </Button>
              ) : (
                <Button
                  className={`w-full py-5 ${buttonColor} text-white border-none`}
                  onClick={() => onUpgrade(plan.id)}
                >
                  Switch to {name}
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Billing History Section - Responsive
const BillingHistorySection = () => {
  const billingData = [
    {
      id: 1,
      date: "Dec 15, 2024",
      description: "Luxury Plan - Annual",
      amount: "AED 24,999",
      status: "Paid",
      invoice: "INV-001",
    },
    {
      id: 2,
      date: "Dec 10, 2024",
      description: "Design Service Fee",
      amount: "AED 500",
      status: "Paid",
      invoice: "INV-002",
    },
    {
      id: 3,
      date: "Nov 15, 2024",
      description: "Luxury Plan - Annual",
      amount: "AED 24,999",
      status: "Paid",
      invoice: "INV-003",
    },
    {
      id: 4,
      date: "Oct 20, 2024",
      description: "Material Consultation",
      amount: "AED 1,200",
      status: "Paid",
      invoice: "INV-004",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="relative z-10 mb-16"
    >
      <Card className="overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Billing History</h3>
          <p className="text-gray-600 mt-1">View and download your invoices</p>
        </div>

        <div className="p-6 md:p-8">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900">
                    Amount
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {billingData.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {item.date}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {item.description}
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                      {item.amount}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <Badge className="bg-green-100 text-green-800 border-green-300 border">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-[#937c60] hover:bg-[#937c60]/10 rounded-lg transition-colors"
                        title="Download Invoice"
                      >
                        <Download size={18} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {billingData.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{item.date}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-300 border text-xs">
                    {item.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-900">
                    {item.amount}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-[#937c60] hover:bg-[#937c60]/10 rounded-lg transition-colors"
                    title="Download Invoice"
                  >
                    <Download size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Payment Method Section
const PaymentMethodSection = () => {
  const [hasCard] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="relative z-10 mb-16"
    >
      <Card className="overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#937c60]/10">
              <CreditCard size={24} className="text-[#937c60]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Payment Method
              </h3>
              <p className="text-gray-600 mt-1">
                Manage your payment information
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {hasCard ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl mb-6">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="p-3 bg-[#937c60]/10 rounded-lg">
                  <CreditCard size={24} className="text-[#937c60]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Visa Card</p>
                  <p className="text-sm text-gray-600 mt-1">
                    •••• •••• •••• 4242
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Expires 12/25</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-300 border">
                Default
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 md:p-6 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
              <AlertCircle
                size={20}
                className="text-yellow-600 flex-shrink-0"
              />
              <p className="text-sm text-yellow-800">
                No payment method on file. Add one to continue with your
                subscription.
              </p>
            </div>
          )}

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
            <Button className="w-full sm:w-auto py-5 px-8 bg-[#937c60] hover:bg-[#7a654f] text-white border-none">
              {hasCard ? "Update Card" : "Add Payment Method"}
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

// Support Section - same style as Pricing CTA
const SupportSection = ({ plan }) => {
  const currentPlan = PLANS.find((p) => p.id === plan) || PLANS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      viewport={{ once: true }}
      className="relative z-10"
    >
      <Card className="bg-white p-6 md:p-10">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Need Assistance?
          </h3>
          <p className="text-gray-600 mb-2">
            {currentPlan.name === "Luxury" && (
              <>
                Our dedicated support team provides 24/7 VIP assistance to
                ensure your design experience is seamless.
              </>
            )}
            {currentPlan.name === "Premium" && (
              <>
                Our priority support team is here to help you with your design
                needs, available 24/7.
              </>
            )}
            {currentPlan.name === "Essential" && (
              <>
                Get email support for your design questions and project needs.
              </>
            )}
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6"
          >
            <Button
              className={`${currentPlan.buttonColor} text-white py-6 px-8 shadow-lg`}
              style={{
                boxShadow: `0 10px 25px ${currentPlan.color}30`,
              }}
            >
              Contact Support
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

// Main Subscription Page
const SubscriptionPage = () => {
  const [currentPlan, setCurrentPlan] = useState("luxury");
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSwitchPlan = (planId) => {
    const planName = PLANS.find((p) => p.id === planId)?.name;
    setCurrentPlan(planId);
    setShowChangePlan(false);
    setSuccessMessage(`Switching to ${planName} Plan`);

    // Auto dismiss after 4 seconds
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <>
      <TopBar />
      <div className="relative pt-26 pb-24 px-4 lg:px-8 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <Decorations />

        {/* Success Message */}
        {successMessage && (
          <SuccessMessage
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}

        {/* Page Header */}
        <div className="relative max-w-3xl mx-auto text-center mb-16 z-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl font-bold mb-5 bg-gradient-to-r from-[#937c60] via-[#7a654f] to-[#b8a58c] bg-clip-text text-transparent"
          >
            Your Subscription
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Manage your plan, billing, and account settings all in one place.
          </motion.p>
        </div>

        {/* Current Plan Section */}
        <div className="relative max-w-4xl mx-auto z-10">
          <CurrentPlanSection
            currentPlan={currentPlan}
            onChangePlan={() => setShowChangePlan(true)}
            onCancel={() => alert("Cancel subscription flow")}
          />
        </div>

        {/* Change Plan Section - Conditional */}
        {showChangePlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative max-w-6xl mx-auto z-10 mb-16"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#937c60] via-[#7a654f] to-[#b8a58c] bg-clip-text text-transparent">
                Change Your Plan
              </h2>
              <p className="text-gray-600">
                Select a different plan to switch immediately. Billing
                adjustments will be applied proportionally.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PLANS.map((plan) => (
                <ChangePlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={plan.id === currentPlan}
                  onUpgrade={handleSwitchPlan}
                />
              ))}
            </div>

            <div className="text-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChangePlan(false)}
                className="text-[#937c60] hover:text-[#7a654f] font-semibold transition-colors"
              >
                Back to Subscription
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Billing History Section */}
        <div className="relative max-w-4xl mx-auto z-10">
          <BillingHistorySection />
        </div>

        {/* Payment Method Section */}
        <div className="relative max-w-4xl mx-auto z-10">
          <PaymentMethodSection />
        </div>

        {/* Support Section */}
        <div className="relative max-w-2xl mx-auto z-10">
          <SupportSection plan={currentPlan} />
        </div>
      </div>
    </>
  );
};

export default SubscriptionPage;
