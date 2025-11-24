import { ComicsTable } from "@/features/comic-library/components/ComicsTable";
import { topComics } from "@/features/comic-library/data/sampleData";

const CollectionPage = () => {
  return (
    <main className="min-h-screen text-white py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col gap-y-2 mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Collection</h1>
          <p className="font-light text-lg">
            Browse through collections by Top, Trending, and Genres.
          </p>
        </div>

        {/* Table Component */}
        <ComicsTable comics={topComics} />
      </div>
    </main>
  );
};

export default CollectionPage;
