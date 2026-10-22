import Nav from "./components/Nav";
import Hero from "./components/Hero";
import MenuSection from "./components/MenuSection";
import EventsShowcase from "./components/EventsShowcase";
import Gallery from "./components/Gallery";
import Reviews from "./components/Reviews";
import Visit from "./components/Visit";
import AmbientCafeEffects from "./components/AmbientCafeEffects";
import { ToastProvider } from "./components/Toast";

export default function App() {
  return (
    <ToastProvider>
      <div className="grain relative min-h-screen bg-bean-950 font-body text-latte antialiased">
        <AmbientCafeEffects />
        <Nav />
        <main className="relative z-20">
          <Hero />
          <MenuSection />
          <EventsShowcase />
          <Gallery />
          <Reviews />
          <Visit />
        </main>
      </div>
    </ToastProvider>
  );
}
