import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import logo from '@/../public/trackit.svg';

export default function Assistant() {
  const [input, setInput] = useState('');
  const username = useAuthStore((state) => state.user?.name) || 'User';

  return (
    <div className="w-full h-[550px] md:h-svh flex flex-col">
      {/* Header */}
      <div className="bg-background w-full flex items-center justify-between">
        <div className="head py-6 md:py-10">
          <h1 className="title text-3xl font-bold">Assistant</h1>
          <p className="hidden md:block text-sm md:text-base text-muted-foreground font-semibold">
            Your personal assistant for TrackIt.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full max-w-[700px] mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col h-full items-center justify-center gap-4 md:gap-6">
          <img src={logo} alt="TrackIt Logo" className="w-16 md:w-20" />
          <div className="text-center text-muted-foreground max-w-md px-2">
            <p className="text-xl md:text-2xl font-semibold">
              How can I assist,{' '}
              {username.split(' ')[0].charAt(0).toUpperCase() +
                username.split(' ')[0].slice(1)}
              ?
            </p>
          </div>

          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full max-w-3xl px-2 md:px-0">
            {[
              'What was my total expense last month?',
              'On what did I spend the most this week?',
              'How much budget is left for groceries?',
            ].map((question, index) => (
              <div
                key={index}
                className="bg-secondary cursor-pointer rounded-xl px-3 md:px-4 py-3 md:py-3.5 text-sm transition-colors"
                onClick={() => setInput(question)}
              >
                <p className="font-medium text-primary/70 text-balance">
                  {question}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-[700px] mx-auto bg-background py-4 md:py-8 px-4 md:px-0 box-border">
        <div className="textarea-container h-fit w-full relative">
          <Input
            className="w-full h-12 font-medium border-2 focus:border-primary/20 border-primary/5 focus:ring-0 p-7 px-6 bg-secondary rounded-full shadow-sm"
            placeholder="Type your query here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            className="absolute bg-primary h-10 w-10 rounded-full right-2.5 top-1/2 -translate-y-1/2"
            disabled={!input.trim()}
          >
            <ArrowUp className="!h-6 !w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
