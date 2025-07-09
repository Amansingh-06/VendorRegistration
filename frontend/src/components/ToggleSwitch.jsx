export const ToggleSwitch = ({ switchOn, onToggle }) => {
    return (
      <div
        onClick={() => onToggle(!switchOn)}
        className={`w-16 border-2 h-6 flex items-center z-40 rounded-full  cursor-pointer transition-all duration-300 shadow-lg relative overflow-hidden ${
          switchOn ? "bg-green-500  text-white" : "bg-gray-400"
        }`}
      >
        {/* Background Labels */}
        <div className="absolute inset-0 flex items-center  px-2 mt-1">
          <span className={`text-white text-[10px] font-normal transition-all duration-300 ${
            switchOn ? 'opacity-100 scale-110' : 'opacity-0 scale-90'
          }`}>
            OPEN
          </span>
          <span className={`text-white text-[10px] font-normal transition-all duration-300 -ml-2  ${
            switchOn ? 'opacity-0 scale-90' : 'opacity-100 scale-110'
          }`}>
            CLOSE
          </span>
        </div>
        
        {/* Moving Circle with Icons */}
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-xl transform transition-all duration-500 ease-out absolute  flex items-center justify-center ${
            switchOn ? "translate-x-10.5" : "translate-x-1"
          }`}
        >
          {switchOn ? (
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    );
  };