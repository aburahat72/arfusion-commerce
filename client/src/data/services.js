import { ShieldCheck, Truck, Headphones, RotateCcw } from "lucide-react";

const services = [
  {
    id: "free-shipping",
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over ₹4,000",
  },
  {
    id: "returns",
    icon: RotateCcw,
    title: "30 Days Return",
    description: "Money back guarantee",
  },
  {
    id: "secure-payment",
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "100% secure payment",
  },
  {
    id: "support",
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support",
  },
];

export default services;
