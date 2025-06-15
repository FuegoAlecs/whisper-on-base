
import { Button } from "@/components/ui/button";

interface QueryExamplesProps {
  onExampleClick: (query: string) => void;
}

const QueryExamples = ({ onExampleClick }: QueryExamplesProps) => {
  const examples = [
    "What wallet minted most NFTs today?",
    "Top gas spenders on Base",
    "Did 0x742d35Cc6634C0532925a3b8F39319BC1000e8f3a interact with Tornado Cash?",
    "How many wallets minted NFTs in the last hour?",
    "Latest Base DeFi activity",
    "Which tokens did 0x1a2b...9c8d dump this week?"
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-400 mb-3 text-center lg:text-left">Try asking:</h3>
      <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
        {examples.map((example, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onExampleClick(example)}
            className="border-gray-700 bg-gray-900/50 hover:bg-gray-800 text-gray-300 hover:text-white hover:border-orange-500/50 transition-all duration-200 text-xs lg:text-sm"
          >
            {example}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QueryExamples;
