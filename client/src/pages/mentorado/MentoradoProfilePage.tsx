
import MentoradoSidebar from "@/components/mentorado/MentoradoSidebar";
import ProfilePage from "@/components/profile/ProfilePage";

const MentoradoProfilePage = () => {
  return (
    <div className="flex">
      <MentoradoSidebar />
      <div className="flex-1 transition-all duration-300 p-6 overflow-auto">
        <ProfilePage userRole="mentorado" />
      </div>
    </div>
  );
};

export default MentoradoProfilePage;
