import { useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import MenuSection from "./components/MenuSection";
import EventsShowcase from "./components/EventsShowcase";
import Parties from "./components/Parties";
import Gallery from "./components/Gallery";
import Reviews from "./components/Reviews";
import Visit from "./components/Visit";
import AmbientCafeEffects from "./components/AmbientCafeEffects";
import { ToastProvider } from "./components/Toast";
import StaffPortalModal from "./components/StaffPortalModal";

export default function App() {
  const [staffOpen, setStaffOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="grain relative min-h-screen bg-bean-950 font-body text-latte antialiased">
        <AmbientCafeEffects />
        <Nav />
        <main className="relative z-20">
          <Hero />
          <MenuSection />
          <EventsShowcase />
          <Parties />
          <Gallery />
          <Reviews />
          <Visit onOpenStaffPortal={() => setStaffOpen(true)} />
        </main>
        <StaffPortalModal isOpen={staffOpen} onClose={() => setStaffOpen(false)} />
      </div>
    </ToastProvider>
  );
}
