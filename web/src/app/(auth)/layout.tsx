import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low p-4">
      <div className="w-full max-w-md">
        {/* Safar DZ Logo / Branding */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="mb-3 active:scale-95 transition-transform">
            <Image
              src="/logo.png"
              alt="Safar DZ Logo"
              width={160}
              height={64}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>
          <p className="text-on-surface-variant">
            Portail Partenaire & Administration
          </p>
        </div>
        
        {children}
      </div>
    </div>
  );
}
