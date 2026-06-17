import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Edit2, Plus, Trash2, Eye } from "lucide-react";

export default async function AdminDestinationsPage() {
  const MOCK_DESTINATIONS = [
    {
      id: "d1",
      name: "Cap Carbon",
      slug: "cap-carbon",
      description: "L'un des plus hauts phares naturels au monde, offrant des paysages spectaculaires.",
      photo_url: "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
      experience_count: 5,
      is_active: true,
    },
    {
      id: "d2",
      name: "Île des Pisans",
      slug: "ile-des-pisans",
      description: "Magnifique île sauvage de Béjaïa accessible uniquement par mer, idéale pour la plongée.",
      photo_url: "https://lh3.googleusercontent.com/p/AF1QipNjQZ5hNfWw9O9n5zXgZ4E9FkO6W4W3oR2Z8x9C=s1360-w1360-h1020",
      experience_count: 3,
      is_active: true,
    },
    {
      id: "d3",
      name: "Gouraya",
      slug: "gouraya",
      description: "Parc national majestueux surplombant la baie, avec ses singes magots et sentiers de randonnée.",
      photo_url: "https://lh3.googleusercontent.com/p/AF1QipO9oV9R-lO7T3p5E6qR2t9U8W1O-vP3Z2J6c3O1=s1360-w1360-h1020",
      experience_count: 4,
      is_active: true,
    },
    {
      id: "d4",
      name: "Les Falaises",
      slug: "les-falaises",
      description: "Falaises rocheuses impressionnantes idéales pour les sorties pêche et baignades sauvages.",
      photo_url: "https://lh3.googleusercontent.com/p/AF1QipP_n0cM3r_G9pE3D_nF8wWvTf2FhQ4-1B1H4o0R=s1360-w1360-h1020",
      experience_count: 2,
      is_active: false,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono text-on-surface">Gestion des Destinations</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Gérez les zones géographiques et destinations de navigation disponibles sur Safar DZ.
          </p>
        </div>
        <Button className="bg-primary text-white font-medium">
          <Plus className="h-4 w-4 mr-2" /> Ajouter une destination
        </Button>
      </div>

      {/* Destinations List */}
      <Card className="border-none custom-shadow bg-surface">
        <CardHeader className="border-b border-surface-variant flex flex-col sm:flex-row gap-4 items-center justify-between pb-4">
          <div className="relative w-full sm:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <Input placeholder="Chercher une destination..." className="pl-10" />
          </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-container-lowest text-xs text-on-surface-variant uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/4">Destination</th>
                <th className="px-6 py-4 font-semibold w-1/2">Description</th>
                <th className="px-6 py-4 font-semibold text-center w-12">Expériences</th>
                <th className="px-6 py-4 font-semibold text-center w-24">Statut</th>
                <th className="px-6 py-4 font-semibold text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {MOCK_DESTINATIONS.map((dest) => (
                <tr key={dest.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      {dest.photo_url ? (
                        <img 
                          src={dest.photo_url} 
                          alt={dest.name} 
                          className="w-16 h-12 rounded object-cover border border-surface-variant bg-surface-container-low" 
                        />
                      ) : (
                        <div className="w-16 h-12 rounded bg-surface-variant flex items-center justify-center text-on-surface-variant">
                          <MapPin className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-on-surface">{dest.name}</div>
                        <div className="text-on-surface-variant text-xs font-mono">/{dest.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-on-surface-variant line-clamp-2 text-xs md:text-sm">
                      {dest.description}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="secondary" className="font-mono">{dest.experience_count}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {dest.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="danger">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 hover:bg-surface-variant">
                        <Eye className="h-4 w-4 text-on-surface-variant" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 hover:bg-surface-variant">
                        <Edit2 className="h-4 w-4 text-on-surface-variant" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-error hover:bg-error-container border-error hover:text-on-error-container">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
