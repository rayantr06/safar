import { getAllExperiences, getDestinations } from "@/lib/queries/experiences";
import { ExperienceCard } from "@/components/experiences/experience-card";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export default async function ExperiencesCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const experiences = await getAllExperiences();
  const destinations = await getDestinations();

  // Basic filtering based on URL search params
  const typeFilter = typeof params.type === "string" ? params.type : null;
  const destinationFilter = typeof params.destination === "string" ? params.destination : null;

  const filteredExperiences = experiences.filter((exp) => {
    if (typeFilter && exp.type !== typeFilter) return false;
    if (destinationFilter && exp.destination_name.toLowerCase() !== destinationFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="bg-surface-container-lowest min-h-screen pb-24">
      {/* Header Banner */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold font-mono mb-4 text-primary-fixed">Toutes nos expériences</h1>
          <p className="text-lg text-primary-fixed-dim max-w-2xl">
            Découvrez notre flotte complète et choisissez la sortie qui vous correspond le mieux. Bateaux privés pour plus d'intimité ou sorties partagées pour plus de convivialité.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div className="flex items-center space-x-2 font-bold text-lg border-b border-surface-variant pb-2">
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filtres</span>
          </div>

          {/* Type Filter */}
          <div className="space-y-3">
            <h3 className="font-semibold text-on-surface">Type d'expérience</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="radio" name="type" className="form-radio text-primary" defaultChecked={!typeFilter} />
                <span className="text-on-surface-variant">Tous les types</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="radio" name="type" className="form-radio text-primary" defaultChecked={typeFilter === "private"} />
                <span className="text-on-surface-variant">Bateaux Privés</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="radio" name="type" className="form-radio text-primary" defaultChecked={typeFilter === "shared"} />
                <span className="text-on-surface-variant">Sorties Partagées</span>
              </label>
            </div>
          </div>

          {/* Destination Filter */}
          <div className="space-y-3">
            <h3 className="font-semibold text-on-surface">Destinations</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="radio" name="destination" className="form-radio text-primary" defaultChecked={!destinationFilter} />
                <span className="text-on-surface-variant">Toutes les destinations</span>
              </label>
              {destinations.map(dest => (
                <label key={dest.id} className="flex items-center space-x-3 cursor-pointer">
                  <input type="radio" name="destination" className="form-radio text-primary" defaultChecked={destinationFilter === dest.slug} />
                  <span className="text-on-surface-variant">{dest.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          <Button className="w-full">Appliquer les filtres</Button>
        </aside>

        {/* Catalog Grid */}
        <div className="flex-1">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-on-surface-variant">
              <span className="font-bold text-on-surface">{filteredExperiences.length}</span> résultats trouvés
            </p>
          </div>

          {filteredExperiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiences.map((exp, index) => (
                <ExperienceCard key={`${exp.id}-${index}`} experience={exp} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-surface rounded-2xl border border-surface-variant">
              <h3 className="text-xl font-bold mb-2">Aucun résultat</h3>
              <p className="text-on-surface-variant">Essayez de modifier vos filtres pour voir plus de bateaux.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
