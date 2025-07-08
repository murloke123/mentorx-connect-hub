
import React from "react";
import MentoradoSidebar from "@/components/mentorado/MentoradoSidebar";
import ProfilePage from "@/components/profile/ProfilePage";

const MentoradoProfilePage = () => {
  return (
    <div className="flex">
      <MentoradoSidebar />
      <div className="flex-1 transition-all duration-300 ">
        <ProfilePage userRole="mentorado" />
      </div>
    </div>
  );
};

export default MentoradoProfilePage;
