import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Anchor, Phone, Mail, User, Shield, MapPin } from "lucide-react";

export default async function PartnerSettingsPage() {
  const MOCK_PARTNER_PROFILE = {
    name: "Capitaine Salim",
    company: "Evasion Marine & Loisirs",
    phone: "0550123456",
    email: "salim.evasion@example.com",
    port: "Port de Béjaïa (Jetée Est)",
    bio: "Professionnel de la mer depuis 15 ans. Je propose des balades guidées autour du Cap Carbon et des sorties de pêche sportive pour toute la famille.",
    avatar_url: null,
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-mono text-on-surface">Paramètres de Profil</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Gérez vos informations publiques de partenaire et vos accès à la plateforme.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none custom-shadow bg-surface">
            <CardHeader className="border-b border-surface-variant">
              <CardTitle className="font-mono text-lg flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" /> Informations Publiques
              </CardTitle>
              <CardDescription>
                Ces informations seront visibles par les clients sur vos annonces.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-on-surface-variant">Nom du Capitaine / Responsable</label>
                  <Input defaultValue={MOCK_PARTNER_PROFILE.name} placeholder="Ex: Capitaine Salim" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-on-surface-variant">Nom de l'Entreprise (facultatif)</label>
                  <Input defaultValue={MOCK_PARTNER_PROFILE.company} placeholder="Ex: Evasion Marine" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-on-surface-variant">Téléphone (WhatsApp)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                    <Input defaultValue={MOCK_PARTNER_PROFILE.phone} className="pl-10" placeholder="Ex: 0550123456" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-on-surface-variant">Port d'Attache principal</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                    <Input defaultValue={MOCK_PARTNER_PROFILE.port} className="pl-10" placeholder="Ex: Port de Béjaïa" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-on-surface-variant">Présentation / Bio</label>
                <textarea 
                  defaultValue={MOCK_PARTNER_PROFILE.bio}
                  className="w-full min-h-[100px] p-3 rounded-lg border border-outline bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Décrivez votre expérience en mer..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button className="bg-primary text-white">Sauvegarder les modifications</Button>
              </div>
            </CardContent>
          </Card>

          {/* Security details */}
          <Card className="border-none custom-shadow bg-surface">
            <CardHeader className="border-b border-surface-variant">
              <CardTitle className="font-mono text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" /> Sécurité & Accès
              </CardTitle>
              <CardDescription>
                Mettez à jour vos identifiants de connexion.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-on-surface-variant">Adresse Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                  <Input defaultValue={MOCK_PARTNER_PROFILE.email} disabled className="pl-10 bg-surface-container-low" />
                </div>
                <p className="text-[10px] text-on-surface-variant">
                  L'adresse email de connexion ne peut être modifiée que par l'administrateur de la plateforme.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-on-surface-variant">Nouveau mot de passe</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-on-surface-variant">Confirmer le mot de passe</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline">Changer le mot de passe</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <Card className="border-none custom-shadow bg-surface-container-lowest">
            <CardHeader className="pb-4">
              <CardTitle className="font-mono text-md">Votre Statut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-success-light flex items-center justify-center text-success">
                  <Anchor className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-on-surface text-sm">Partenaire Vérifié</div>
                  <div className="text-xs text-on-surface-variant">Safar DZ Pro</div>
                </div>
              </div>
              <div className="border-t border-surface-variant pt-4 space-y-2 text-xs text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Commission fixe :</span>
                  <span className="font-mono font-bold text-on-surface">15%</span>
                </div>
                <div className="flex justify-between">
                  <span>Inscrit depuis le :</span>
                  <span className="font-mono font-bold text-on-surface">10 Mai 2026</span>
                </div>
                <div className="flex justify-between">
                  <span>Bateaux en ligne :</span>
                  <span className="font-mono font-bold text-on-surface">2 actifs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
