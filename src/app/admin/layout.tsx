import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel - Moneybox",
  description: "Manage categories and products",
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
};

export default AdminLayout;
