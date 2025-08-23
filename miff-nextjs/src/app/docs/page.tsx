export default function DocsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-purple-100 text-center py-12 rounded-lg shadow mb-8">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">
          Documentation
        </h1>
        <p className="text-lg text-gray-700 mt-2">
          Comprehensive guides and API reference for the MIFF framework
        </p>
      </section>

      {/* Documentation Sections */}
      <section className="py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Getting Started</h2>
          <p className="text-lg text-gray-600">
            Choose your path to start building with MIFF
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Start</h3>
            <p className="text-gray-600 mb-4">
              Get up and running with MIFF in minutes
            </p>
            <a 
              href="/docs/quick-start"
              className="text-purple-700 hover:text-purple-800 font-medium hover:underline"
            >
              Read Guide →
            </a>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tutorials</h3>
            <p className="text-gray-600 mb-4">
              Step-by-step tutorials for common use cases
            </p>
            <a 
              href="/docs/tutorials"
              className="text-purple-700 hover:text-purple-800 font-medium hover:underline"
            >
              Browse Tutorials →
            </a>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">API Reference</h3>
            <p className="text-gray-600 mb-4">
              Complete API documentation for all modules
            </p>
            <a 
              href="/docs/api"
              className="text-purple-700 hover:text-purple-800 font-medium hover:underline"
            >
              View API →
            </a>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Concepts</h2>
          <p className="text-lg text-gray-600">
            Understanding the fundamental principles of MIFF
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">CLI-First Design</h3>
            <p className="text-gray-600 mb-4">
              Every module exposes functionality through command-line interfaces, enabling automation, testing, and integration with any build system.
            </p>
            <a 
              href="/docs/concepts/cli-first"
              className="text-purple-700 hover:text-purple-800 font-medium hover:underline"
            >
              Learn More →
            </a>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">🌐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Engine Agnostic</h3>
            <p className="text-gray-600 mb-4">
              Write your game logic once and deploy to multiple engines through dedicated bridge adapters for Unity, Web, and Godot.
            </p>
            <a 
              href="/docs/concepts/engine-agnostic"
              className="text-purple-700 hover:text-purple-800 font-medium hover:underline"
            >
              Learn More →
            </a>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">🔄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Remix Safe</h3>
            <p className="text-gray-600 mb-4">
              Every module is designed for easy modification and extension with comprehensive golden tests to ensure reliability.
            </p>
            <a 
              href="/docs/concepts/remix-safe"
              className="text-purple-700 hover:text-purple-800 font-medium hover:underline"
            >
              Learn More →
            </a>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">🧩</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Modular Architecture</h3>
            <p className="text-gray-600 mb-4">
              Build games from composable, testable modules that can be mixed and matched to create unique experiences.
            </p>
            <a 
              href="/docs/concepts/modular"
              className="text-purple-700 hover:text-purple-800 font-medium hover:underline"
            >
              Learn More →
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gray-50 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
        <p className="text-lg text-gray-600 mb-6">
          Can't find what you're looking for? Check out our community resources
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/forum"
            className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            Ask the Community
          </a>
          <a 
            href="https://github.com/miffframework"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-purple-700 px-6 py-3 rounded border-2 border-purple-600 hover:bg-purple-50 transition-colors font-semibold"
          >
            View on GitHub
          </a>
        </div>
      </section>
    </div>
  );
}