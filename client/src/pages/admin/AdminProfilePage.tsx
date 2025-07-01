
import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ProfilePage from "@/components/profile/ProfilePage";

const AdminProfilePage = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1">
        <ProfilePage userRole="admin" />
      </div>
    </div>
  );
};

export default AdminProfilePage;
