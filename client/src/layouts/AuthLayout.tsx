import { Outlet } from "react-router-dom";
import { Activity } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-primary p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-2xl font-semibold">MediBridge</span>
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">
            Healthcare referral management, simplified.
          </h2>
          <p className="mt-4 text-base text-white/80">
            Coordinate patient referrals, bed reservations, and doctor
            assignments across your hospital network in real time.
          </p>
        </div>

        <p className="text-sm text-white/60">
          &copy; {new Date().getFullYear()} MediBridge. All rights reserved.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-4xl">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold">MediBridge</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
