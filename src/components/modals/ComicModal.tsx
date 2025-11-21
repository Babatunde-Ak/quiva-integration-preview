import {X} from 'lucide-react'
import React from 'react'

function ComicModal({children, onClose, className} : any) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div
                className={`relative bg-[#1A1A1A] rounded-3xl max-w-4xl w-full overflow-hidden shadow-xl shadow-secondary-200/10 ${className}`}>
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-10">
                    <X size={24}/>
                </button>

                <div className="p-8 text-center space-y-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default ComicModal