"use client";

import { useState, useActionState } from "react";
import { login } from "../login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Ship, ArrowLeft } from "lucide-react";
import Link from "next/link";

const initialState = {
  error: "",
};

export default function PortalLoginPage() {
  const [activeTab, setActiveTab] = useState<"partner" | "admin">("partner");

  const [partnerState, partnerFormAction, isPartnerPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await login(formData);
      if (result?.error) {
        return { error: result.error };
      }
      return prevState;
    },
    initialState
  );

  const [adminState, adminFormAction, isAdminPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await login(formData);
      if (result?.error) {
        return { error: result.error };
      }
      return prevState;
    },
    initialState
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Back to Home */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au site public
        </Link>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight mb-3">
          Safar<span className="text-primary">DZ</span> Portal
        </h1>
        <p className="text-on-surface-variant max-w-md mx-auto">
          Espace de connexion réservé aux prestataires d'activités et aux administrateurs de la plateforme.
        </p>
      </div>

      {/* Tabs selector for small screens */}
      <div className="flex md:hidden bg-surface-container-low p-1 rounded-full mb-6 border border-outline-variant/20">
        <button
          onClick={() => setActiveTab("partner")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all ${
            activeTab === "partner"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant"
          }`}
        >
          <Ship className="h-4 w-4" />
          Partenaire
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all ${
            activeTab === "admin"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant"
          }`}
        >
          <Shield className="h-4 w-4" />
          Admin
        </button>
      </div>

      {/* Grid Layout: Side by Side on Desktop, Toggled Tabs on Mobile */}
      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        
        {/* PARTNER CARD */}
        <div className={`${activeTab === "partner" ? "block" : "hidden md:block"}`}>
          <Card className="glass-card custom-shadow border-0 h-full flex flex-col justify-between">
            <div>
              <CardHeader className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
                  <Ship className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Espace Partenaire</CardTitle>
                  <CardDescription className="mt-1">
                    Pour les propriétaires de bateaux et organisateurs d'activités
                  </CardDescription>
                </div>
              </CardHeader>
              <form action={partnerFormAction}>
                <CardContent className="space-y-4">
                  {partnerState?.error && (
                    <div className="p-3 text-sm rounded-md bg-error-container text-on-error-container">
                      {partnerState.error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label htmlFor="partner-email" className="text-sm font-medium text-on-surface">
                      Adresse email
                    </label>
                    <Input
                      id="partner-email"
                      name="email"
                      type="email"
                      placeholder="partenaire@safardz.com"
                      required
                      className="bg-surface-container-lowest"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="partner-password" className="text-sm font-medium text-on-surface">
                      Mot de passe
                    </label>
                    <Input
                      id="partner-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="bg-surface-container-lowest"
                    />
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-bold"
                    disabled={isPartnerPending}
                  >
                    {isPartnerPending ? "Connexion..." : "Connexion Partenaire"}
                  </Button>
                </CardFooter>
              </form>
            </div>
            <div className="px-6 py-4 bg-surface-container-low/40 border-t border-outline-variant/10 text-center rounded-b-2xl">
              <span className="text-xs text-on-surface-variant">
                Vous souhaitez proposer vos activités ? <Link href="/partners" className="text-primary hover:underline font-semibold">Rejoignez-nous</Link>
              </span>
            </div>
          </Card>
        </div>

        {/* ADMIN CARD */}
        <div className={`${activeTab === "admin" ? "block" : "hidden md:block"}`}>
          <Card className="glass-card custom-shadow border-0 h-full flex flex-col justify-between">
            <div>
              <CardHeader className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-tertiary-container/10 text-tertiary-fixed-dim flex items-center justify-center mb-1">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Espace Administrateur</CardTitle>
                  <CardDescription className="mt-1">
                    Accès réservé aux gestionnaires de la plateforme Safar DZ
                  </CardDescription>
                </div>
              </CardHeader>
              <form action={adminFormAction}>
                <CardContent className="space-y-4">
                  {adminState?.error && (
                    <div className="p-3 text-sm rounded-md bg-error-container text-on-error-container">
                      {adminState.error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label htmlFor="admin-email" className="text-sm font-medium text-on-surface">
                      Identifiant admin
                    </label>
                    <Input
                      id="admin-email"
                      name="email"
                      type="email"
                      placeholder="admin@safardz.com"
                      required
                      className="bg-surface-container-lowest"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="admin-password" className="text-sm font-medium text-on-surface">
                      Mot de passe
                    </label>
                    <Input
                      id="admin-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="bg-surface-container-lowest"
                    />
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full h-11 text-base font-bold border-primary text-primary hover:bg-primary/5"
                    disabled={isAdminPending}
                  >
                    {isAdminPending ? "Vérification..." : "Accéder à la console"}
                  </Button>
                </CardFooter>
              </form>
            </div>
            <div className="px-6 py-4 bg-surface-container-low/40 border-t border-outline-variant/10 text-center rounded-b-2xl">
              <span className="text-xs text-on-surface-variant font-mono">
                Safar DZ Administration Console
              </span>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
