import { useState } from 'react';
import { Forward, Sparkles } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from './ui/input';

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="rounded-lg h-12 w-12 shadow-lg bg-secondary border-2 border-income/50 flex items-center justify-center text-primary hover:scale-110 transition-transform"
            aria-label="Open chat"
          >
            <Sparkles className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[360px] sm:w-[420px] p-0 flex flex-col"
        >
          <div className="border-b p-4">
            <SheetHeader>
              <SheetTitle>Chatbot</SheetTitle>
              <SheetDescription>
                This is a dummy chatbot. Type anything below.
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-sm text-muted-foreground">
              Assistant: Hi! How can I help you today?
            </div>
            <div className="text-sm">You: Show me a demo.</div>
            <div className="text-sm text-muted-foreground">
              Assistant: This is a placeholder chat interface.
            </div>
          </div>
          <form
            className="p-3 border-t flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="w-full relative">
              <Input
                className="w-full border-2 ring-0 pr-12"
                placeholder="Type a message..."
              />
              <button
                type="submit"
                aria-label="Send message"
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent border-none w-fit h-fit p-2.5"
              >
                <Forward className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
