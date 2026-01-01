const MaxWidthWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-screen min-h-screen mx-auto px-4 sm:px-6 lg:px-8 border-10 rounded-4xl bg-background">
      {children}
    </div>
  );
};

export default MaxWidthWrapper;