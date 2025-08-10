import { SliceAndSlide } from '@/components/game/SliceAndSlide';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-7xl shadow-2xl overflow-hidden">
        <CardHeader className="text-center border-b bg-card">
          <CardTitle className="text-4xl font-extrabold tracking-tight font-headline text-primary sm:text-5xl">
            Slice &amp; Slide
          </CardTitle>
          <CardDescription className="mt-2 max-w-2xl mx-auto text-lg text-muted-foreground">
            Click &amp; drag to create. Click to slice. Drag to slide.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <SliceAndSlide />
        </CardContent>
      </Card>
    </div>
  );
}
