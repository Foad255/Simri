const Footer = () => (
  <footer className="bg-white text-gray-600 py-8 border-t border-gray-200 shadow-inner print:hidden">
    <div className="container mx-auto px-4 sm:px-6 text-center">
      <p className="text-sm md:text-base font-medium mb-1">
        &copy; {new Date().getFullYear()} <span className="text-blue-600 font-semibold">Simri Platform</span>. All rights reserved.
      </p>
      <p className="text-xs md:text-sm text-gray-500">AI-Powered MRI Similarity & Patient Comparison</p>

      {/* Optional future enhancement */}
      {/* <div className="mt-4 space-x-4 text-sm text-blue-600">
        <a href="#" className="hover:underline">Privacy Policy</a>
        <a href="#" className="hover:underline">Contact</a>
      </div> */}
    </div>
  </footer>
);

export default Footer;
