export const dashboardStats = [
  {
    id: "revenue",
    title: "Total Revenue",
    value: "₹84,560.00",
    change: "12.5%",
    trend: "up",
    icon: "revenue",
  },
  {
    id: "orders",
    title: "Total Orders",
    value: "1,248",
    change: "8.3%",
    trend: "up",
    icon: "orders",
  },
  {
    id: "customers",
    title: "Total Customers",
    value: "2,542",
    change: "15.7%",
    trend: "up",
    icon: "customers",
  },
  {
    id: "products",
    title: "Total Products",
    value: "532",
    change: "5.2%",
    trend: "up",
    icon: "products",
  },
];

export const salesData = {
  "Last 7 Days": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    revenue: [38000, 42000, 36000, 51000, 47000, 62000, 58000],
    orders: [24, 29, 21, 36, 33, 45, 41],
  },

  "Last 30 Days": {
    labels: [
      "Apr 29",
      "May 4",
      "May 9",
      "May 14",
      "May 19",
      "May 24",
      "May 29",
    ],
    revenue: [
      78000, 92000, 105000, 98000, 88000, 96000, 118000, 102000, 110000, 135000,
      120000, 108000, 96000, 126000, 138000, 118000, 145000, 160000, 144000,
      178000, 184000, 170000, 195000, 178000, 210000, 188000, 230000, 252000,
      225000, 240000,
    ],
    orders: [
      32, 38, 45, 40, 35, 42, 50, 46, 54, 62, 55, 48, 43, 58, 66, 60, 70, 74,
      64, 82, 88, 78, 92, 84, 102, 96, 115, 124, 108, 112,
    ],
  },

  "Last 90 Days": {
    labels: ["Mar 1", "Mar 15", "Apr 1", "Apr 15", "May 1", "May 15", "May 29"],
    revenue: [185000, 210000, 198000, 245000, 268000, 302000, 340000],
    orders: [145, 168, 154, 185, 204, 226, 248],
  },

  "This Year": {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    revenue: [520000, 610000, 580000, 690000, 745000, 810000, 875000, 920000],
    orders: [420, 485, 462, 530, 584, 620, 681, 710],
  },
};

export const recentOrders = [
  {
    id: "#AF1256",
    customer: "John Doe",
    amount: 1499,
    status: "Pending",
    time: "2 mins ago",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "#AF1255",
    customer: "Emily Johnson",
    amount: 2999,
    status: "Processing",
    time: "18 mins ago",
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "#AF1254",
    customer: "Michael Smith",
    amount: 1799,
    status: "Shipped",
    time: "1 hour ago",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "#AF1253",
    customer: "Sarah Williams",
    amount: 3499,
    status: "Delivered",
    time: "2 hours ago",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "#AF1252",
    customer: "David Brown",
    amount: 999,
    status: "Cancelled",
    time: "3 hours ago",
    image:
      "https://images.unsplash.com/photo-1600359756315-1f5d3a9b39b2?auto=format&fit=crop&w=200&q=80",
  },
];

export const topSellingProducts = [
  {
    rank: 1,
    name: "Wireless Headphones",
    sold: 245,
    revenue: 122550,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80",
  },
  {
    rank: 2,
    name: "Smart Watch",
    sold: 189,
    revenue: 94500,
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80",
  },
  {
    rank: 3,
    name: "Running Shoes",
    sold: 156,
    revenue: 78000,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80",
  },
  {
    rank: 4,
    name: "iPhone 15",
    sold: 134,
    revenue: 67450,
    image:
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=200&q=80",
  },
  {
    rank: 5,
    name: "Bluetooth Speaker",
    sold: 120,
    revenue: 36000,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=200&q=80",
  },
];

export const lowStockProducts = [
  {
    name: "Wireless Earbuds",
    sku: "WE-001",
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Backpack",
    sku: "BP-002",
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Smart Watch",
    sku: "SW-003",
    stock: 6,
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Wireless Charger",
    sku: "WC-004",
    stock: 3,
    image:
      "https://images.unsplash.com/photo-1587033411391-5d9f89b3f8a0?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Gaming Mouse",
    sku: "GM-005",
    stock: 7,
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=200&q=80",
  },
];

export const activityFeed = [
  {
    id: "activity-1",
    type: "order",
    title: "New order #AF1256 received",
    time: "2 mins ago",
  },
  {
    id: "activity-2",
    type: "product",
    title: 'Product "Wireless Headphones" updated',
    time: "15 mins ago",
  },
  {
    id: "activity-3",
    type: "customer",
    title: "Customer Emily Johnson registered",
    time: "1 hour ago",
  },
  {
    id: "activity-4",
    type: "shipping",
    title: "Order #AF1254 has been shipped",
    time: "2 hours ago",
  },
  {
    id: "activity-5",
    type: "warning",
    title: 'Low stock alert for "Smart Watch"',
    time: "3 hours ago",
  },
];
