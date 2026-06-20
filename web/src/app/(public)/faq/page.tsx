import { HelpCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function FAQPage() {
  const faqs = [
    {
      q: "Comment fonctionne la réservation sur Safar DZ ?",
      a: "C&apos;est très simple : choisissez l&apos;expérience de votre choix (bateau privé ou place partagée), sélectionnez la date et l&apos;heure, puis renseignez vos coordonnées. Une fois votre demande validée, notre équipe vous contactera via WhatsApp sous 24h pour confirmer les détails opérationnels et votre point d&apos;embarquement."
    },
    {
      q: "Dois-je payer lors de la réservation en ligne ?",
      a: "Non, aucun paiement n&apos;est requis en ligne. Le règlement s&apos;effectue directement auprès du capitaine ou du skipper le jour de votre départ, au port d&apos;embarquement."
    },
    {
      q: "Les capitaines et skippers sont-ils qualifiés ?",
      a: "Absolument. Safar DZ travaille uniquement avec des professionnels agréés. Tous nos skippers partenaires possèdent les permis de navigation requis et une solide expérience de la navigation côtière locale."
    },
    {
      q: "Que se passe-t-il en cas de mauvaise météo ?",
      a: "La sécurité est notre priorité absolue. Si les conditions météorologiques ne permettent pas de naviguer en toute sécurité, la sortie sera reportée à une date ultérieure d&apos;un commun accord, ou annulée sans frais."
    },
    {
      q: "Quelle est la différence entre sortie privée et partagée ?",
      a: "Une sortie privée privatise entièrement l&apos;embarcation pour votre groupe (jusqu&apos;à la capacité maximale du bateau). Une sortie partagée vous permet de réserver des places individuelles à bord et de partager la sortie avec d&apos;autres voyageurs, ce qui est idéal pour les petits groupes ou personnes seules."
    },
    {
      q: "Comment puis-je suivre l&apos;état de ma réservation ?",
      a: "Vous pouvez utiliser notre page de suivi à l&apos;adresse `/booking/tracking`. Il vous suffit d&apos;entrer le numéro de référence (commençant par `#SF-`) fourni à la fin de votre réservation."
    }
  ];

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Title Header */}
      <section className="relative pt-20 pb-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low/40 overflow-hidden">
        <div className="max-w-container-max mx-auto text-center relative z-10">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-secondary-fixed/30 px-3 py-1 rounded-full mb-4 inline-block">
            Questions Fréquentes
          </span>
          <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg leading-tight text-primary mb-6">
            FAQ — Questions Récurrentes
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Trouvez les réponses à vos questions concernant la sécurité, les tarifs et l&apos;organisation de vos sorties en mer.
          </p>
        </div>
      </section>

      {/* FAQs List */}
      <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto w-full space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] border border-outline-variant/35 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-headline-sm text-lg font-bold text-primary flex items-start gap-3 mb-3">
              <HelpCircle className="h-5 w-5 text-secondary shrink-0 mt-1" />
              <span>{faq.q}</span>
            </h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed pl-8">
              {faq.a}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
