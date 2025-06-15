import { useEffect, useState } from 'react';
import { useAlchemy } from '@/hooks/useAlchemy';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Zap, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onClose: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const liveStats = [
    { label: "Base Blocks", value: "12,445,789", icon: TrendingUp, trend: "+1,234" },
    { label: "Gas Price", value: "0.23 gwei", icon: Activity, trend: "Low" },
    { label: "Active Wallets", value: "45.2K", icon: Zap, trend: "+2.3%" },
    { label: "Oracle Load", value: "Normal", icon: Clock, trend: "98%" }
  ];

  const { getLatestBlockNumber, getCurrentGasPrice, getRecentNftMints, isLoading: alchemyIsLoading } = useAlchemy();

  const [blockNumber, setBlockNumber] = useState<string | null>(liveStats.find(s => s.label === "Base Blocks")?.value || "Loading...");
  const [gasPrice, setGasPrice] = useState<string | null>(liveStats.find(s => s.label === "Gas Price")?.value || "Loading...");
  const [blockTrend, setBlockTrend] = useState<string | null>(liveStats.find(s => s.label === "Base Blocks")?.trend || "");
  const [gasPriceTrend, setGasPriceTrend] = useState<string | null>(liveStats.find(s => s.label === "Gas Price")?.trend || "");
  const [nftMintActivities, setNftMintActivities] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted component
    const fetchNetworkData = async () => {
      try {
        const latestBlock = await getLatestBlockNumber();
        if (isMounted && latestBlock) {
          setBlockNumber(latestBlock);
          setBlockTrend(""); // Clear mock trend
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch block for sidebar:", error);
          setBlockNumber("Error"); setBlockTrend("");
        }
      }
      try {
        const currentGas = await getCurrentGasPrice();
        if (isMounted && currentGas) {
          setGasPrice(currentGas);
          setGasPriceTrend(""); // Clear mock trend
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch gas for sidebar:", error);
          setGasPrice("Error"); setGasPriceTrend("");
        }
      }
      try {
        const mints = await getRecentNftMints({ limit: 3 }); // Fetch 3 recent mints
        if (isMounted && mints && mints.length > 0) {
          const formattedMints = mints.map(mint => {
            let title = "New NFT Mint";
            if (mint.collectionName && mint.collectionName !== "[Name Missing]") {
              title = `Mint: ${mint.collectionName}`;
            } else if (mint.nftContractAddress) {
              title = `Mint: ${mint.nftContractAddress.substring(0, 6)}...${mint.nftContractAddress.substring(mint.nftContractAddress.length - 4)}`;
            }

            let summary = `Token ID ${mint.tokenId || 'N/A'}`;
            if (mint.minterAddress) {
              summary += ` minted by ${mint.minterAddress.substring(0, 6)}...${mint.minterAddress.substring(mint.minterAddress.length - 4)}`;
            }

            let time = 'Recently';
            if (mint.timestamp) {
                 const date = new Date(mint.timestamp);
                 const now = new Date();
                 const diffMs = now.getTime() - date.getTime();
                 const diffMins = Math.round(diffMs / 60000);
                 if (diffMins < 1) time = "Just now";
                 else if (diffMins < 60) time = `${diffMins}m ago`;
                 else if (diffMins < 1440) time = `${Math.floor(diffMins / 60)}h ago`;
                 else time = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
             }

            return {
              type: "nft", // Consistent with existing structure
              title: title,
              summary: summary,
              time: time,
              key: mint.transactionHash || `mint-${mint.nftContractAddress}-${mint.tokenId}-${Math.random()}`
            };
          });
          setNftMintActivities(formattedMints);
        } else if (isMounted) {
          setNftMintActivities([]); // Clear if no mints or error
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch NFT mints for sidebar:", error);
          setNftMintActivities([]); // Clear on error
        }
      }
    };
    fetchNetworkData();
    return () => { isMounted = false; }; // Cleanup
  }, [getLatestBlockNumber, getCurrentGasPrice, getRecentNftMints]);

  const recentActivity = [
    { type: "nft", title: "BasePunks surge detected", summary: "234 NFTs minted in last 10 minutes", time: "2m ago" },
    { type: "defi", title: "Large Uniswap swap", summary: "1,250 ETH → USDC on Base DEX", time: "5m ago" },
    { type: "bridge", title: "Bridge activity spike", summary: "15.2M USDC bridged to Base", time: "8m ago" },
    { type: "whale", title: "Whale wallet detected", summary: "New wallet with 500+ ETH created", time: "12m ago" }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "nft": return "🎨";
      case "defi": return "🔄";
      case "bridge": return "🌉";
      case "whale": return "🐋";
      default: return "⚡";
    }
  };

  return (
    <div className="w-full h-full border-l border-gray-800 bg-gray-950/95 backdrop-blur-sm overflow-y-auto">
      <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between lg:hidden">
          <h2 className="text-base sm:text-lg font-semibold text-white">Base Network</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-1.5 sm:p-2"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Live Base Stats */}
        <div>
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-orange-500" />
            Live Base Stats
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {liveStats.map((stat, index) => {
              const IconComponent = stat.icon;
              let displayValue = stat.value;
              let displayTrend = stat.trend;

              if (stat.label === "Base Blocks") {
                displayValue = blockNumber || "N/A"; // Use state, fallback to N/A
                displayTrend = blockTrend || "";    // Use state for trend
              } else if (stat.label === "Gas Price") {
                displayValue = gasPrice || "N/A";   // Use state, fallback to N/A
                displayTrend = gasPriceTrend || ""; // Use state for trend
              }

              return (
                <Card key={index} className="bg-gray-900/50 border-gray-800 p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                      <span className="text-xs sm:text-sm text-gray-400">{stat.label}</span>
                    </div>
                    {displayTrend && ( // Only show badge if trend is not empty
                      <Badge
                        variant="outline"
                        className="text-xs text-green-400 border-green-400/30 bg-green-400/10 px-1.5 py-0.5"
                      >
                        {displayTrend}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm sm:text-lg lg:text-xl font-bold text-white mt-1">{displayValue}</div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Chain Activity */}
        <div>
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-orange-500" />
            Recent Activity
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {[...nftMintActivities, ...recentActivity.filter(act => act.type !== 'nft')].slice(0, 4).map((activity) => (
              <Card key={activity.key || activity.title} className="bg-gray-900/30 border-gray-800 p-2 sm:p-3 lg:p-4 hover:bg-gray-800/50 transition-colors cursor-pointer">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-sm sm:text-base lg:text-lg">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <span className="text-xs sm:text-sm font-medium text-white truncate">
                        {activity.title}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{activity.summary}</p>
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
