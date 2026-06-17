import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Percent, TrendingUp, Landmark, RefreshCw, Check, ArrowUpRight } from "lucide-react";
import { formatPriceDA } from "@/lib/utils/format";

export default async function AdminFinancePage() {
  const FINANCE_SUMMARY = {
    totalRevenue: 25000000,     // 250,000 DA
    safarCommission: 3750000,   // 37,500 DA (15%)
    partnerEarnings: 21250000,  // 212,500 DA (85%)
    pendingPayouts: 4500000,    // 45,000 DA
  };

  const RECENT_TRANSACTIONS = [
    { id: "1", ref: "SF-9042", client: "Amine B.", partner: "Capitaine Salim", total: 20000, commission: 3000, net: 17000, status: "completed" },
    { id: "2", ref: "SF-4190", client: "Karim M.", partner: "Evasion Marine", total: 15000, commission: 2250, net: 12750, status: "confirmed" },
    { id: "3", ref: "SF-1122", client: "Sarah L.", partner: "Capitaine Salim", total: 20000, commission: 3000, net: 17000, status: "completed" },
    { id: "4", ref: "SF-8831", client: "Yanis D.", partner: "Nautica DZ", total: 3500, commission: 525, net: 2975, status: "cancelled" },
    { id: "5", ref: "SF-5501", client: "Fouad K.", partner: "Evasion Marine", total: 12000, commission: 1800, net: 10200, status: "completed" },
  ];

  const PARTNER_PAYOUTS = [
    { id: "p1", name: "Capitaine Salim", trips: 8, total_revenue: 120000, pending_payout: 18000, last_payout: "2026-06-10", status: "pending" },
    { id: "p2", name: "Evasion Marine", trips: 15, total_revenue: 280000, pending_payout: 27000, last_payout: "2026-06-12", status: "pending" },
    { id: "p3", name: "Nautica DZ", trips: 4, total_revenue: 45000, pending_payout: 0, last_payout: "2026-06-15", status: "paid" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono text-on-surface">Finance & Commissions</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Suivi des flux financiers, des commissions (15%) et des reversements partenaires.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="font-medium">
            <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
          </Button>
          <Button size="sm" className="bg-primary text-white font-medium">
            Exporter le Grand Livre
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none custom-shadow bg-surface">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <Badge variant="success" className="text-xs">+14%</Badge>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">Volume d'Affaires Global</p>
            <h2 className="text-2xl font-bold font-mono text-on-surface">{formatPriceDA(FINANCE_SUMMARY.totalRevenue)}</h2>
          </CardContent>
        </Card>

        <Card className="border-none custom-shadow bg-surface border-l-4 border-l-success">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 rounded-full bg-success-light flex items-center justify-center text-success">
                <Percent className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="bg-success-light text-success font-bold">15.0%</Badge>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">Commissions Safar DZ (15%)</p>
            <h2 className="text-2xl font-bold font-mono text-on-surface">{formatPriceDA(FINANCE_SUMMARY.safarCommission)}</h2>
          </CardContent>
        </Card>

        <Card className="border-none custom-shadow bg-surface">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <Landmark className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">Part Partenaires (85%)</p>
            <h2 className="text-2xl font-bold font-mono text-on-surface">{formatPriceDA(FINANCE_SUMMARY.partnerEarnings)}</h2>
          </CardContent>
        </Card>

        <Card className="border-none custom-shadow bg-surface border-l-4 border-l-warning">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 rounded-full bg-warning-light flex items-center justify-center text-warning">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">Reversements en Attente</p>
            <h2 className="text-2xl font-bold font-mono text-on-surface">{formatPriceDA(FINANCE_SUMMARY.pendingPayouts)}</h2>
          </CardContent>
        </Card>
      </div>

      {/* Tables Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payouts to Settle */}
        <div className="lg:col-span-1">
          <Card className="border-none custom-shadow h-full bg-surface">
            <CardHeader className="border-b border-surface-variant">
              <CardTitle className="font-mono text-lg flex items-center">
                <Landmark className="h-5 w-5 mr-2 text-primary" /> Reversements Partenaires
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-surface-variant">
                {PARTNER_PAYOUTS.map((partner) => (
                  <div key={partner.id} className="p-4 space-y-3 hover:bg-surface-container-lowest transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-on-surface">{partner.name}</h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">{partner.trips} sorties effectuées</p>
                      </div>
                      {partner.status === "pending" ? (
                        <Badge variant="warning">À payer</Badge>
                      ) : (
                        <Badge variant="success">À jour</Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-xs text-on-surface-variant">Solde dû</span>
                        <div className="text-lg font-bold font-mono text-on-surface">
                          {formatPriceDA(partner.pending_payout * 100)}
                        </div>
                      </div>
                      {partner.status === "pending" && (
                        <Button size="sm" className="bg-success text-white hover:bg-success/90 h-8 px-3">
                          <Check className="h-4 w-4 mr-1" /> Solder
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions ledger */}
        <div className="lg:col-span-2">
          <Card className="border-none custom-shadow bg-surface h-full">
            <CardHeader className="border-b border-surface-variant flex flex-row items-center justify-between">
              <CardTitle className="font-mono text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-success" /> Grand Livre des Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-container-lowest text-xs text-on-surface-variant uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Réf</th>
                    <th className="px-4 py-3 font-semibold">Partenaire</th>
                    <th className="px-4 py-3 font-semibold text-right">Montant</th>
                    <th className="px-4 py-3 font-semibold text-right text-success">Com. (15%)</th>
                    <th className="px-4 py-3 font-semibold text-right text-primary">Net Partner</th>
                    <th className="px-4 py-3 font-semibold text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant">
                  {RECENT_TRANSACTIONS.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{tx.ref}</td>
                      <td className="px-4 py-3 font-medium text-on-surface">{tx.partner}</td>
                      <td className="px-4 py-3 text-right font-mono text-on-surface-variant">{formatPriceDA(tx.total * 100)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-success">{formatPriceDA(tx.commission * 100)}</td>
                      <td className="px-4 py-3 text-right font-mono text-primary">{formatPriceDA(tx.net * 100)}</td>
                      <td className="px-4 py-3 text-center">
                        {tx.status === "completed" && <Badge variant="success">Terminé</Badge>}
                        {tx.status === "confirmed" && <Badge variant="default">Confirmé</Badge>}
                        {tx.status === "cancelled" && <Badge variant="danger">Annulé</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
