import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar, Users, Search, Ship, ShieldCheck, Handshake, Zap } from "lucide-react";
import { SearchBar } from "@/components/experiences/search-bar";
import { ExperienceCard } from "@/components/experiences/experience-card";
import { getFeaturedExperiences, getDestinations } from "@/lib/queries/experiences";

export default async function HomePage() {
  const [experiences, destinations] = await Promise.all([
    getFeaturedExperiences(),
    getDestinations(),
  ]);

  return (
    <div className="flex flex-col w-full">
      {/* ===== 1. Hero Section — Split 2-Column ===== */}
      <section className="relative pt-16 pb-24 md:pb-32 px-margin-mobile md:px-margin-desktop overflow-hidden">
        <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text + Search Bar */}
          <div className="relative z-10">
            <span className="inline-block text-primary font-headline-sm text-headline-sm mb-4 travel-stamp bg-secondary-fixed/30 border-primary/20">
              Été &apos;25
            </span>
            <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg mb-6 text-primary leading-tight">
              Choisissez votre prochaine aventure
            </h1>
            <p className="text-body-lg text-on-surface-variant mb-10 max-w-xl">
              Des sorties en mer, des découvertes et des moments inoubliables au cœur de la Méditerranée.
            </p>

            {/* Search Bar */}
            <SearchBar />
          </div>


          {/* Right: Hero Image */}
          <div className="relative hidden lg:block">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-tertiary-fixed-dim/40 organic-blob animate-pulse blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary-fixed-dim/40 organic-blob blur-3xl" />
            <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqvydzkA1Tpk1xqbNllDP0RC9qluxu7V0KmMbGmJGH9XLapI8zmYPaoIaUZAvKJhRVBubLIE_tk8bkgnBPhUZ12vSyF166GtuRUX3Nb6QUPSJU-klAbGIzY5b6P-EZIpeuv3O3JQEcda4vDZaI9SBKx-iw_hX1xJgSzNdKF0WG5dEFLb2UzobGaoNpndA9n5olNnF081Sz-x3GA7w2OLzLhVO63mEiDxCYL4v4HDtyqR4KPhw-mggIy1e_lpOIaRmVaPaXuBhfamM"
                alt="Bateau sur la Méditerranée près de Béjaïa"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl postcard-shadow rotate-[-6deg] max-w-[200px]">
              <p className="font-headline-sm text-primary text-[14px] leading-tight">
                &quot;La perle de la Méditerranée vous attend.&quot;
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-tertiary-fixed" />
                <span className="text-label-sm text-on-surface-variant">Algeria Stamps</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. Categories Section ===== */}
      <section className="py-16 bg-surface-container-low">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <h2 className="font-headline-md text-headline-md text-primary mb-12 flex items-center gap-3">
            <Ship className="h-8 w-8 text-tertiary-container" />
            Explorez par catégorie
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Bateaux privés", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlWKUCUJLU2-1yhXbPPMHxrp6E3oPGCx1isV7F_e2ecsez99pVZ3_JF-KL8ivG3ieXKN3EjOGJ1tTBmqwu6IHBRg3mTGyM8Ks0ZiQcTdShigt5u7FzBgXOfsciP9oyUxS3gnrRED68Z_Z5eBLLsLUifM9QvF425P-KrLSZyktH_MnhngWqZm4Xxu0ToE_aZiCqRDsSOXtYUL5bbcNjZ4vm8s34yPX3fxOjB1e0erFmYUNYgsO4jfsEmu7lqdsod4HRBFqLkBrJ1YA" },
              { title: "Balades en bateau", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiUMNg517iw3rvwS3lsO5HDCk-34xXaq2tBtEyZuAgjfFYsjfQ1KzScMQyIj1T7cHFikUMjX6G-v3-Rfg2VLqItBm1g25i0yLVECQI9KDUuxqVIDFFAgJpbygWGK4ASN9PUeonGSWvIU4HdGE2e-QBSaZQDL4HJN7oeQivq7JH1kPRnyJiPLR9yCyy6oKdOKYImfxOSBo3zTsFZ7QStQnTrr1ISMOpw9qs2g11QKxohZ1LiH3Zxwgg6m-w0qIUrIC0FhtV7ZvP_iI" },
              { title: "Jet Ski", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3VHtna-BNDwEX-2uzlA_IFScLgHlKZwOez5fDnu6W8JH4cfPvjjIwbftDPwgnQkPVcvMvfLGgzNjDJ91ZoWJArAOXLtK-yOFbyPZRCxNWz6SiNk_NNn0RwsGjDqtFWvd9_RZC3fuM_cjyp_A2UF2mW1CKRza87NGLtUC_YXtM1KCMUCt34uQ0WlkFRFra7KAOM3gac3UXNmz7bFNGm4yctLyUQta1Y7yPYKorstM8niJSGT31OQgxLvkGJU_OCE-SfKDvO_dTphs" },
              { title: "Découvrir Béjaïa", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1f7dHINbq0C5DLXE9GbBEde5HjcAD0RWKsyrbKD1oGltwLnCu3VyDq0ZoO8Ktgogrs1sAMYSxgdrOkJ2xyQ3DU3VY9XaHjuUU9MP1aXp3jNr2wHzIEwEL5iRa9URRSvSeptQfl8ErTgXnl6OZNfPYdwTSffPjYbcBpfb1RI83Ccos5TG3D8EejiiYuqnozj22YlytD6_JGQ2FyD__9GRSgSPklDtcsYRMtvJV1Sp3SWpKEzUSD2oVYKzbHWn9WAL5uYICMQqqrKA" },
            ].map((cat) => (
              <Link key={cat.title} href="/experiences" className="group cursor-pointer">
                <div className="aspect-square rounded-3xl overflow-hidden relative mb-4">
                  <Image
                    src={cat.img}
                    alt={cat.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-on-primary">
                    <h3 className="font-headline-sm text-label-md">{cat.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. Featured Experiences ===== */}
      <section className="py-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary mb-2">
              Expériences à la une
            </h2>
            <p className="text-on-surface-variant">
              Nos aventures les plus appréciées par la communauté.
            </p>
          </div>
          <Link
            href="/experiences"
            className="text-primary font-bold hover:underline flex items-center gap-2 hidden md:flex"
          >
            Voir tout <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {experiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/experiences"
            className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
          >
            Voir toutes les expériences <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ===== 4. Destinations (Horizontal Scroll) ===== */}
      <section id="destinations" className="py-24 bg-surface-variant/30 overflow-hidden">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <h2 className="font-headline-md text-headline-md text-primary mb-12">
            Destinations Incontournables
          </h2>
          <div className="flex gap-8 overflow-x-auto pb-8 snap-x no-scrollbar">
            {destinations.map((dest) => (
              <Link
                key={dest.id}
                href={`/experiences?destination=${dest.slug}`}
                className="min-w-[300px] md:min-w-[400px] snap-center flex-shrink-0"
              >
                <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/3] group">
                  <Image
                    src={dest.photo_url}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <h3 className="font-headline-md text-headline-sm mb-2">{dest.name}</h3>
                    <p className="text-body-md opacity-90 max-w-[250px]">{dest.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. Trust / Why Us Section ===== */}
      <section className="py-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="bg-primary-container text-on-primary-container rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 organic-blob -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-4">Expériences sélectionnées</h3>
              <p className="opacity-80">
                Chaque sortie est vérifiée par notre équipe pour garantir qualité et sécurité.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Handshake className="h-8 w-8" />
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-4">Partenaires locaux</h3>
              <p className="opacity-80">
                Nous travaillons directement avec les meilleurs skippers et guides de Béjaïa.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-4">Réservation simple</h3>
              <p className="opacity-80">
                Réservez votre aventure en quelques clics, avec confirmation immédiate.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
