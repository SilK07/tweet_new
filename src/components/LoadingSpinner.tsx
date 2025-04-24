
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-background"></div>
        </div>
      </div>
      <p className="ml-4 text-lg font-medium">Processing data...</p>
    </div>
  );
};

export default LoadingSpinner;
