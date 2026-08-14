import { Button } from "@/components/ui/button";
import { BookOpen, Crown } from "lucide-react";


const EmptyState = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 mb-6 opacity-40">
            <div className="grid grid-cols-3 gap-1 h-full">
                {Array.from({ length: 9 }).map((_, i) => (
                <div
                    key={i}
                    className="border border-gray-600 rounded-sm bg-gray-800/30"
                />
                ))}
            </div>
            {/* Small icons in grid */}
            <div className="relative -mt-16 ml-14">
                <BookOpen className="w-4 h-4 text-orange-400 mb-2" />
                <Crown className="w-3 h-3 text-yellow-400" />
            </div>
            </div>
            
            <div className="text-center max-w-sm">
            <p className="text-white/70 text-xl mb-6 leading-relaxed">
                Looks like your library is empty. Start collecting stories you love!
            </p>
            <Button className="bg-secondary-200 hover:bg-secondary-200/80 text-white font-medium px-8 py-2.5 rounded-full transition-colors">
                Explore Comics
            </Button>
            </div>
        </div>
    )
}


export default EmptyState