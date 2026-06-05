import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="text-center max-w-md">
        <p className="font-label-md text-primary uppercase tracking-widest">404</p>
        <h1 className="mt-3 font-display-md text-display-md text-on-surface">
          Esa ruta no existe
        </h1>
        <p className="mt-3 font-body-md text-on-surface-variant">
          Quizá quisiste ir al{" "}
          <Link href="/dashboard" className="text-primary font-bold hover:underline">
            panel principal
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
