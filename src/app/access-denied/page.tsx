import Link from "next/link";
import { LockKeyhole, LogIn } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4 text-slate-950">
      <section className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">Akses Finance dibatasi</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Data AR, AP, ledger, HPP, profit, dan cashflow hanya tersedia untuk akun Finance berizin.
        </p>
        <Link href="/login" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white">
          <LogIn className="h-4 w-4" />
          Ganti akun
        </Link>
      </section>
    </main>
  );
}
