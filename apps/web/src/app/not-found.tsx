import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          404
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold">
          Esa ruta no existe
        </h1>
        <p className="mt-3 text-muted-foreground">
          Quizá quisiste ir al{" "}
          <Link href="/dashboard" className="underline">
            panel principal
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
