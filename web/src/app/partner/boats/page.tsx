import Image from "next/image";
import { Plus, Edit2, Anchor, Star, ToggleRight, ToggleLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PartnerBoatsPage() {
  const MOCK_EXPERIENCES = [
    {
      id: "1",
      title: "Balade privée Cap Carbon & Aiguades",
      boatName: "Sirène de Béjaïa",
      type: "private",
      price_total: 2000000, // 20,000 DA
      duration_minutes: 120,
      max_guests: 6,
      is_published: true,
      main_image_url: "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
    },
    {
      id: "2",
      title: "Sortie Pêche - Les Falaises",
      boatName: "Le Pêcheur II",
      type: "shared",
      price_per_seat: 350000, // 3,500 DA
      duration_minutes: 180,
      max_guests: 8,
      is_published: false,
      main_image_url: "https://lh3.googleusercontent.com/p/AF1QipP_n0cM3r_G9pE3D_nF8wWvTf2FhQ4-1B1H4o0R=s1360-w1360-h1020",
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono text-on-surface">Ma Flotte & Expériences</h1>
          <p className="text-sm text-on-surface-variant mt-1">Gérez vos bateaux et les sorties que vous proposez.</p>
        </div>
        <Button className="bg-primary text-white">
          <Plus className="h-4 w-4 mr-2" /> Ajouter un bateau
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {MOCK_EXPERIENCES.map((exp) => (
          <Card key={exp.id} className={`border-none custom-shadow overflow-hidden ${!exp.is_published ? 'opacity-80' : ''}`}>
            <div className="flex flex-col sm:flex-row h-full">
              {/* Image */}
              <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
                <Image
                  src={exp.main_image_url}
                  alt={exp.title}
                  fill
                  className="object-cover"
                />
                {!exp.is_published && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary" className="bg-black/60 text-white border-none">Brouillon</Badge>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <CardContent className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={exp.type === 'private' ? 'secondary' : 'default'} className="mb-2">
                      {exp.type === 'private' ? 'Bateau Privé' : 'Partagé'}
                    </Badge>
                    {exp.is_published ? (
                      <div className="flex items-center text-xs text-success font-medium">
                        <ToggleRight className="h-5 w-5 mr-1" /> Publié
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-on-surface-variant font-medium">
                        <ToggleLeft className="h-5 w-5 mr-1" /> Non publié
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg leading-tight mb-1">{exp.title}</h3>
                  <div className="flex items-center text-sm text-on-surface-variant mb-4">
                    <Anchor className="h-3 w-3 mr-1" /> {exp.boatName}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-on-surface-variant">
                    <div>⏱ {exp.duration_minutes / 60} heures</div>
                    <div>👥 {exp.max_guests} pers. max</div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-surface-variant flex justify-between items-center">
                  <div className="font-mono font-bold text-primary">
                    {exp.type === 'private' ? `${(exp.price_total ?? 0) / 100} DA` : `${(exp.price_per_seat ?? 0) / 100} DA / pers`}
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-3 w-3 mr-2" /> Modifier
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="bg-primary-container/30 border border-primary/20 rounded-xl p-4 flex items-start gap-4">
        <Star className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-on-surface mb-1">Comment publier une nouvelle expérience ?</h4>
          <p className="text-sm text-on-surface-variant">
            Pour garantir la qualité de la plateforme, chaque nouvelle expérience doit être approuvée par l'équipe Safar DZ avant d'être visible par les clients. Contactez-nous sur WhatsApp après avoir créé votre fiche.
          </p>
        </div>
      </div>
    </div>
  );
}
