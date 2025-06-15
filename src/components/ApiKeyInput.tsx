
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Key } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  isVisible: boolean;
}

const ApiKeyInput = ({ onApiKeySubmit, isVisible }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
      localStorage.setItem('chainwhisper_openai_key', apiKey.trim());
    }
  };

  if (!isVisible) return null;

  return (
    <div className="border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm p-3 sm:p-4 lg:p-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-300">Enter your OpenAI API Key to enable AI responses</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500/20 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              type="submit"
              disabled={!apiKey.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2"
            >
              Connect
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ApiKeyInput;
