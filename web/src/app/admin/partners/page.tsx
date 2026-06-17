import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Phone, Mail, Anchor, ShieldCheck } from "lucide-react";
import { formatPriceDA, formatPhone } from "@/lib/utils/format";

export default async function AdminPartnersPage() {
  const MOCK_PARTNERS = [
    { id: "p1", name: "Capitaine Salim", phone: "0550123456", email: "salim@example.com", boats: 2, total_revenue: 1250000, joined: "Mai 2026", status: "active" },
    { id: "p2", name: "Evasion Marine", phone: "0660987654", email: "contact@evasion.dz", boats: 5, total_revenue: 4500000, joined: "Avril 2026", status: "active" },
    { id: "p3", name: "Nautica DZ", phone: "0771223344", email: "nautica@example.com", boats: 1, total_revenue: 350000, joined: "Juin 2026", status: "pending" },
    { id: "p4", name: "Amine Boat", phone: "0555667788", email: "amine@example.com", boats: 0, total_revenue: 0, joined: "Aujourd'hui", status: "pending" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono text-on-surface">Partenaires & Propriétaires</h1>
          <p className="text-sm text-on-surface-variant mt-1">Gérez le réseau de partenaires de Safar DZ.</p>
        </div>
        <Button className="bg-primary text-white">Ajouter manuellement</Button>
      </div>

      <Card className="border-none custom-shadow bg-surface">
        <CardHeader className="border-b border-surface-variant flex flex-col sm:flex-row gap-4 items-center justify-between pb-4">
          <div className="relative w-full sm:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <Input placeholder="Chercher un partenaire..." className="pl-10" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Filter className="h-4 w-4 mr-2" /> Statut
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-container-lowest text-xs text-on-surface-variant uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Partenaire</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold text-center">Bateaux</th>
                <th className="px-6 py-4 font-semibold text-right">CA Généré</th>
                <th className="px-6 py-4 font-semibold text-center">Statut</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {MOCK_PARTNERS.map((partner) => (
                <tr key={partner.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-on-surface">{partner.name}</div>
                    <div className="text-on-surface-variant text-xs mt-1">Inscrit en {partner.joined}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-on-surface mb-1">
                      <Phone className="h-3 w-3 mr-2 text-on-surface-variant" /> {formatPhone(partner.phone)}
                    </div>
                    <div className="flex items-center text-on-surface-variant text-xs">
                      <Mail className="h-3 w-3 mr-2" /> {partner.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="secondary" className="font-mono">{partner.boats}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-on-surface-variant">
                    {formatPriceDA(partner.total_revenue * 100)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {partner.status === "active" ? (
                      <Badge variant="success">Actif</Badge>
                    ) : (
                      <Badge variant="warning">En attente</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {partner.status === "pending" ? (
                      <Button size="sm" className="bg-success hover:bg-success/90 text-white">
                        <ShieldCheck className="h-4 w-4 mr-1" /> Valider
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">Gérer</Button>
                    )}
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
