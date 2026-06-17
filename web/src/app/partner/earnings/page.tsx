import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, DollarSign, Wallet, ArrowRightLeft } from "lucide-react";
import { formatPriceDA } from "@/lib/utils/format";

export default async function PartnerEarningsPage() {
  const MOCK_FINANCE = {
    totalRevenue: 12500000, // 125,000 DA
    pendingPayout: 3500000, // 35,000 DA
    thisMonth: 4500000,     // 45,000 DA
    commissionRate: 15,
  };

  const MOCK_TRANSACTIONS = [
    { id: "1", ref: "SF-9042", date: "2026-07-20", title: "Balade Cap Carbon", total: 20000, safar_cut: 3000, net: 17000, status: "pending" },
    { id: "2", ref: "SF-4190", date: "2026-07-18", title: "Sortie Pêche", total: 15000, safar_cut: 2250, net: 12750, status: "paid" },
    { id: "3", ref: "SF-1122", date: "2026-07-15", title: "Balade Cap Carbon", total: 20000, safar_cut: 3000, net: 17000, status: "paid" },
    { id: "4", ref: "SF-8831", date: "2026-07-10", title: "Tour Partagé", total: 10500, safar_cut: 1575, net: 8925, status: "paid" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono text-on-surface">Revenus & Facturation</h1>
          <p className="text-sm text-on-surface-variant mt-1">Suivez vos gains et l'état de vos reversements.</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" /> Exporter (Excel)
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none custom-shadow bg-surface">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-primary-container flex items-center justify-center text-primary">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">Total généré (Net Partenaire)</p>
            <h2 className="text-3xl font-bold font-mono text-on-surface">{formatPriceDA(MOCK_FINANCE.totalRevenue)}</h2>
          </CardContent>
        </Card>

        <Card className="border-none custom-shadow bg-surface border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-warning-container flex items-center justify-center text-on-warning-container">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">En attente de reversement</p>
            <h2 className="text-3xl font-bold font-mono text-on-surface">{formatPriceDA(MOCK_FINANCE.pendingPayout)}</h2>
          </CardContent>
        </Card>

        <Card className="border-none custom-shadow bg-surface">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-success-container flex items-center justify-center text-on-success-container">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">Ce mois-ci</p>
            <h2 className="text-3xl font-bold font-mono text-on-surface">{formatPriceDA(MOCK_FINANCE.thisMonth)}</h2>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Transactions Table */}
        <div className="lg:col-span-2">
          <Card className="border-none custom-shadow h-full">
            <CardHeader className="border-b border-surface-variant pb-4">
              <CardTitle className="text-lg">Détails des transactions</CardTitle>
              <CardDescription>Commission Safar DZ : {MOCK_FINANCE.commissionRate}%</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-container-lowest text-xs text-on-surface-variant uppercase border-b border-surface-variant">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Référence</th>
                    <th className="px-6 py-4 font-semibold text-right">Total Client</th>
                    <th className="px-6 py-4 font-semibold text-right text-error">- Commission</th>
                    <th className="px-6 py-4 font-semibold text-right text-success">Net à percevoir</th>
                    <th className="px-6 py-4 font-semibold text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant">
                  {MOCK_TRANSACTIONS.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-4">{tx.date}</td>
                      <td className="px-6 py-4 font-mono font-medium">{tx.ref}</td>
                      <td className="px-6 py-4 text-right font-mono text-on-surface-variant">{formatPriceDA(tx.total * 100)}</td>
                      <td className="px-6 py-4 text-right font-mono text-error">{formatPriceDA(tx.safar_cut * 100)}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-success">{formatPriceDA(tx.net * 100)}</td>
                      <td className="px-6 py-4 text-center">
                        {tx.status === 'paid' ? (
                          <Badge variant="success">Versé</Badge>
                        ) : (
                          <Badge variant="warning">En attente</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <div>
          <Card className="border-none custom-shadow bg-surface-container-lowest h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ArrowRightLeft className="h-5 w-5 mr-2 text-primary" /> 
                Fonctionnement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-on-surface-variant">
              <p>
                <strong>1. Encaissement</strong><br/>
                Vous encaissez la totalité du montant directement auprès du client le jour de l'expérience.
              </p>
              <p>
                <strong>2. Commission</strong><br/>
                Safar DZ facture une commission de {MOCK_FINANCE.commissionRate}% sur chaque réservation réussie.
              </p>
              <p>
                <strong>3. Régularisation</strong><br/>
                Vous devez reverser le montant de la commission à Safar DZ à la fin de chaque mois. Un récapitulatif vous sera envoyé.
              </p>
              
              <div className="mt-8 p-4 bg-error-container/30 rounded-xl border border-error/20">
                <h4 className="font-semibold text-error mb-2">Commission due (Juillet)</h4>
                <div className="text-2xl font-mono font-bold text-error mb-4">
                  10 825 DA
                </div>
                <Button className="w-full bg-error hover:bg-error/90 text-white">
                  Payer ma facture
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
