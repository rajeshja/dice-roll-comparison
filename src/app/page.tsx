
import { RollComparisonClient } from '@/components/roll-comparison-client';
import { Dices } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Dices className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              RollCompare
            </h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto flex-grow p-4 md:p-6">
        <RollComparisonClient />
      </main>
      <footer className="container mx-auto mt-auto py-6 px-4 text-center text-xs text-muted-foreground md:px-6">
        <p>Built for TTRPG enthusiasts. Happy rolling!</p>
      </footer>
    </div>
  );
}
