export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col w-full pb-24">
      {/* Title Header */}
      <section className="relative pt-20 pb-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low/40 overflow-hidden">
        <div className="max-w-container-max mx-auto text-center relative z-10">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-secondary-fixed/30 px-3 py-1 rounded-full mb-4 inline-block">
            Confidentialité
          </span>
          <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg leading-tight text-primary mb-6">
            Politique de Confidentialité
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Nous protégeons vos informations personnelles et respectons votre vie privée sur Safar DZ.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto w-full space-y-8 text-on-surface-variant leading-relaxed">
        <div>
          <h2 className="font-headline-sm text-primary mb-3">1. Collecte des données</h2>
          <p>
            Nous collectons uniquement les informations strictement nécessaires pour planifier et valider vos sorties en mer : votre nom, votre numéro de téléphone (utilisé pour les communications WhatsApp et de validation) et vos notes de réservation éventuelles.
          </p>
        </div>

        <div>
          <h2 className="font-headline-sm text-primary mb-3">2. Utilisation des données</h2>
          <p>
            Vos données de contact sont transmises uniquement au capitaine/skipper affecté à votre sortie maritime afin de faciliter la coordination de votre embarquement le jour J. Nous ne vendons, n&apos;échangeons ni ne louons vos données à des tiers publicitaires.
          </p>
        </div>

        <div>
          <h2 className="font-headline-sm text-primary mb-3">3. Conservation des données</h2>
          <p>
            Vos informations de réservation sont conservées de manière sécurisée dans notre base de données afin de vous permettre de suivre votre réservation via la page `/booking/tracking` et de vous assurer un service client optimal.
          </p>
        </div>

        <div>
          <h2 className="font-headline-sm text-primary mb-3">4. Droits des utilisateurs</h2>
          <p>
            Conformément à la réglementation relative à la protection des données personnelles, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Pour exercer ce droit, écrivez-nous simplement par email à contact@safardz.com.
          </p>
        </div>
      </section>
    </div>
  );
}
