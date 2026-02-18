import TopCreators from "@/features/comic-library/TopCreators";

const TopCreatorsPage = () => {
  
  return (
    <main className="min-h-screen text-white py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col gap-y-2 mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Top Creators</h1>
          <p className="font-light text-lg">
            Checkout Top Rated Comic Creators/Artist on the Comic Marketplace
          </p>
        </div>

        <TopCreators />
      </div>
    </main>
  );
};

export default TopCreatorsPage;