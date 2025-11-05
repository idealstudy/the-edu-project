import { Footer } from '@/components/layout/footer';
import { Session1, Session2, Session3, Session4 } from '@/features/home';

export default function home() {
  return (
    <main className="flex flex-col items-center">
      <Session1 />
      <Session2 />
      <Session3 />
      <Session4 />
      <Footer />
    </main>
  );
}
