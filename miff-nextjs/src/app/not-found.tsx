import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        {/* 404 Icon */}
        <div className="text-8xl font-bold text-purple-600 mb-6">404</div>
        
        {/* Headline */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          404 — Page Not Found
        </h1>
        
        {/* Message */}
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist. Try one of these instead:
        </p>
        
        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link 
            href="/"
            className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            🏠 Back Home
          </Link>
          <Link 
            href="/modules"
            className="bg-white text-purple-700 px-6 py-3 rounded border-2 border-purple-600 hover:bg-purple-50 transition-colors font-semibold"
          >
            🧩 Browse Modules
          </Link>
          <Link 
            href="/docs"
            className="bg-white text-purple-700 px-6 py-3 rounded border-2 border-purple-600 hover:bg-purple-50 transition-colors font-semibold"
          >
            📚 View Documentation
          </Link>
          <Link 
            href="/contributors"
            className="bg-white text-purple-700 px-6 py-3 rounded border-2 border-purple-600 hover:bg-purple-50 transition-colors font-semibold"
          >
            👥 Meet Contributors
          </Link>
        </div>
        
        {/* Additional Help */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h2>
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? Check out our community resources:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="/forum"
              className="text-purple-700 hover:text-purple-800 font-medium hover:underline"
            >
              💬 Ask the Community
            </a>
            <a 
              href="https://github.com/miffframework"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 hover:text-purple-800 font-medium hover:underline"
            >
              🐙 GitHub Repository
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}