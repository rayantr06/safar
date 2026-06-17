import Link from "next/link";
import { CheckCircle2, MessageCircle, Calendar, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { getWhatsAppLink } from "@/lib/utils/format";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  
  // Note: in real app, we fetch the booking by REF from Supabase here.
  const whatsappLink = getWhatsAppLink(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "213500000000",
    `Bonjour Safar DZ ! J'ai une question concernant ma réservation ${ref}.`
  );

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center min-h-[70vh]">
      <Card className="max-w-xl w-full border-0 custom-shadow glass-card text-center">
        <CardHeader className="pt-12 pb-6 flex flex-col items-center">
          <div className="h-20 w-20 bg-success/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold font-mono text-on-surface mb-2">Réservation Confirmée !</h1>
          <p className="text-on-surface-variant">
            Merci pour votre réservation. Votre demande a bien été transmise au propriétaire.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant text-left">
            <div className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4 border-b border-surface-variant pb-2">
              Détails de la réservation
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-on-surface-variant">Référence</div>
              <div className="font-mono font-bold text-primary">{ref}</div>
              
              <div className="text-on-surface-variant">Activité</div>
              <div className="font-semibold text-on-surface">Balade privée Cap Carbon</div>
              
              <div className="text-on-surface-variant">Date et Heure</div>
              <div className="font-semibold text-on-surface">20 Juil 2026 à 09:00</div>
              
              <div className="text-on-surface-variant">Passagers</div>
              <div className="font-semibold text-on-surface">6 personnes</div>
              
              <div className="text-on-surface-variant">Montant à payer sur place</div>
              <div className="font-bold font-mono text-xl text-primary">20 000 DA</div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button className="w-full h-14 text-lg bg-[#25D366] hover:bg-[#128C7E] text-white" asChild>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-6 w-6" /> Contacter le support sur WhatsApp
              </a>
            </Button>
            <Button variant="outline" className="w-full h-14" asChild>
              <Link href="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
