import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface MobileRedirectProps {
  children: React.ReactNode;
  mobileRoute: string;
}

const MobileRedirect: React.FC<MobileRedirectProps> = ({ children, mobileRoute }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
             window.innerWidth <= 768;
    };

    if (isMobile()) {
      navigate(mobileRoute, { replace: true });
    }
  }, [navigate, mobileRoute]);

  return <>{children}</>;
};

export default MobileRedirect;