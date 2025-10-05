import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 
          className="text-6xl md:text-8xl font-bold text-foreground mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
          data-testid="text-hero-title"
        >
          Hello World
        </h1>
        <p 
          className="text-xl md:text-2xl text-muted-foreground mb-8"
          data-testid="text-hero-subtitle"
        >
          Welcome to your new project
        </p>
        <Button 
          size="lg" 
          className="px-8 py-4"
          data-testid="button-get-started"
          onClick={() => console.log('Get Started clicked')}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
