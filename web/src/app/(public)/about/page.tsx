import Image from "next/image";
import { Ship, Compass, ShieldCheck, HelpCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full pb-24">
      {/* Page Title Header */}
      <section className="relative pt-20 pb-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low/40 overflow-hidden">
        <div className="max-w-container-max mx-auto text-center relative z-10">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-secondary-fixed/30 px-3 py-1 rounded-full mb-4 inline-block">
            Notre Histoire
          </span>
          <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg leading-tight text-primary mb-6">
            À Propos de Safar DZ
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            La première plateforme de réservation d&apos;activités maritimes et de sorties en bateau à Béjaïa et sur la côte algérienne.
          </p>
        </div>
      </section>

      {/* Main content grid */}
      <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-headline-md text-headline-sm text-primary mb-6">
            Notre Mission
          </h2>
          <p className="text-body-lg text-on-surface-variant leading-relaxed mb-6">
            Safar DZ est né d&apos;une passion simple : faire découvrir la beauté sauvage et préservée de la côte de Béjaïa, de son parc national de Gouraya, de son Cap Carbon légendaire et de ses îles sauvages comme l&apos;Île des Pisans.
          </p>
          <p className="text-body-lg text-on-surface-variant leading-relaxed">
            Nous mettons en relation les voyageurs du monde entier et les vacanciers locaux avec des skippers et guides certifiés, garantissant des sorties sûres, conviviales et authentiques. En soutenant l&apos;économie locale et le tourisme durable, nous aidons nos capitaines partenaires à développer leur flotte tout en offrant des souvenirs magiques à nos clients.
          </p>
        </div>
        <div className="relative rounded-[3rem] overflow-hidden aspect-[4/3] shadow-2xl border border-outline-variant/30">
          <Image
            src="https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020"
            alt="Béjaïa coast ship"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-surface-container-low/30 border-y border-outline-variant/20">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
          <h2 className="font-headline-md text-headline-sm text-primary text-center mb-12">
            Nos Valeurs Fondamentales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-outline-variant/25 text-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary-container text-primary flex items-center justify-center mb-4 mx-auto">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-sm uppercase mb-2">Sécurité Absolue</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Tous nos skippers partenaires et bateaux respectent strictement les règles de navigation en mer et possèdent l&apos;armement obligatoire.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-outline-variant/25 text-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary-container text-primary flex items-center justify-center mb-4 mx-auto">
                <Compass className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-sm uppercase mb-2">Authenticité Locale</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Nous valorisons les guides locaux et capitaines qui connaissent chaque crique, grotte marine et légende de la côte algérienne.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-outline-variant/25 text-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary-container text-primary flex items-center justify-center mb-4 mx-auto">
                <Ship className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-sm uppercase mb-2">Simplicité de réservation</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Nous éliminons les tracas de réservation informelle. Un processus clair en quelques clics, une validation rapide via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
