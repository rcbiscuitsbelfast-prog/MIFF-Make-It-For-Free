export default function ModulesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-purple-100 text-center py-12 rounded-lg shadow mb-8">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">
          MIFF Modules
        </h1>
        <p className="text-lg text-gray-700 mt-2">
          Discover and explore the modular components that power MIFF framework
        </p>
      </section>

      {/* Modules Grid */}
      <section className="py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Modules</h2>
          <p className="text-lg text-gray-600">
            Each module is designed to be CLI-first, engine-agnostic, and remix-safe
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder modules */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">🎮</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Game Core</h3>
            <p className="text-gray-600 mb-4">
              Essential game systems and utilities for building modular games
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">CLI</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">Unity</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">Web</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Asset Pipeline</h3>
            <p className="text-gray-600 mb-4">
              Automated asset processing and optimization workflows
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">CLI</span>
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm">Godot</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">🧪</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Testing Suite</h3>
            <p className="text-gray-600 mb-4">
              Comprehensive testing tools and golden test framework
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">CLI</span>
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">Tests</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">🌐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Bridge Adapters</h3>
            <p className="text-gray-600 mb-4">
              Engine-specific adapters for cross-platform compatibility
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">CLI</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">Unity</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">Web</span>
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm">Godot</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 mb-4">
              Game analytics and performance monitoring tools
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">CLI</span>
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm">Metrics</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">🔧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Dev Tools</h3>
            <p className="text-gray-600 mb-4">
              Development utilities and debugging tools
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">CLI</span>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm">Debug</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gray-50 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
        <p className="text-lg text-gray-600 mb-6">
          Explore the documentation to learn how to use these modules in your projects
        </p>
        <a 
          href="/docs"
          className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
        >
          View Documentation
        </a>
      </section>
    </div>
  );
}