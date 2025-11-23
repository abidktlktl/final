import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  BarChart3, 
  Settings, 
  Zap,
  Plus
} from "lucide-react";

export const SimpleBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Plus, label: "Create", path: "#", isSpecial: true },
    { icon: Zap, label: "Automations", path: "/dashboard#automations" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          if (item.isSpecial) {
            return (
              <button
                key={item.label}
                onClick={() => {
                  // Open create automation modal
                  const event = new CustomEvent('openCreateAutomation');
                  window.dispatchEvent(event);
                }}
                className="flex flex-col items-center justify-center p-2"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </button>
            );
          }
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center p-2 ${
                isActive ? 'text-purple-600' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
