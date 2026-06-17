import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function AdminExperiencesPage() {
  const MOCK_EXPERIENCES = [
    { id: "1", title: "Balade privée Cap Carbon & Aiguades", partner: "Capitaine Salim", destination: "Cap Carbon", status: "approved" },
    { id: "2", title: "Sortie Pêche - Les Falaises", partner: "Evasion Marine", destination: "Les Falaises", status: "pending_approval" },
    { id: "3", title: "Tour Partagé - Île des Pisans", partner: "Nautica DZ", destination: "Île des Pisans", status: "approved" },
    { id: "4", title: "Jet Ski sensation 30min", partner: "Amine Boat", destination: "Aokas", status: "rejected" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono text-on-surface">Expériences & Annonces</h1>
          <p className="text-sm text-on-surface-variant mt-1">Modérez les annonces créées par les partenaires.</p>
        </div>
      </div>

      <Card className="border-none custom-shadow bg-surface">
        <CardHeader className="border-b border-surface-variant flex flex-col sm:flex-row gap-4 items-center justify-between pb-4">
          <div className="relative w-full sm:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <Input placeholder="Chercher une annonce..." className="pl-10" />
          </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-container-lowest text-xs text-on-surface-variant uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Titre de l'expérience</th>
                <th className="px-6 py-4 font-semibold">Partenaire</th>
                <th className="px-6 py-4 font-semibold">Destination</th>
                <th className="px-6 py-4 font-semibold text-center">Statut</th>
                <th className="px-6 py-4 font-semibold text-right">Modération</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {MOCK_EXPERIENCES.map((exp) => (
                <tr key={exp.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-4 font-medium text-on-surface">{exp.title}</td>
                  <td className="px-6 py-4">{exp.partner}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center text-on-surface-variant"><MapPin className="h-4 w-4 mr-1 text-primary" />{exp.destination}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {exp.status === "approved" && <Badge variant="success">Approuvé</Badge>}
                    {exp.status === "pending_approval" && <Badge variant="warning">En attente</Badge>}
                    {exp.status === "rejected" && <Badge variant="danger">Rejeté</Badge>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {exp.status === "pending_approval" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="outline" className="text-success hover:text-success hover:bg-success-container border-success">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="text-error hover:text-error hover:bg-error-container border-error">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm">Consulter</Button>
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
