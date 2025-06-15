
import { Button } from "@/components/ui/button";

interface QueryExamplesProps {
  onExampleClick: (query: string) => void;
}

const QueryExamples = ({ onExampleClick }: QueryExamplesProps) => {
  const examples = [
    "What wallet minted most NFTs today?",
    "Top gas spenders on Base",
    "Did 0x... interact with Tornado Cash?",
    "How many wallets minted NFTs in the last hour?",
    "Show me the largest DEX trades today",
    "Which tokens saw the most volume?"
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Try asking:</h3>
      <div className="flex flex-wrap gap-2">
        {examples.map((example, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onExampleClick(example)}
            className="glass border-white/20 hover:border-electric-blue-500/50 hover:bg-electric-blue-500/10 text-gray-300 hover:text-white transition-all duration-300"
          >
            {example}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QueryExamples;
