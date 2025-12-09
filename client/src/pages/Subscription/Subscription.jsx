// File: project-manara-AI/client/src/pages/Subscription/Subscription.jsx
import TopBar from "@/components/Layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Crown,
  CreditCard,
  Download,
  HelpCircle,
  Star,
  AlertTriangle,
  Shield,
  X,
  Trash2,
  Info,
} from "lucide-react";
import { useState } from "react";

// ============= BRAND COLORS =============
const BRAND_COLOR = "#937c60";
const BRAND_COLOR_LIGHT = "#a68970";
const BRAND_COLOR_DARK = "#6b5c50";
const BRAND_COLOR_SUBTLE = "#f5f0ec";

// ============= ANIMATION VARIANTS =============
const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// ============= REUSABLE COMPONENTS =============
const ToggleSwitch = ({ checked, onCheckedChange, disabled = false }) => (
  <motion.button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => !disabled && onCheckedChange(!checked)}
    disabled={disabled}
    whileHover={{ scale: disabled ? 1 : 1.05 }}
    whileTap={{ scale: disabled ? 1 : 0.95 }}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
    style={{
      backgroundColor: checked ? BRAND_COLOR : "#d1d5db",
    }}
  >
    <motion.span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md`}
      animate={{
        x: checked ? 20 : 4,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </motion.button>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    Active: {
      color: "bg-green-100 text-green-800",
      icon: Shield,
      label: "Active",
    },
    Expired: {
      color: "bg-red-100 text-red-800",
      icon: AlertTriangle,
      label: "Expired",
    },
    Trial: {
      color: "bg-blue-100 text-blue-800",
      icon: Star,
      label: "Trial",
    },
    Cancelled: {
      color: "bg-gray-100 text-gray-800",
      icon: AlertTriangle,
      label: "Cancelled",
    },
    Pending: {
      color: "bg-yellow-100 text-yellow-800",
      icon: AlertTriangle,
      label: "Pending",
    },
  };

  const config = statusConfig[status] || statusConfig.Active;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Badge
        className={`${config.color} border-none px-2 sm:px-3 py-1 text-xs sm:text-sm`}
      >
        <Icon size={14} className="mr-1 sm:mr-1.5" />
        {config.label}
      </Badge>
    </motion.div>
  );
};

const PaymentMethodCard = ({ method, onSetDefault, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="p-3 sm:p-4 border border-gray-200 hover:border-gray-300 transition-colors cursor-default">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <motion.div
            className="p-2 rounded-lg shrink-0"
            style={{ backgroundColor: BRAND_COLOR_SUBTLE }}
            whileHover={{ scale: 1.1 }}
          >
            <CreditCard size={20} style={{ color: BRAND_COLOR }} />
          </motion.div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm sm:text-base truncate">
                {method.type} ****{method.last4}
              </span>
              {method.isDefault && (
                <Badge className="bg-green-100 text-green-800 border-none text-xs shrink-0">
                  Primary
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Expires {method.expiry}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {method.cardholder}
            </p>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2 shrink-0">
          {!method.isDefault && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSetDefault?.(method)}
                className="text-xs px-2 h-8 sm:h-10 transition-all"
                style={{ color: BRAND_COLOR }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = `${BRAND_COLOR}10`)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Set Default
              </Button>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove?.(method)}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs px-2 h-8 sm:h-10"
            >
              <Trash2 size={14} />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </Card>
  </motion.div>
);

// ============= MODAL COMPONENTS =============
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1 hover:bg-gray-100 rounded-full z-10 transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
};

const AddCardModal = ({ isOpen, onClose, onAddCard }) => {
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardholder: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddCard(formData);
    setFormData({ cardNumber: "", expiry: "", cvv: "", cardholder: "" });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        className="p-4 sm:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">
          Add New Card
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          Enter your card details
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <motion.div variants={fadeInUp}>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Card Number
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base transition-all"
              value={formData.cardNumber}
              onChange={(e) =>
                setFormData({ ...formData, cardNumber: e.target.value })
              }
              onFocus={(e) => (e.currentTarget.style.borderColor = BRAND_COLOR)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
              required
            />
          </motion.div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <motion.div variants={fadeInUp}>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base transition-all"
                value={formData.expiry}
                onChange={(e) =>
                  setFormData({ ...formData, expiry: e.target.value })
                }
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = BRAND_COLOR)
                }
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
                required
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base transition-all"
                value={formData.cvv}
                onChange={(e) =>
                  setFormData({ ...formData, cvv: e.target.value })
                }
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = BRAND_COLOR)
                }
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
                required
              />
            </motion.div>
          </div>

          <motion.div variants={fadeInUp}>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base transition-all"
              value={formData.cardholder}
              onChange={(e) =>
                setFormData({ ...formData, cardholder: e.target.value })
              }
              onFocus={(e) => (e.currentTarget.style.borderColor = BRAND_COLOR)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
              required
            />
          </motion.div>

          <motion.div
            className="flex gap-2 sm:gap-3 pt-2 sm:pt-4"
            variants={fadeInUp}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 text-sm sm:text-base h-9 sm:h-10 transition-all"
                onClick={onClose}
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                type="submit"
                className="w-full text-white text-sm sm:text-base h-9 sm:h-10 transition-all"
                style={{ backgroundColor: BRAND_COLOR }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = BRAND_COLOR_DARK)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BRAND_COLOR)
                }
              >
                Add Card
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </motion.div>
    </Modal>
  );
};

const DeleteWarningModal = ({ isOpen, onClose, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <motion.div
      className="p-4 sm:p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="p-2 bg-red-100 rounded-lg shrink-0">
          <AlertTriangle size={20} className="text-red-600 sm:w-6 sm:h-6" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">
          Delete Current Plan?
        </h3>
      </div>

      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        Are you sure you want to delete your current plan? This action cannot be
        undone. You will lose access to all premium features immediately.
      </p>

      <motion.div
        className="bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-xs sm:text-sm text-red-700 font-medium">
          ⚠️ Warning
        </p>
        <p className="text-xs sm:text-sm text-red-600 mt-1">
          This will permanently cancel your subscription and remove all
          associated data.
        </p>
      </motion.div>

      <div className="flex gap-2 sm:gap-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1"
        >
          <Button
            variant="outline"
            className="w-full border-gray-300 text-sm sm:text-base h-9 sm:h-10 transition-all"
            onClick={onClose}
          >
            Keep Plan
          </Button>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1"
        >
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base h-9 sm:h-10 transition-all"
            onClick={onConfirm}
          >
            Delete Plan
          </Button>
        </motion.div>
      </div>
    </motion.div>
  </Modal>
);

const AutoRenewToggleModal = ({ isOpen, onClose, onConfirm, isTurningOff }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <motion.div
      className="p-4 sm:p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div
          className={`p-2 ${
            isTurningOff ? "bg-yellow-100" : "bg-green-100"
          } rounded-lg shrink-0`}
        >
          <Info
            size={20}
            className={`${
              isTurningOff ? "text-yellow-600" : "text-green-600"
            } sm:w-6 sm:h-6`}
          />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">
          {isTurningOff ? "Turn Off Auto-Renew?" : "Turn On Auto-Renew?"}
        </h3>
      </div>

      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        {isTurningOff
          ? "Turning off auto-renew means your subscription will expire on the renewal date and you will lose access to premium features. Are you sure?"
          : "Turning on auto-renew ensures uninterrupted access to your premium features. Your card will be charged automatically on the renewal date."}
      </p>

      <motion.div
        className={`${
          isTurningOff
            ? "bg-yellow-50 border-yellow-200"
            : "bg-green-50 border-green-200"
        } border p-3 sm:p-4 rounded-lg mb-4 sm:mb-6`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p
          className={`text-xs sm:text-sm ${
            isTurningOff ? "text-yellow-700" : "text-green-700"
          } font-medium mb-1`}
        >
          {isTurningOff ? "⚠️ Important Note" : "✅ Good to Know"}
        </p>
        <p
          className={`text-xs sm:text-sm ${
            isTurningOff ? "text-yellow-600" : "text-green-600"
          }`}
        >
          {isTurningOff
            ? "You can turn auto-renew back on anytime before your subscription expires."
            : "You can turn off auto-renew anytime before the next billing cycle."}
        </p>
      </motion.div>

      <div className="flex gap-2 sm:gap-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1"
        >
          <Button
            variant="outline"
            className="w-full border-gray-300 text-sm sm:text-base h-9 sm:h-10 transition-all"
            onClick={onClose}
          >
            Cancel
          </Button>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1"
        >
          <Button
            className={`w-full text-white text-sm sm:text-base h-9 sm:h-10 transition-all`}
            style={{
              backgroundColor: isTurningOff ? "#ca8a04" : BRAND_COLOR,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isTurningOff
                ? "#b8860b"
                : BRAND_COLOR_DARK;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isTurningOff
                ? "#ca8a04"
                : BRAND_COLOR;
            }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {isTurningOff ? "Turn Off" : "Turn On"}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  </Modal>
);

// ============= DATA =============
const USER_SUBSCRIPTION = {
  id: "luxury",
  name: "Luxury",
  icon: Crown,
  tagline: "Comprehensive whole home transformation",
  price: "AED 24,999",
  originalPrice: "AED 34,999",
  billingCycle: "Yearly",
  renewalDate: "April 15, 2024",
  expirationDate: "October 15, 2024",
  status: "Active",
  color: BRAND_COLOR,
  autoRenew: true,
  joinedDate: "April 15, 2023",
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
  usage: {
    roomsDesigned: 6,
    aiRenders: 45,
    supportCalls: 3,
    remainingBudget: "AED 15,000",
  },
};

const BILLING_HISTORY = [
  {
    id: 1,
    date: "Mar 15, 2024",
    description: "Luxury Plan - Yearly Renewal",
    amount: "AED 24,999",
    status: "Paid",
    invoiceId: "INV-2024-003",
  },
  {
    id: 2,
    date: "Feb 15, 2024",
    description: "Additional AI Render Credits",
    amount: "AED 999",
    status: "Paid",
    invoiceId: "INV-2024-002",
  },
];

const PAYMENT_METHODS = [
  {
    id: 1,
    type: "Visa",
    last4: "4321",
    expiry: "05/2025",
    isDefault: true,
    cardholder: "John Doe",
  },
  {
    id: 2,
    type: "Mastercard",
    last4: "8765",
    expiry: "08/2024",
    isDefault: false,
    cardholder: "John Doe",
  },
];

// ============= BILLING HISTORY CARD VIEW =============
const BillingHistoryCard = ({ item }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="p-3 sm:p-4 border border-gray-200">
      <motion.div
        className="space-y-2"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
              {item.description}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{item.date}</p>
          </div>
          <Badge className="bg-green-100 text-green-800 border-none text-xs shrink-0">
            {item.status}
          </Badge>
        </div>
        <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
          <span className="text-sm sm:text-base font-medium text-gray-900">
            {item.amount}
          </span>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs px-2 h-8 transition-all"
              style={{ color: BRAND_COLOR }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = `${BRAND_COLOR}10`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Download size={14} className="mr-1" />
              Download
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </Card>
  </motion.div>
);

// ============= MAIN COMPONENT =============
const SubscriptionPage = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isAutoRenewModalOpen, setIsAutoRenewModalOpen] = useState(false);
  const [pendingAutoRenewAction, setPendingAutoRenewAction] = useState(null);
  const [subscription, setSubscription] = useState(USER_SUBSCRIPTION);
  const [autoRenew, setAutoRenew] = useState(subscription.autoRenew);
  const [paymentMethods, setPaymentMethods] = useState(PAYMENT_METHODS);

  const handleAddCard = (cardData) => {
    const newMethod = {
      id: paymentMethods.length + 1,
      type: "Visa",
      last4: cardData.cardNumber.slice(-4),
      expiry: cardData.expiry,
      isDefault: paymentMethods.length === 0,
      cardholder: cardData.cardholder,
    };
    setPaymentMethods([...paymentMethods, newMethod]);
  };

  const handleDeletePlan = () => {
    setSubscription({
      ...subscription,
      status: "Cancelled",
      autoRenew: false,
    });
    setAutoRenew(false);
    setIsDeleteModalOpen(false);
  };

  const handleAutoRenewToggle = (newValue) => {
    if (newValue === false && autoRenew === true) {
      setPendingAutoRenewAction(false);
      setIsAutoRenewModalOpen(true);
    } else if (newValue === true && autoRenew === false) {
      setPendingAutoRenewAction(true);
      setIsAutoRenewModalOpen(true);
    } else {
      setAutoRenew(newValue);
    }
  };

  const confirmAutoRenewChange = () => {
    setAutoRenew(pendingAutoRenewAction);
    setPendingAutoRenewAction(null);
  };

  const setDefaultPaymentMethod = (method) => {
    setPaymentMethods(
      paymentMethods.map((pm) => ({
        ...pm,
        isDefault: pm.id === method.id,
      }))
    );
  };

  const removePaymentMethod = (method) => {
    setPaymentMethods(paymentMethods.filter((pm) => pm.id !== method.id));
  };

  return (
    <>
      <TopBar />

      {/* Main Content */}
      <motion.div
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-12 sm:pt-16 md:pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
          {/* Header */}
          <motion.div
            className="text-center mb-6 sm:mb-8 md:mb-12"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Manage Your Subscription
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-2">
              View your current plan, manage billing, and access premium
              support.
            </p>
          </motion.div>

          {/* Current Plan Card */}
          <motion.div
            className="mb-6 sm:mb-8 md:mb-12"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden border border-gray-200">
              <div
                className="p-4 sm:p-6 text-white rounded"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                <motion.div
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <motion.div
                      className="p-2 bg-white/20 rounded-lg shrink-0"
                      whileHover={{ scale: 1.1 }}
                    >
                      <subscription.icon size={24} />
                    </motion.div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold">
                        {subscription.name} Plan
                      </h2>
                      <p className="text-xs sm:text-sm text-white/90 truncate">
                        {subscription.tagline}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={subscription.status} />
                </motion.div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Plan Details */}
                  <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.15 }}
                  >
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-3 sm:mb-4">
                      Plan Details
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Price</span>
                        <span className="font-medium">
                          {subscription.price}/year
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Billing Cycle</span>
                        <span className="font-medium">
                          {subscription.billingCycle}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Next Renewal</span>
                        <span className="font-medium">
                          {subscription.renewalDate}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Usage */}
                  <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-3 sm:mb-4">
                      Usage
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Rooms Designed</span>
                        <span className="font-medium">
                          {subscription.usage.roomsDesigned}/10
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">AI Renders</span>
                        <span className="font-medium">
                          {subscription.usage.aiRenders}/50
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Auto-renew & Actions */}
                  <motion.div
                    className="space-y-3 sm:space-y-4"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.25 }}
                  >
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                        Auto-renew Settings
                      </h3>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm text-gray-800">
                            Auto-renew
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {autoRenew
                              ? "Will renew automatically"
                              : "Manual renewal required"}
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={autoRenew}
                          onCheckedChange={handleAutoRenewToggle}
                          disabled={subscription.status === "Cancelled"}
                        />
                      </div>

                      {!autoRenew && subscription.status !== "Cancelled" && (
                        <motion.div
                          className="p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-start gap-2">
                            <Info
                              size={16}
                              className="text-yellow-600 mt-0.5 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-yellow-800">
                                Auto-renew is off
                              </p>
                              <p className="text-xs text-yellow-700 mt-0.5">
                                Expires {subscription.renewalDate}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {subscription.status === "Cancelled" && (
                        <motion.div
                          className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-start gap-2">
                            <AlertTriangle
                              size={16}
                              className="text-red-600 mt-0.5 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-red-800">
                                Subscription Cancelled
                              </p>
                              <p className="text-xs text-red-700 mt-0.5">
                                Ends {subscription.expirationDate}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 sm:space-y-2.5">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className="w-full text-white text-sm sm:text-base h-9 sm:h-10 transition-all"
                          style={{ backgroundColor: BRAND_COLOR }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              BRAND_COLOR_DARK)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              BRAND_COLOR)
                          }
                        >
                          Change Plan
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          className="w-full border-red-300 text-red-600 hover:bg-red-50 text-sm sm:text-base h-9 sm:h-10 transition-all"
                          onClick={() => setIsDeleteModalOpen(true)}
                          disabled={subscription.status === "Cancelled"}
                        >
                          <Trash2 size={16} className="mr-1 sm:mr-2" />
                          {subscription.status === "Cancelled"
                            ? "Plan Deleted"
                            : "Delete Plan"}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Payment Section */}
          <motion.div
            className="space-y-6 sm:space-y-8 md:space-y-10"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Payment Methods */}
            <motion.div variants={fadeInUp}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Payment Methods
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Manage your cards and billing
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => setIsAddCardModalOpen(true)}
                    className="whitespace-nowrap text-sm sm:text-base h-9 sm:h-10 transition-all text-white"
                    style={{ backgroundColor: BRAND_COLOR }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = BRAND_COLOR_DARK)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = BRAND_COLOR)
                    }
                  >
                    <CreditCard size={16} className="mr-1 sm:mr-2" />
                    Add Card
                  </Button>
                </motion.div>
              </div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                variants={staggerContainer}
              >
                {paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    onSetDefault={setDefaultPaymentMethod}
                    onRemove={removePaymentMethod}
                  />
                ))}

                {paymentMethods.length === 0 && (
                  <motion.div variants={fadeInUp} className="col-span-full">
                    <Card className="p-6 sm:p-8 text-center border-2 border-dashed border-gray-300">
                      <CreditCard
                        size={32}
                        className="mx-auto text-gray-400 mb-2 sm:mb-3"
                      />
                      <p className="text-sm sm:text-base text-gray-500 mb-1 sm:mb-2">
                        No payment methods added
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Add a card to manage subscription
                      </p>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Billing History */}
            <motion.div variants={fadeInUp}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Billing History
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    View and download invoices
                  </p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="whitespace-nowrap text-sm sm:text-base h-9 sm:h-10 transition-all"
                    style={{ color: BRAND_COLOR }}
                  >
                    <Download size={16} className="mr-1 sm:mr-2" />
                    Export
                  </Button>
                </motion.div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                <motion.div className="space-y-3" variants={staggerContainer}>
                  {BILLING_HISTORY.map((item) => (
                    <BillingHistoryCard key={item.id} item={item} />
                  ))}
                </motion.div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {BILLING_HISTORY.map((item, index) => (
                          <motion.tr
                            key={item.id}
                            className="hover:bg-gray-50 transition-colors"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ backgroundColor: "#f9fafb" }}
                          >
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.date}
                            </td>
                            <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                              {item.description}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {item.amount}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-green-100 text-green-800 border-none text-xs">
                                {item.status}
                              </Badge>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs sm:text-sm px-2 h-8 transition-all"
                                  style={{ color: BRAND_COLOR }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor = `${BRAND_COLOR}10`)
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      "transparent")
                                  }
                                >
                                  <Download size={14} className="mr-1" />
                                  Download
                                </Button>
                              </motion.div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </motion.div>
          </motion.div>

          {/* Support Section */}
          <motion.div
            className="mt-8 sm:mt-10 md:mt-12"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto border border-gray-200 shadow-sm">
              <motion.div
                className="flex flex-col items-center text-center"
                variants={fadeInUp}
              >
                <motion.div
                  className="p-3 rounded-full mb-3 sm:mb-4"
                  style={{ backgroundColor: BRAND_COLOR_SUBTLE }}
                  whileHover={{ scale: 1.1 }}
                >
                  <HelpCircle size={32} style={{ color: BRAND_COLOR }} />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Need Help?
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 max-w-md">
                  Our support team is here to help you with any questions about
                  your subscription.
                  {subscription.name === "Luxury" && " Enjoy 24/7 VIP support!"}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10 transition-all text-white"
                      style={{ backgroundColor: BRAND_COLOR }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          BRAND_COLOR_DARK)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = BRAND_COLOR)
                      }
                    >
                      Contact Support
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto border-gray-300 text-sm sm:text-base h-9 sm:h-10 transition-all"
                    >
                      View FAQs
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Modals */}
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onAddCard={handleAddCard}
      />

      <DeleteWarningModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePlan}
      />

      <AutoRenewToggleModal
        isOpen={isAutoRenewModalOpen}
        onClose={() => {
          setIsAutoRenewModalOpen(false);
          setPendingAutoRenewAction(null);
        }}
        onConfirm={confirmAutoRenewChange}
        isTurningOff={pendingAutoRenewAction === false}
      />
    </>
  );
};

export default SubscriptionPage;
