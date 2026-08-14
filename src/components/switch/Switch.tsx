

const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
        <label className={`relative inline-flex items-center cursor-pointer transition-opacity duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={enabled}
                onChange={onChange}
                disabled={disabled}
            />
            <div className="w-11 h-6 bg-black-100 rounded-full peer-focus:outline-none transition-colors duration-300 ease-in-out peer-checked:bg-black-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-secondary-200 after:rounded-full after:h-5 after:w-5 after:transition-transform after:duration-300 after:ease-in-out peer-checked:after:translate-x-full peer-checked:after:border-secondary-200"></div>
        </label>
);


export const IconToggleSwitch = ({ enabled, onChange, disabled = false }) => (
        <label className={`relative inline-flex items-center cursor-pointer transition-opacity duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={enabled}
            onChange={onChange}
            disabled={disabled}
        />
        <div className="w-11 h-6 bg-black-50 rounded-full peer-focus:outline-none transition-colors duration-300 ease-in-out peer-checked:bg-primary-500 relative">
            {/* Sliding knob with icons */}
            <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform duration-300 ease-in-out flex items-center justify-center ${
                enabled ? 'translate-x-full' : ''
            }`}>
                {enabled ? (
                    <svg 
                        className="w-3 h-3 text-primary-500" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                    >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg 
                        className="w-3 h-3 text-black-50" 
                        fill="none"
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
            </div>
        </div>
    </label>
);




export default ToggleSwitch;