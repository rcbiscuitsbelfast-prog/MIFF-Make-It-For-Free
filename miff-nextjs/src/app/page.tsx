import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-purple-100 text-center py-12 rounded-lg shadow">
        <div className="mb-8">
          <div className="rounded-xl bg-purple-600 text-white inline-flex items-center justify-center w-20 h-20 font-bold text-3xl shadow-lg mb-6">
            M
          </div>
          <h1 className="text-4xl font-bold text-purple-700 mb-4">
            Welcome to MIFF
          </h1>
          <p className="text-xl font-semibold text-purple-600 mb-2">
            Prompt. Remix. Play.
          </p>
          <p className="text-lg text-gray-700 mt-2">
            Modular, CLI-first, engine-agnostic game development for remixers and contributors.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/modules"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            🧩 Explore Modules
          </Link>
          <Link 
            href="/docs"
            className="bg-white text-purple-700 px-4 py-2 rounded border-2 border-purple-600 hover:bg-purple-50 transition-colors font-semibold"
          >
            📚 View Documentation
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why MIFF?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built from the ground up for contributors and remixers who want to create modular, testable game systems.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">CLI-First</h3>
            <p className="text-gray-600">
              Every module exposes functionality through command-line interfaces for seamless automation and testing.
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Engine Agnostic</h3>
            <p className="text-gray-600">
              Write once, deploy everywhere. Works across Unity, Web, and Godot through dedicated bridge adapters.
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Remix Safe</h3>
            <p className="text-gray-600">
              Every module is designed for easy modification and extension with comprehensive golden tests.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-gray-50 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Started</h2>
          <p className="text-lg text-gray-600">Quick access to essential resources</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link 
            href="/docs"
            className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Documentation</h3>
            <p className="text-sm text-gray-600 mt-1">Comprehensive guides and API reference</p>
          </Link>
          
          <Link 
            href="/contributors"
            className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Contributors</h3>
            <p className="text-sm text-gray-600 mt-1">Join the community and contribute</p>
          </Link>
          
          <Link 
            href="/forum"
            className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Forum</h3>
            <p className="text-sm text-gray-600 mt-1">Connect with the community</p>
          </Link>
          
          <a 
            href="https://github.com/miffframework"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="text-2xl mb-2">🐙</div>
            <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">GitHub</h3>
            <p className="text-sm text-gray-600 mt-1">View source and contribute</p>
          </a>
        </div>
      </section>
    </div>
  );
}
