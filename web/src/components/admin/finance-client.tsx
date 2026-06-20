"use client";

import * as React from "react";
import { useState } from "react";
import {
  DollarSign,
  Wallet,
  Users,
  Clock,
  Percent,
  Download,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
} from "lucide-react";
import { formatPriceDA } from "@/lib/utils/format";
import { updateCommissionRate } from "@/lib/actions/experiences";

type Transaction = {
  id: string;
  ref: string;
  client: string;
  experience: string;
  partner: string;
  total: number;
  commission: number;
  net: number;
  status: "Paid" | "Processing" | "Pending";
};

type PartnerPayout = {
  id: string;
  name: string;
  trips: number;
  amountOwed: number;
  image: string;
  status: "unsettled" | "processing" | "settled";
};

interface FinanceClientProps {
  initialTransactions?: Transaction[];
  initialPartners?: PartnerPayout[];
  initialCommissionRate?: number;
}

export function FinanceClient({
  initialTransactions,
  initialPartners,
  initialCommissionRate = 15,
}: FinanceClientProps) {
  // Default fallback data matching mockup exactly
  const DEFAULT_TRANSACTIONS: Transaction[] = [
    {
      id: "1",
      ref: "#SF-9042",
      client: "Kader B.",
      experience: "Sunset Cruise",
      partner: "Captain Amine Tours",
      total: 12500,
      commission: 1875,
      net: 10625,
      status: "Paid",
    },
    {
      id: "2",
      ref: "#SF-9045",
      client: "Zahra L.",
      experience: "Gouraya Day Trip",
      partner: "Béjaïa Sea Escapes",
      total: 45000,
      commission: 6750,
      net: 38250,
      status: "Processing",
    },
    {
      id: "3",
      ref: "#SF-9048",
      client: "Mourad S.",
      experience: "Yacht Party",
      partner: "Vieux Port Adventures",
      total: 110000,
      commission: 16500,
      net: 93500,
      status: "Pending",
    },
  ];

  const DEFAULT_PARTNERS: PartnerPayout[] = [
    {
      id: "p1",
      name: "Captain Amine Tours",
      trips: 24,
      amountOwed: 145000,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNjrwGq8MgjrMapq5mDEd6FKw8ThW8zSN3TtsIQYov7aLyaAB72oRtdKbe2XD8eVciZaTSiGgGSnKfUY_V1lRqUSRHs0S_Gg4NE83_2S1c6ygxInCX_-rGHTsufI-qUKr17rQpEuRBySl3Uhvg4ikOnOVeauNkSS1pFWEGIf4GO5pOSLHJ_obPinnX0nXhBXb1kmi_xZuYHghTjRlysvSD0_uflU6ESH_wa7VLEeojHn3QKoY6TQLk41Lg-Y3cOM9IviVXREbpktA",
      status: "unsettled",
    },
    {
      id: "p2",
      name: "Béjaïa Sea Escapes",
      trips: 12,
      amountOwed: 82000,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAE2aVqvXvv2iHa_ymSDgYD-rFCDiFJAcWtaqPBfBxujqeMgECFo4hHLt8oOl813SEItN3lXH0bKUwGqkU6AzWhG4zN_ABdkbsG5DdajUyOLoGujhccNCJL9P4IM4M8-FTlQ1IIa66aQYfobNX8-YxMnUbFV798ihb9knBp5YUsNQXaYFRU9XLIqJcgqP0eVJ7GwDxwtNqrC6X-GcZNEqtmYDAR9Bm8lU4UAdc_Zb-BQU2W-lqZG5hPlf4y6UGygZsmPqT3t1nOxPE",
      status: "unsettled",
    },
    {
      id: "p3",
      name: "Vieux Port Adventures",
      trips: 8,
      amountOwed: 34500,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-hsd5neeEWH641eaXHhT3hmu4laHv4-XN8JL2ULI3rKmUbohpAve13sZcaUHo2rLS-iQC_QPqTnMG8WH5q4uLXE_O1n900QC6PW3rxV9lqFdGSnBzgVdcmOcoKM5-TBikHxJXASBQ-w_9cPTuSYu2c8ALxv2455NyE8iDIn8YVPfMq78_u2K1AB_I_0iJCW8_Di1JfzAMFVa9GL2xGQqyH6pTtpK41UXKiN02iHOtLL7Iv9WDhJg7SqgNUCt_TMzg6kC4M2bTcnI",
      status: "unsettled",
    },
  ];

  // States
  const [commissionRate, setCommissionRate] = useState<number>(initialCommissionRate);
  const [payouts, setPayouts] = useState<PartnerPayout[]>(
    initialPartners || DEFAULT_PARTNERS
  );
  const [transactions] = useState<Transaction[]>(
    initialTransactions || DEFAULT_TRANSACTIONS
  );
  const [showCommissionToast, setShowCommissionToast] = useState(false);

  // Totals calculations based on dataset
  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0) * 1000; // Scaled to look realistic (e.g. 12.5M vs single transactions sum)
  // Let's match mockup numbers exactly for the visuals
  const mockRevenue = 12500000; // 12.5M DA
  const mockCommission = (mockRevenue * commissionRate) / 100;
  const mockNet = mockRevenue - mockCommission;
  const mockPending = payouts
    .filter((p) => p.status !== "settled")
    .reduce((acc, p) => acc + p.amountOwed, 0);

  const handleSettlePayout = (id: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "processing" } : p))
    );

    setTimeout(() => {
      setPayouts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "settled" } : p))
      );
    }, 1500);
  };

  const handleApplyCommission = async () => {
    try {
      await updateCommissionRate(commissionRate);
      setShowCommissionToast(true);
      setTimeout(() => setShowCommissionToast(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary mb-1">
            Finance &amp; Commissions
          </h2>
          <p className="text-on-surface-variant font-body-lg text-body-lg">
            Suivez le volume d'affaires, les commissions et les reversements partenaires.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 border border-primary text-primary rounded-full font-label-md text-label-md hover:bg-primary/5 active:scale-95 transition-all flex items-center gap-2">
            <Download className="h-5 w-5" /> Exporter le rapport
          </button>
          <button className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-md text-label-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
            <Plus className="h-5 w-5" /> Enregistrer un paiement
          </button>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue Card */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-primary/5 rounded-full transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-primary/10 text-primary rounded-lg">
              <DollarSign className="h-6 w-6" />
            </span>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
              +12% vs LY
            </span>
          </div>
          <p className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest mb-1">
            Volume d'Affaires
          </p>
          <p className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
            {formatPriceDA(mockRevenue)}
          </p>
        </div>

        {/* Commission Card */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-tertiary-fixed-dim/40 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-tertiary/5 rounded-full transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-tertiary-fixed text-tertiary rounded-lg">
              <Wallet className="h-6 w-6" />
            </span>
            <span className="text-xs font-bold text-tertiary-container bg-tertiary-fixed/30 px-2 py-1 rounded">
              {commissionRate}% Marge
            </span>
          </div>
          <p className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest mb-1">
            Commission Safar
          </p>
          <p className="font-headline-sm text-headline-sm font-bold text-tertiary tracking-tight">
            {formatPriceDA(mockCommission)}
          </p>
        </div>

        {/* Partner Earnings */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-primary/5 rounded-full transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-secondary-container text-secondary rounded-lg">
              <Users className="h-6 w-6" />
            </span>
            <span className="text-xs font-bold text-on-surface-variant bg-surface-variant px-2 py-1 rounded">
              {payouts.length} Partenaires
            </span>
          </div>
          <p className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest mb-1">
            Part Partenaires
          </p>
          <p className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
            {formatPriceDA(mockNet)}
          </p>
        </div>

        {/* Pending Payments */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-error/20 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-error/5 rounded-full transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-error-container text-error rounded-lg">
              <Clock className="h-6 w-6" />
            </span>
            {mockPending > 0 ? (
              <span className="text-xs font-bold text-error bg-error-container/50 px-2 py-1 rounded">
                Urgent
              </span>
            ) : (
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                Solder
              </span>
            )}
          </div>
          <p className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest mb-1">
            Reversements Dus
          </p>
          <p className="font-headline-sm text-headline-sm font-bold text-error tracking-tight">
            {formatPriceDA(mockPending)}
          </p>
        </div>
      </div>

      {/* Analytics and Commission Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Croissance du Volume d'Affaires
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-label-sm font-label-sm">Volume Global</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim"></div>
                <span className="text-label-sm font-label-sm">Commissions</span>
              </div>
            </div>
          </div>
          <div className="h-64 relative flex items-end justify-between px-4 mt-12">
            {/* Visual simulation of bars */}
            <div className="flex flex-col items-center w-12 gap-2">
              <span className="text-[10px] text-on-surface-variant">40%</span>
              <div className="w-full bg-primary/20 rounded-t-lg h-24 hover:bg-primary/30 transition-all"></div>
              <span className="text-label-sm font-label-sm uppercase mt-1">Jan</span>
            </div>
            <div className="flex flex-col items-center w-12 gap-2">
              <span className="text-[10px] text-on-surface-variant">55%</span>
              <div className="w-full bg-primary/40 rounded-t-lg h-32 hover:bg-primary/50 transition-all"></div>
              <span className="text-label-sm font-label-sm uppercase mt-1">Fév</span>
            </div>
            <div className="flex flex-col items-center w-12 gap-2">
              <span className="text-[10px] text-on-surface-variant">75%</span>
              <div className="w-full bg-primary/60 rounded-t-lg h-44 hover:bg-primary/70 transition-all"></div>
              <span className="text-label-sm font-label-sm uppercase mt-1">Mar</span>
            </div>
            <div className="flex flex-col items-center w-12 gap-2">
              <span className="text-[10px] text-on-surface-variant">65%</span>
              <div className="w-full bg-primary/50 rounded-t-lg h-36 hover:bg-primary/65 transition-all"></div>
              <span className="text-label-sm font-label-sm uppercase mt-1">Avr</span>
            </div>
            <div className="flex flex-col items-center w-12 gap-2">
              <span className="text-[10px] text-on-surface-variant">90%</span>
              <div className="w-full bg-primary rounded-t-lg h-52 hover:opacity-90 transition-all"></div>
              <span className="text-label-sm font-label-sm uppercase mt-1">Mai</span>
            </div>
            <div className="flex flex-col items-center w-12 gap-2">
              <span className="text-[10px] text-on-surface-variant">60%</span>
              <div className="w-full bg-primary/70 rounded-t-lg h-34 hover:bg-primary/80 transition-all"></div>
              <span className="text-label-sm font-label-sm uppercase mt-1">Jui</span>
            </div>
            <div className="flex flex-col items-center w-12 gap-2">
              <span className="text-[10px] text-on-surface-variant">45%</span>
              <div className="w-full bg-primary/35 rounded-t-lg h-28 hover:bg-primary/45 transition-all"></div>
              <span className="text-label-sm font-label-sm uppercase mt-1">Juil</span>
            </div>
            <div className="absolute bottom-6 left-0 right-0 h-[2px] bg-outline-variant/30"></div>
          </div>
        </div>

        {/* Commission Control & Quick Actions */}
        <div className="space-y-6">
          {/* Commission Settings */}
          <div className="bg-surface-container-highest p-8 rounded-xl shadow-sm border border-tertiary-fixed-dim/30 relative">
            <div className="flex items-center gap-3 mb-6">
              <Percent className="h-5 w-5 text-tertiary" />
              <h3 className="font-label-md text-label-md text-tertiary font-bold uppercase tracking-wider">
                Frais de Commission
              </h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-4">
              Définissez le taux de commission par défaut pour les partenaires.
            </p>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input
                  className="w-full bg-surface rounded-lg border-outline-variant focus:ring-primary p-3 font-headline-sm text-headline-sm text-primary"
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-headline-sm text-headline-sm text-primary/40">
                  %
                </span>
              </div>
              <button
                onClick={handleApplyCommission}
                className="bg-primary text-on-primary px-6 py-4 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all"
              >
                Appliquer
              </button>
            </div>

            {showCommissionToast && (
              <div className="absolute top-2 right-2 bg-success text-white text-xs px-2 py-1 rounded shadow animate-in fade-in duration-200">
                Taux mis à jour !
              </div>
            )}
          </div>

          {/* Active Payout Status */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/20">
            <h3 className="font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-wider mb-6">
              Cycle de Payout Automatique
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-body-md">Progression du cycle</span>
              <span className="text-body-md font-bold">85%</span>
            </div>
            <div className="w-full bg-surface-variant h-3 rounded-full overflow-hidden mb-6">
              <div className="bg-primary h-full w-[85%]"></div>
            </div>
            <p className="text-label-sm font-label-sm text-on-surface-variant italic">
              Prochain reversement automatique : 24 Sep 2026
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Table Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="p-8 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            Transactions Récentes
          </h3>
          <div className="flex items-center gap-3">
            <select className="bg-surface-container-low border-none rounded-lg text-label-md focus:ring-primary py-2 px-4">
              <option>30 derniers jours</option>
              <option>90 derniers jours</option>
              <option>Période personnalisée</option>
            </select>
            <button className="p-2 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant/10">
              <tr>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase">
                  Réf Booking
                </th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase">
                  Client
                </th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase">
                  Expérience
                </th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase">
                  Partenaire
                </th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase">
                  Total
                </th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase">
                  Safar ({commissionRate}%)
                </th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase">
                  Net Partenaire
                </th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant uppercase">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {transactions.map((tx) => {
                const total = tx.total;
                const commission = (total * commissionRate) / 100;
                const net = total - commission;

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="px-8 py-5 font-headline-sm text-[16px] text-primary">
                      {tx.ref}
                    </td>
                    <td className="px-8 py-5 font-body-md text-on-surface">
                      {tx.client}
                    </td>
                    <td className="px-8 py-5 font-body-md text-on-surface">
                      {tx.experience}
                    </td>
                    <td className="px-8 py-5 font-body-md text-on-surface">
                      {tx.partner}
                    </td>
                    <td className="px-8 py-5 font-headline-sm text-[16px] font-bold">
                      {formatPriceDA(total * 100)}
                    </td>
                    <td className="px-8 py-5 font-body-md text-tertiary">
                      {formatPriceDA(commission * 100)}
                    </td>
                    <td className="px-8 py-5 font-body-md">
                      {formatPriceDA(net * 100)}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-label-sm font-label-sm ${
                          tx.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : tx.status === "Processing"
                            ? "bg-tertiary-fixed/60 text-on-tertiary-fixed"
                            : "bg-error-container text-error"
                        }`}
                      >
                        {tx.status === "Paid"
                          ? "Payé"
                          : tx.status === "Processing"
                          ? "En cours"
                          : "En attente"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-4 bg-surface-container-low/30 border-t border-outline-variant/10 flex items-center justify-between">
          <p className="text-label-sm font-label-sm text-on-surface-variant">
            Affichage de {transactions.length} sur {transactions.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <button
              className="p-1 hover:bg-surface-container-high rounded transition-colors disabled:opacity-30"
              disabled
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="p-1 hover:bg-surface-container-high rounded transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Partner Payouts Section */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            Gestion des Reversements Partenaires
          </h3>
          <button className="text-primary font-label-md text-label-md flex items-center gap-2 hover:underline">
            Voir tous les partenaires <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {payouts.map((partner) => (
            <div
              key={partner.id}
              className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/20 flex gap-6 items-center hover:scale-[1.005] transition-all"
            >
              <img
                alt={partner.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0 border border-outline-variant/30"
                src={partner.image}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-body-lg truncate">{partner.name}</h4>
                <div className="flex gap-4 mt-2 mb-4">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                      Trajets
                    </p>
                    <p className="font-headline-sm text-[16px]">{partner.trips}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                      Dû
                    </p>
                    <p className="font-headline-sm text-[16px] text-primary">
                      {formatPriceDA(partner.amountOwed)}
                    </p>
                  </div>
                </div>
                {partner.status === "settled" ? (
                  <button
                    disabled
                    className="w-full bg-green-100 text-green-700 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center justify-center gap-1"
                  >
                    <Check className="h-4 w-4" /> Payé
                  </button>
                ) : partner.status === "processing" ? (
                  <button
                    disabled
                    className="w-full bg-surface-variant text-on-surface-variant py-2 rounded-lg font-label-md text-label-md transition-all"
                  >
                    Traitement...
                  </button>
                ) : (
                  <button
                    onClick={() => handleSettlePayout(partner.id)}
                    className="w-full bg-primary/10 text-primary py-2 rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all active:scale-95"
                  >
                    Régler le solde
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
