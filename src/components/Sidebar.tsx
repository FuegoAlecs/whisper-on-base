
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Zap, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onClose: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const liveStats = [
    { label: "Markets", value: "Open", icon: TrendingUp, trend: "+2.3%" },
    { label: "News", value: "Live", icon: Activity, trend: "24/7" },
    { label: "AI Load", value: "Normal", icon: Zap, trend: "98%" },
    { label: "Response", value: "Fast", icon: Clock, trend: "<1s" }
  ];

  const recentActivity = [
    { type: "news", title: "Tech earnings season begins", summary: "Major tech companies report Q4 results", time: "2m ago" },
    { type: "market", title: "S&P 500 hits new high", summary: "Index reaches record levels", time: "5m ago" },
    { type: "crypto", title: "Bitcoin volatility increases", summary: "Price swings amid regulation news", time: "8m ago" },
    { type: "ai", title: "New AI breakthrough announced", summary: "Researchers achieve quantum advantage", time: "12m ago" }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "news": return "📰";
      case "market": return "📈";
      case "crypto": return "₿";
      case "ai": return "🤖";
      default: return "📊";
    }
  };

  return (
    <div className="w-full h-full border-l border-gray-800 bg-gray-950/95 backdrop-blur-sm overflow-y-auto">
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between lg:hidden">
          <h2 className="text-lg font-semibold text-white">Real-time Data</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* System Status */}
        <div>
          <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-orange-500" />
            System Status
          </h3>
          <div className="grid grid-cols-1 gap-2 lg:gap-3">
            {liveStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="bg-gray-900/50 border-gray-800 p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-3 w-3 lg:h-4 lg:w-4 text-orange-500" />
                      <span className="text-xs lg:text-sm text-gray-400">{stat.label}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs text-green-400 border-green-400/30 bg-green-400/10"
                    >
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="text-sm lg:text-xl font-bold text-white mt-1">{stat.value}</div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-orange-500" />
            Live Updates
          </h3>
          <div className="space-y-2 lg:space-y-3">
            {recentActivity.map((activity, index) => (
              <Card key={index} className="bg-gray-900/30 border-gray-800 p-3 lg:p-4 hover:bg-gray-800/50 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <span className="text-base lg:text-lg">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs lg:text-sm font-medium text-white truncate">
                        {activity.title}
                      </span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-400 leading-relaxed">{activity.summary}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
