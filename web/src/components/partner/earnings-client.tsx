"use client";

import { useState, useMemo } from "react";
import { Download, TrendingUp, Calendar, CreditCard, ArrowRightLeft } from "lucide-react";
import { formatPriceDA } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EarningsClientProps {
  bookings: any[];
}

export function EarningsClient({ bookings }: EarningsClientProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Filter out cancelled bookings for revenue calculations
  const activeBookings = useMemo(() => {
    return bookings.filter(b => b.status !== "cancelled");
  }, [bookings]);

  // Months available in history for filtering
  const months = useMemo(() => {
    const list = new Set<string>();
    bookings.forEach(b => {
      if (b.booking_date) {
        const parts = b.booking_date.split("-");
        if (parts.length >= 2) {
          list.add(`${parts[0]}-${parts[1]}`); // YYYY-MM
        }
      }
    });
    return Array.from(list).sort().reverse();
  }, [bookings]);

  // Filtered bookings based on selected month
  const filteredBookings = useMemo(() => {
    if (selectedMonth === "all") return bookings;
    return bookings.filter(b => b.booking_date?.startsWith(selectedMonth));
  }, [bookings, selectedMonth]);

  const filteredActiveBookings = useMemo(() => {
    return filteredBookings.filter(b => b.status !== "cancelled");
  }, [filteredBookings]);

  // Financial calculations
  const stats = useMemo(() => {
    let directGross = 0;
    let directCount = 0;

    let marketplaceGross = 0;
    let marketplaceCommission = 0;
    let marketplaceNet = 0;
    let marketplaceCount = 0;

    filteredActiveBookings.forEach(b => {
      const isDirect = b.booking_source === "PARTNER_DIRECT" || b.booking_source === "PARTNER_MANUAL";
      const amount = Number(b.total_amount || b.provider_amount || 0);

      if (isDirect) {
        directGross += amount;
        directCount += 1;
      } else {
        const rate = Number(b.commission_rate || 15);
        const commAmount = Number(b.commission_amount || (amount * (rate / 100)));
        const netAmount = Number(b.provider_amount || (amount - commAmount));

        marketplaceGross += amount;
        marketplaceCommission += commAmount;
        marketplaceNet += netAmount;
        marketplaceCount += 1;
      }
    });

    const totalNet = directGross + marketplaceNet;

    return {
      directGross,
      directCount,
      marketplaceGross,
      marketplaceCommission,
      marketplaceNet,
      marketplaceCount,
      totalNet
    };
  }, [filteredActiveBookings]);

  // Periodic breakdowns
  const periodicStats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    // Start of current week (last 7 days for simplicity)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

    // Current Month Prefix
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    let todayNet = 0;
    let weekNet = 0;
    let monthNet = 0;

    activeBookings.forEach(b => {
      const isDirect = b.booking_source === "PARTNER_DIRECT" || b.booking_source === "PARTNER_MANUAL";
      const amount = Number(b.total_amount || 0);
      const netAmount = isDirect ? amount : Number(b.provider_amount || (amount * 0.85));

      if (b.booking_date === todayStr) {
        todayNet += netAmount;
      }
      if (b.booking_date >= sevenDaysAgoStr) {
        weekNet += netAmount;
      }
      if (b.booking_date.startsWith(currentMonthPrefix)) {
        monthNet += netAmount;
      }
    });

    return {
      todayNet,
      weekNet,
      monthNet
    };
  }, [activeBookings]);

  // Format month label
  const formatMonthLabel = (yymm: string) => {
    if (yymm === "all") return "Toutes les périodes";
    const [year, month] = yymm.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Summary Cards Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 flex flex-col justify-between h-40 shadow-sm hover:translate-y-[-4px] hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant text-label-md font-bold">Aujourd&apos;hui (Net)</span>
            <span className="text-primary bg-primary-fixed-dim/20 p-2 rounded-xl text-sm">📅</span>
          </div>
          <div>
            <p className="font-mono font-bold text-headline-md text-primary">{formatPriceDA(periodicStats.todayNet)}</p>
            <p className="text-success text-xs font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5" /> Direct + Safar
            </p>
          </div>
        </div>

        {/* This Week */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 flex flex-col justify-between h-40 shadow-sm hover:translate-y-[-4px] hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant text-label-md font-bold">7 derniers jours (Net)</span>
            <span className="text-primary bg-primary-fixed-dim/20 p-2 rounded-xl text-sm">📅</span>
          </div>
          <div>
            <p className="font-mono font-bold text-headline-md text-primary">{formatPriceDA(periodicStats.weekNet)}</p>
            <p className="text-success text-xs font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5" /> Activité constante
            </p>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 flex flex-col justify-between h-40 shadow-sm hover:translate-y-[-4px] hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant text-label-md font-bold">Ce Mois-ci (Net)</span>
            <span className="text-primary bg-primary-fixed-dim/20 p-2 rounded-xl text-sm">📅</span>
          </div>
          <div>
            <p className="font-mono font-bold text-headline-md text-primary">{formatPriceDA(periodicStats.monthNet)}</p>
            <p className="text-on-surface-variant text-xs font-bold mt-1">
              {activeBookings.filter(b => b.booking_date.startsWith(new Date().toISOString().split("T")[0].substring(0, 7))).length} réservations actives
            </p>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-primary text-on-primary p-6 rounded-3xl border border-primary flex flex-col justify-between h-40 shadow-md hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="font-bold text-label-md opacity-80">Revenu Net Global</span>
            <span className="bg-white/20 p-2 rounded-xl text-sm">⚓</span>
          </div>
          <div>
            <p className="font-mono font-bold text-headline-md text-white">{formatPriceDA(stats.totalNet)}</p>
            <p className="text-xs opacity-80 font-bold mt-1">Sur la période sélectionnée</p>
          </div>
        </div>
      </section>

      {/* Revenue Systems Split (Two Independent Sections) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECTION 1: Partner Own Reservations (Direct Revenue) */}
        <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-success/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-success/10 text-success rounded-xl text-base">
              🟩
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Réservations Propres</h3>
              <p className="text-on-surface-variant text-xs font-medium">Revenu direct (0% Commission Safar DZ)</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 text-center">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Ventes Brutes</p>
              <p className="font-mono font-bold text-md text-on-surface">{formatPriceDA(stats.directGross)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 text-center">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Commission</p>
              <p className="font-mono font-bold text-md text-neutral-400">0 DA</p>
            </div>
            <div className="p-4 rounded-2xl bg-success-container/10 border border-success/20 text-center">
              <p className="text-success text-[10px] font-bold uppercase tracking-wider mb-1">Revenu Net</p>
              <p className="font-mono font-bold text-md text-success">{formatPriceDA(stats.directGross)}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex justify-between items-center text-xs">
            <span className="text-on-surface-variant font-bold">Volume de ventes propres</span>
            <span className="font-mono font-bold text-on-surface">{stats.directCount} sorties directes</span>
          </div>
        </div>

        {/* SECTION 2: Safar DZ Reservations (Marketplace Revenue) */}
        <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl text-base">
              🟦
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Réservations Safar DZ</h3>
              <p className="text-on-surface-variant text-xs font-medium">Revenu marketplace (Commission appliquée)</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 text-center">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Ventes Brutes</p>
              <p className="font-mono font-bold text-md text-on-surface">{formatPriceDA(stats.marketplaceGross)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 text-center">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Commission</p>
              <p className="font-mono font-bold text-md text-tertiary">- {formatPriceDA(stats.marketplaceCommission)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-primary-container text-on-primary-container border border-primary/20 text-center">
              <p className="text-white text-[10px] font-bold uppercase tracking-wider mb-1">Revenu Net</p>
              <p className="font-mono font-bold text-md text-white">{formatPriceDA(stats.marketplaceNet)}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex justify-between items-center text-xs">
            <span className="text-on-surface-variant font-bold">Volume Safar DZ</span>
            <span className="font-mono font-bold text-on-surface">{stats.marketplaceCount} réservations</span>
          </div>
        </div>

      </section>

      {/* Transaction History Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-display-md">Historique des transactions</h3>
            <p className="text-on-surface-variant text-sm">Visualisation et filtres par source de réservation.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-xl border border-outline-variant/30 text-xs">
              <Calendar className="h-4 w-4 text-primary" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none focus:ring-0 p-0 font-bold outline-none cursor-pointer"
              >
                <option value="all">Tous les mois</option>
                {months.map(m => (
                  <option key={m} value={m}>{formatMonthLabel(m)}</option>
                ))}
              </select>
            </div>
            <Button variant="outline" className="h-9 text-xs font-bold border-outline-variant" shape="pill">
              <Download className="h-4 w-4 mr-2" /> Exporter
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant text-[10px] text-on-surface-variant uppercase font-bold">
                <tr>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-6 py-4">Référence</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Montant Brut</th>
                  <th className="px-6 py-4 text-right">Commission</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-8 py-4 text-right">Net Partenaire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-sm">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-8 text-center text-on-surface-variant italic">
                      Aucune transaction enregistrée pour cette période.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((tx) => {
                    const isDirect = tx.booking_source === "PARTNER_DIRECT" || tx.booking_source === "PARTNER_MANUAL";
                    const gross = Number(tx.total_amount || tx.provider_amount || 0);
                    const rate = isDirect ? 0 : Number(tx.commission_rate || 15);
                    const commission = isDirect ? 0 : Number(tx.commission_amount || (gross * (rate / 100)));
                    const net = isDirect ? gross : Number(tx.provider_amount || (gross - commission));

                    return (
                      <tr key={tx.id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-8 py-5 text-on-surface font-medium">{tx.booking_date}</td>
                        <td className="px-6 py-5 font-mono text-on-surface-variant">{tx.booking_ref}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isDirect ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            <span className="w-2 h-2 rounded-full bg-current" />
                            {isDirect ? "Partner Direct" : "Safar DZ"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-mono text-on-surface-variant">{formatPriceDA(gross)}</td>
                        <td className="px-6 py-5 text-right font-mono text-tertiary">
                          {isDirect ? "—" : `- ${formatPriceDA(commission)}`}
                        </td>
                        <td className="px-6 py-5 text-center">
                          {tx.status === "completed" ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-fixed text-primary font-bold text-[10px] uppercase">
                              🟢 Payé
                            </span>
                          ) : tx.status === "cancelled" ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold text-[10px] uppercase">
                              Annulé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed text-tertiary font-bold text-[10px] uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" /> En attente
                            </span>
                          )}
                        </td>
                        <td className={`px-8 py-5 text-right font-mono font-bold text-base ${
                          isDirect ? "text-success" : "text-primary"
                        }`}>
                          {formatPriceDA(net)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
