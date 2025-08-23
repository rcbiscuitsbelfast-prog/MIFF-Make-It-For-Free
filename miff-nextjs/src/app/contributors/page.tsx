export default function ContributorsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-purple-100 text-center py-12 rounded-lg shadow mb-8">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">
          Contributors
        </h1>
        <p className="text-lg text-gray-700 mt-2">
          Meet the amazing people who make MIFF framework possible
        </p>
      </section>

      {/* Contributors Grid */}
      <section className="py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
          <p className="text-lg text-gray-600">
            Contributors from around the world building the future of modular game development
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Placeholder contributors */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              A
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Alex Chen</h3>
            <p className="text-purple-600 mb-3">Core Maintainer</p>
            <p className="text-gray-600 text-sm mb-4">
              Lead architect of the MIFF framework with 10+ years in game development
            </p>
            <div className="flex justify-center space-x-2">
              <a href="#" className="text-gray-400 hover:text-purple-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              S
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Sarah Kim</h3>
            <p className="text-blue-600 mb-3">Testing Lead</p>
            <p className="text-gray-600 text-sm mb-4">
              Expert in automated testing and quality assurance for game systems
            </p>
            <div className="flex justify-center space-x-2">
              <a href="#" className="text-gray-400 hover:text-blue-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-20 h-20 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              M
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Marcus Rodriguez</h3>
            <p className="text-green-600 mb-3">CLI Specialist</p>
            <p className="text-gray-600 text-sm mb-4">
              Passionate about command-line tools and developer experience
            </p>
            <div className="flex justify-center space-x-2">
              <a href="#" className="text-gray-400 hover:text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-20 h-20 bg-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              E
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Emma Thompson</h3>
            <p className="text-orange-600 mb-3">Documentation Lead</p>
            <p className="text-gray-600 text-sm mb-4">
              Making complex concepts accessible through clear documentation
            </p>
            <div className="flex justify-center space-x-2">
              <a href="#" className="text-gray-400 hover:text-orange-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-20 h-20 bg-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              D
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">David Park</h3>
            <p className="text-indigo-600 mb-3">Bridge Developer</p>
            <p className="text-gray-600 text-sm mb-4">
              Expert in cross-platform compatibility and engine integration
            </p>
            <div className="flex justify-center space-x-2">
              <a href="#" className="text-gray-400 hover:text-indigo-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-20 h-20 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              Y
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Yuki Tanaka</h3>
            <p className="text-red-600 mb-3">Community Manager</p>
            <p className="text-gray-600 text-sm mb-4">
              Building and nurturing the MIFF community across the globe
            </p>
            <div className="flex justify-center space-x-2">
              <a href="#" className="text-gray-400 hover:text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-12 bg-gray-50 rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Team</h2>
          <p className="text-lg text-gray-600">
            We're always looking for passionate contributors to help build the future of modular game development
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Username
              </label>
              <input
                type="text"
                id="github"
                name="github"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="your-github-username"
              />
            </div>
            
            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                Areas of Interest
              </label>
              <select
                id="interests"
                name="interests"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select an area</option>
                <option value="core-development">Core Framework Development</option>
                <option value="testing">Testing & Quality Assurance</option>
                <option value="documentation">Documentation & Tutorials</option>
                <option value="cli-tools">CLI Tools & Developer Experience</option>
                <option value="bridge-adapters">Bridge Adapters & Engine Integration</option>
                <option value="community">Community Management</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Why would you like to contribute?
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Tell us about your interest in contributing to MIFF..."
              ></textarea>
            </div>
            
            <div className="text-center">
              <button
                type="submit"
                className="bg-purple-600 text-white px-8 py-3 rounded hover:bg-purple-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Community Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
            <p className="text-gray-600">Contributors</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
            <p className="text-gray-600">GitHub Stars</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-2">25+</div>
            <p className="text-gray-600">Modules</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-2">15+</div>
            <p className="text-gray-600">Countries</p>
          </div>
        </div>
      </section>
    </div>
  );
}