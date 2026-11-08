import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-32">
        <div className="w-full max-w-lg rounded-lg border border-background-200 bg-background-100/50 p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-primary-100 text-primary-700">
            <i className="ri-compass-3-line text-2xl" />
          </span>
          <p
            className="mt-5 text-4xl font-semibold text-foreground-950"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            404
          </p>
          <h1 className="mt-2 text-lg font-semibold text-foreground-950">Cette page n'existe pas</h1>
          <p className="mt-2 text-sm text-foreground-600">
            Le lien que vous avez suivi ne mène nulle part. Revenez à l'accueil pour continuer.
          </p>
          <p className="mt-3 truncate text-xs text-foreground-400">{location.pathname}</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-all duration-200 hover:bg-primary-600 active:scale-[0.98]"
          >
            Retour à l'accueil
            <i className="ri-arrow-right-line text-base" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}