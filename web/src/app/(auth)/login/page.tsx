"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const initialState = {
  error: "",
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
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
    <Card className="glass-card custom-shadow border-0">
      <CardHeader className="space-y-1 text-center">
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Entrez vos identifiants pour accéder à votre espace
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="p-3 text-sm rounded-md bg-error-container text-on-error-container">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-on-surface"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="partenaire@exemple.com"
              required
              className="bg-surface-container-lowest"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-on-surface"
            >
              Mot de passe
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-surface-container-lowest"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full h-11 text-base"
            disabled={isPending}
          >
            {isPending ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
