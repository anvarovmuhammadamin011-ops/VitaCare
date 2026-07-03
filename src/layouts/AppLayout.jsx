import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function AppLayout() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col bg-neutral-50">
      <main className="flex-1 pb-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
