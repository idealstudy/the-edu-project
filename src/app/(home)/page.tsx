import {
  Session1,
  Session2,
  Session3,
  Session4,
  Session5,
  Session6,
} from '@/features/home';
import { Footer } from '@/layout/footer';

export default function home() {
  return (
    <main className="flex flex-col">
      <Session1 />
      <Session2 />
      <Session3 />
      <Session4 />
      <Session5 />
      <Session6 />
      <Footer />
    </main>
  );
}
