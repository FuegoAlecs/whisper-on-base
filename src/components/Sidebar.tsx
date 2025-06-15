
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Zap, Clock } from "lucide-react";

const Sidebar = () => {
  const liveStats = [
    { label: "Block Height", value: "8,234,567", icon: Activity, trend: "+1" },
    { label: "Gas Price", value: "0.25 gwei", icon: Zap, trend: "-5%" },
    { label: "Active Wallets", value: "45.6K", icon: TrendingUp, trend: "+12%" },
    { label: "TPS", value: "125", icon: Clock, trend: "+8%" }
  ];

  const recentActivity = [
    { type: "mint", address: "0x1234...5678", action: "Minted 5 NFTs", value: "0.15 ETH", time: "2m ago" },
    { type: "swap", address: "0xabcd...efgh", action: "Swapped USDC → ETH", value: "$2.5K", time: "3m ago" },
    { type: "flag", address: "0x9876...5432", action: "Flagged transaction", value: "High Risk", time: "5m ago" },
    { type: "bridge", address: "0xdef0...1234", action: "Bridged from Ethereum", value: "10 ETH", time: "7m ago" }
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case "mint": return "text-green-400";
      case "swap": return "text-blue-400";
      case "flag": return "text-red-400";
      case "bridge": return "text-purple-400";
      default: return "text-gray-400";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "mint": return "🎨";
      case "swap": return "🔄";
      case "flag": return "⚠️";
      case "bridge": return "🌉";
      default: return "📊";
    }
  };

  return (
    <div className="w-80 border-l border-white/10 bg-black/30 backdrop-blur-xl p-6 space-y-6 overflow-y-auto">
      {/* Live Base Stats */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-electric-blue-400" />
          Live Base Stats
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {liveStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-electric-blue-400" />
                    <span className="text-sm text-gray-400">{stat.label}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${stat.trend.startsWith('+') ? 'text-green-400 border-green-400/30' : 'text-red-400 border-red-400/30'}`}
                  >
                    {stat.trend}
                  </Badge>
                </div>
                <div className="text-xl font-bold text-white mt-1">{stat.value}</div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-electric-blue-400" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <Card key={index} className="glass-card p-4 hover:bg-white/10 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-300 truncate">
                      {activity.address}
                    </span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{activity.action}</p>
                  <span className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                    {activity.value}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
