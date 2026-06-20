import Link from "next/link";
import { Ship, DollarSign, Calendar, TrendingUp, Anchor, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PartnersInfoPage() {
  return (
    <div className="flex flex-col w-full pb-24">
      {/* Title Header */}
      <section className="relative pt-20 pb-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low/40 overflow-hidden">
        <div className="max-w-container-max mx-auto text-center relative z-10">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-secondary-fixed/30 px-3 py-1 rounded-full mb-4 inline-block">
            Partenariat Safar DZ
          </span>
          <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg leading-tight text-primary mb-6">
            Développez votre activité avec nous
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Vous êtes propriétaire de bateau ou capitaine à Béjaïa ? Rejoignez la première plateforme maritime algérienne et augmentez vos réservations.
          </p>
        </div>
      </section>

      {/* Benefits Bento Section */}
      <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full space-y-12">
        <div className="text-center">
          <h2 className="font-headline-md text-headline-sm text-primary mb-3">
            Pourquoi rejoindre Safar DZ ?
          </h2>
          <p className="text-on-surface-variant max-w-lg mx-auto">
            Nous gérons le marketing, la visibilité en ligne et le premier contact client pour vous laisser faire ce que vous faites le mieux : naviguer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-outline-variant/35 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-on-surface">Visibilité Accrue</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Touchez des milliers de vacanciers et de touristes recherchant des sorties en mer à Béjaïa durant toute la saison.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-outline-variant/35 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-on-surface">Calendrier Simplifié</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Bénéficiez d&apos;un espace partenaire pour gérer vos bateaux, bloquer vos jours de repos et enregistrer vos réservations directes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-outline-variant/35 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-on-surface">Conditions Claires</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Une commission unique de 15% uniquement sur les réservations validées Safar DZ. Vos réservations manuelles directes restent à 0% de commission.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full text-center">
        <div className="bg-primary text-white p-12 md:p-20 rounded-[3rem] relative overflow-hidden max-w-3xl mx-auto">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="font-headline-md text-headline-sm mb-4">Prêt à embarquer avec nous ?</h2>
            <p className="text-surface-variant text-sm mb-8 opacity-90">
              Créez votre compte partenaire dès aujourd&apos;hui. Notre équipe validera vos documents et votre flotte sous 48h.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-white text-primary px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-surface-container transition-all"
              >
                Se Connecter / Créer un compte
              </Link>
              <a
                href="https://wa.me/213556483634"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-container/20 border border-white/20 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
              >
                Discuter sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
