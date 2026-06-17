export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low p-4">
      <div className="w-full max-w-md">
        {/* Safar DZ Logo / Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-mono tracking-tighter text-primary">
            Safar<span className="text-tertiary-fixed-dim">DZ</span>
          </h1>
          <p className="text-on-surface-variant mt-2">
            Portail Partenaire & Administration
          </p>
        </div>
        
        {children}
      </div>
    </div>
  );
}
