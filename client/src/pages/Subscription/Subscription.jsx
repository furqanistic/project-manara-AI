import TopBar from "@/components/Layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Check,
  Crown,
  CreditCard,
  Download,
  HelpCircle,
  Sparkles,
  Star,
  AlertTriangle,
  Calendar,
  Shield,
  Zap,
  X,
  Trash2,
  Info,
} from "lucide-react";
import { useState, useEffect } from "react";

// ============= REUSABLE COMPONENTS =============
const ToggleSwitch = ({ checked, onCheckedChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => !disabled && onCheckedChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#937c60] focus:ring-offset-2 ${
      checked ? "bg-[#937c60]" : "bg-gray-300"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
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
    <Badge className={`${config.color} border-none px-3 py-1`}>
      <Icon size={14} className="mr-1.5" />
      {config.label}
    </Badge>
  );
};

const FeatureItem = ({ children, color }) => (
  <div className="flex items-start gap-3 py-1.5">
    <div className="shrink-0 mt-0.5">
      <div
        className="rounded-full p-1"
        style={{ backgroundColor: `${color}20` }}
      >
        <Check size={16} style={{ color }} />
      </div>
    </div>
    <span className="text-sm sm:text-base text-gray-700">{children}</span>
  </div>
);

const PaymentMethodCard = ({ method, onSetDefault, onRemove }) => (
  <Card className="p-3 sm:p-4 border border-gray-200 hover:border-[#937c60]/30 transition-colors">
    <div className="flex items-center justify-between gap-2 sm:gap-3">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="p-2 bg-[#f5f0ec] rounded-lg shrink-0">
          <CreditCard size={20} className="text-[#937c60]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm sm:text-base truncate">
              {method.type} ****{method.last4}
            </span>
            {method.isDefault && (
              <Badge className="bg-green-100 text-green-800 border-none text-xs shrink-0">
                Primary
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Expires {method.expiry}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 truncate">
            {method.cardholder}
          </p>
        </div>
      </div>
      <div className="flex gap-1 sm:gap-2 shrink-0">
        {!method.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSetDefault?.(method)}
            className="text-[#937c60] hover:text-[#7a654f] hover:bg-[#937c60]/10 text-xs px-2"
          >
            Set Default
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove?.(method)}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs px-2"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  </Card>
);

// ============= MODAL COMPONENTS =============
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={20} className="text-gray-500" />
        </button>
        {children}
      </motion.div>
    </div>
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
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Add New Card</h3>
        <p className="text-gray-600 mb-6">Enter your card details</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#937c60] focus:border-transparent"
              value={formData.cardNumber}
              onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#937c60] focus:border-transparent"
                value={formData.expiry}
                onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#937c60] focus:border-transparent"
                value={formData.cvv}
                onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#937c60] focus:border-transparent"
              value={formData.cardholder}
              onChange={(e) => setFormData({...formData, cardholder: e.target.value})}
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-300"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#937c60] hover:bg-[#7a654f] text-white"
            >
              Add Card
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const DeleteWarningModal = ({ isOpen, onClose, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertTriangle size={24} className="text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Delete Current Plan?</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete your current plan? This action cannot be undone.
        You will lose access to all premium features immediately.
      </p>
      
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
        <p className="text-sm text-red-700 font-medium">⚠️ Warning</p>
        <p className="text-sm text-red-600 mt-1">
          This will permanently cancel your subscription and remove all associated data.
        </p>
      </div>
      
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 border-gray-300"
          onClick={onClose}
        >
          Keep Plan
        </Button>
        <Button
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          onClick={onConfirm}
        >
          Delete Plan
        </Button>
      </div>
    </div>
  </Modal>
);

const AutoRenewToggleModal = ({ isOpen, onClose, onConfirm, isTurningOff }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 ${isTurningOff ? 'bg-yellow-100' : 'bg-green-100'} rounded-lg`}>
          <Info size={24} className={isTurningOff ? 'text-yellow-600' : 'text-green-600'} />
        </div>
        <h3 className="text-xl font-bold text-gray-800">
          {isTurningOff ? 'Turn Off Auto-Renew?' : 'Turn On Auto-Renew?'}
        </h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        {isTurningOff 
          ? 'Turning off auto-renew means your subscription will expire on the renewal date and you will lose access to premium features. Are you sure?'
          : 'Turning on auto-renew ensures uninterrupted access to your premium features. Your card will be charged automatically on the renewal date.'}
      </p>
      
      <div className={`${isTurningOff ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'} border p-4 rounded-lg mb-6`}>
        <p className={`text-sm ${isTurningOff ? 'text-yellow-700' : 'text-green-700'} font-medium mb-1`}>
          {isTurningOff ? '⚠️ Important Note' : '✅ Good to Know'}
        </p>
        <p className={`text-sm ${isTurningOff ? 'text-yellow-600' : 'text-green-600'}`}>
          {isTurningOff 
            ? 'You can turn auto-renew back on anytime before your subscription expires.'
            : 'You can turn off auto-renew anytime before the next billing cycle.'}
        </p>
      </div>
      
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 border-gray-300"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          className={`flex-1 ${isTurningOff ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-[#937c60] hover:bg-[#7a654f]'} text-white`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {isTurningOff ? 'Turn Off' : 'Turn On'}
        </Button>
      </div>
    </div>
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
  color: "#937c60",
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

const AVAILABLE_PLANS = [
  {
    id: "luxury",
    name: "Luxury",
    icon: Crown,
    tagline: "Comprehensive whole home transformation",
    price: "AED 24,999",
    originalPrice: "AED 34,999",
    color: "#937c60",
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
    billingOptions: [
      { cycle: "Yearly", price: "AED 24,999", discount: "28% off" },
      { cycle: "Monthly", price: "AED 2,499" },
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
    description: "Advanced design features for multiple rooms.",
    features: [
      "2-3 Rooms Complete Design",
      "Advanced AI Mood Boards & 3D Renders",
      "Material Lists with UAE Suppliers",
      "Installation Professional Contacts",
      "Budget: Up to 25K AED",
      "24/7 Priority Support",
    ],
    billingOptions: [
      { cycle: "Yearly", price: "AED 15,999", discount: "30% off" },
      { cycle: "Monthly", price: "AED 1,699" },
    ],
  },
];

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

// ============= MAIN COMPONENT =============
const SubscriptionPage = () => {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isAutoRenewModalOpen, setIsAutoRenewModalOpen] = useState(false);
  const [pendingAutoRenewAction, setPendingAutoRenewAction] = useState(null);
  const [subscription, setSubscription] = useState(USER_SUBSCRIPTION);
  const [autoRenew, setAutoRenew] = useState(subscription.autoRenew);
  const [paymentMethods, setPaymentMethods] = useState(PAYMENT_METHODS);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      autoRenew: false 
    });
    setAutoRenew(false);
    setIsDeleteModalOpen(false);
  };

  const handleAutoRenewToggle = (newValue) => {
    if (newValue === false && autoRenew === true) {
      // Turning OFF - show warning
      setPendingAutoRenewAction(false);
      setIsAutoRenewModalOpen(true);
    } else if (newValue === true && autoRenew === false) {
      // Turning ON - show confirmation
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
        isDefault: pm.id === method.id 
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Manage Your Subscription
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              View your current plan, manage billing, and access premium
              support.
            </p>
          </div>

          {/* Current Plan Card */}
          <div className="mb-8 sm:mb-12">
            <Card className="overflow-hidden border border-gray-200">
              <div
                className="p-6 text-white rounded"
                style={{ backgroundColor: subscription.color }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <subscription.icon size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {subscription.name} Plan
                      </h2>
                      <p className="text-white/90 text-sm">
                        {subscription.tagline}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={subscription.status} />
                </div>
              </div>

              <div className="p-6  ">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Plan Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Plan Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price</span>
                        <span className="font-medium">
                          {subscription.price}/year
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Billing Cycle</span>
                        <span className="font-medium">
                          {subscription.billingCycle}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Renewal</span>
                        <span className="font-medium">
                          {subscription.renewalDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Usage */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Usage</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rooms Designed</span>
                        <span className="font-medium">
                          {subscription.usage.roomsDesigned}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">AI Renders</span>
                        <span className="font-medium">
                          {subscription.usage.aiRenders}/50
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Auto-renew & Actions */}
                  <div className="space-y-4">
                    {/* Auto-renew Section */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">
                        Auto-renew Settings
                      </h3>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">
                            Auto-renew
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {autoRenew
                              ? "Your plan will renew automatically"
                              : "Manual renewal required"}
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={autoRenew}
                          onCheckedChange={handleAutoRenewToggle}
                          disabled={subscription.status === "Cancelled"}
                        />
                      </div>

                      {/* Warning/Caution Messages */}
                      {!autoRenew && subscription.status !== "Cancelled" && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Info
                              size={16}
                              className="text-yellow-600 mt-0.5 flex-shrink-0"
                            />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">
                                Auto-renew is off
                              </p>
                              <p className="text-sm text-yellow-700 mt-0.5">
                                Your plan will expire on{" "}
                                {subscription.renewalDate}. Turn auto-renew on
                                to continue uninterrupted access.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {subscription.status === "Cancelled" && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle
                              size={16}
                              className="text-red-600 mt-0.5 flex-shrink-0"
                            />
                            <div>
                              <p className="text-sm font-medium text-red-800">
                                Subscription Cancelled
                              </p>
                              <p className="text-sm text-red-700 mt-0.5">
                                Access ends on {subscription.expirationDate}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-[#937c60] hover:bg-[#7a654f]"
                        onClick={() => setIsChangePlanModalOpen(true)}
                      >
                        Change Plan
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => setIsDeleteModalOpen(true)}
                        disabled={subscription.status === "Cancelled"}
                      >
                        <Trash2 size={16} className="mr-2" />
                        {subscription.status === "Cancelled"
                          ? "Plan Deleted"
                          : "Delete Plan"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Section - Full Width */}
          <div className="space-y-8">
            {/* Payment Methods */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Payment Methods
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage your payment cards and billing preferences
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddCardModalOpen(true)}
                  className="bg-[#937c60] hover:bg-[#7a654f] whitespace-nowrap"
                >
                  <CreditCard size={16} className="mr-2" />
                  Add New Card
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    onSetDefault={setDefaultPaymentMethod}
                    onRemove={removePaymentMethod}
                  />
                ))}

                {/* Empty State */}
                {paymentMethods.length === 0 && (
                  <Card className="p-8 text-center border-2 border-dashed border-gray-300">
                    <CreditCard
                      size={32}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-500 mb-2">
                      No payment methods added
                    </p>
                    <p className="text-sm text-gray-400">
                      Add a card to manage your subscription
                    </p>
                  </Card>
                )}
              </div>
            </div>

            {/* Billing History */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Billing History
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    View and download your past invoices
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="whitespace-nowrap">
                  <Download size={16} className="mr-2" />
                  Export All
                </Button>
              </div>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {BILLING_HISTORY.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.date}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {item.amount}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-green-100 text-green-800 border-none">
                              {item.status}
                            </Badge>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#937c60] hover:text-[#7a654f] hover:bg-[#937c60]/10"
                            >
                              <Download size={14} className="mr-1" />
                              Download
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-12 text-center">
            <Card className="p-6 sm:p-8 max-w-2xl mx-auto border border-gray-200 shadow-sm">
              <div className="flex flex-col items-center">
                <div className="p-3 bg-[#f5f0ec] rounded-full mb-4">
                  <HelpCircle size={32} className="text-[#937c60]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Need Help?
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Our support team is here to help you with any questions about
                  your subscription.
                  {subscription.name === "Luxury" && " Enjoy 24/7 VIP support!"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="bg-[#937c60] hover:bg-[#7a654f]"
                  >
                    Contact Support
                  </Button>
                  <Button variant="outline" className="border-gray-300">
                    View FAQs
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

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