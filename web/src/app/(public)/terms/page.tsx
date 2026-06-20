export const dynamic = "force-dynamic";

export default function TermsPage() {
  return (
    <div className="flex flex-col w-full pb-24">
      {/* Title Header */}
      <section className="relative pt-20 pb-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low/40 overflow-hidden">
        <div className="max-w-container-max mx-auto text-center relative z-10">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-secondary-fixed/30 px-3 py-1 rounded-full mb-4 inline-block">
            Cadre Légal
          </span>
          <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg leading-tight text-primary mb-6">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Veuillez lire attentivement les CGU régissant les réservations de sorties maritimes sur la plateforme Safar DZ.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto w-full space-y-8 text-on-surface-variant leading-relaxed">
        <div>
          <h2 className="font-headline-sm text-primary mb-3">1. Objet de la plateforme</h2>
          <p>
            Safar DZ est une plateforme d&apos;intermédiation facilitant la mise en relation entre des particuliers (les clients) et des propriétaires professionnels de bateaux agréés (les skippers/partenaires) pour effectuer des excursions maritimes à Béjaïa.
          </p>
        </div>

        <div>
          <h2 className="font-headline-sm text-primary mb-3">2. Réservation &amp; Validation</h2>
          <p>
            Toute demande de réservation sur la plateforme constitue une pré-réservation. La validation finale intervient après vérification de la disponibilité du bateau et des conditions météo. Elle est confirmée directement par nos équipes auprès du client via WhatsApp.
          </p>
        </div>

        <div>
          <h2 className="font-headline-sm text-primary mb-3">3. Conditions de Paiement</h2>
          <p>
            Aucun frais de réservation n&apos;est facturé en ligne sur Safar DZ. Le règlement de l&apos;excursion s&apos;effectue en totalité le jour du départ auprès du skipper ou de notre représentant sur place, en monnaie locale (Dinar Algérien - DZD).
          </p>
        </div>

        <div>
          <h2 className="font-headline-sm text-primary mb-3">4. Annulations &amp; Météo</h2>
          <p>
            Le skipper se réserve le droit d&apos;annuler ou de reporter une sortie à tout moment si les conditions météorologiques ou de sécurité ne sont pas optimales pour la navigation en mer. Dans ce cas, aucun frais n&apos;est imputé au client. Le client s&apos;engage à prévenir le support Safar DZ au moins 24h avant le départ en cas d&apos;annulation de sa part.
          </p>
        </div>

        <div>
          <h2 className="font-headline-sm text-primary mb-3">5. Comportement &amp; Responsabilité</h2>
          <p>
            Les passagers s&apos;engagent à respecter scrupuleusement les consignes de sécurité édictées par le capitaine à bord (port du gilet de sauvetage obligatoire si demandé, respect du navire). Le capitaine est le seul maître à bord et peut écourter la sortie en cas de comportement dangereux d&apos;un passager.
          </p>
        </div>
      </section>
    </div>
  );
}
