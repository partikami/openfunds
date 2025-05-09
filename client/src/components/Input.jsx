const Input = ({ icon: Icon, ...props }) => {
  return (
    <div className="relative mb-2">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="w-5 h-5 text-cyan-500"></Icon>
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-400 transition duration-200"
      />
    </div>
  );
};

export default Input;
