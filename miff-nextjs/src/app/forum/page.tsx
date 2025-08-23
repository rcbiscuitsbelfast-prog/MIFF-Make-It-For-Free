export default function ForumPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-purple-100 text-center py-12 rounded-lg shadow mb-8">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">
          Community Forum
        </h1>
        <p className="text-lg text-gray-700 mt-2">
          Connect with the MIFF community, ask questions, and share your projects
        </p>
      </section>

      {/* Forum Content */}
      <section className="py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the Discussion</h2>
          <p className="text-lg text-gray-600">
            Our community forum is powered by Giscus for seamless GitHub integration
          </p>
        </div>
        
        {/* Placeholder for Giscus Comments */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Discussions</h3>
            <p className="text-gray-600 mb-6">
              The forum will be integrated with Giscus for GitHub-powered discussions.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                <strong>Coming Soon:</strong> Giscus integration will allow you to:
              </p>
              <ul className="text-sm text-gray-600 space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Comment using your GitHub account
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Create discussions and threads
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Share code snippets and examples
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Get help from the community
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="py-12 bg-gray-50 rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Guidelines</h2>
          <p className="text-lg text-gray-600">
            Help us maintain a welcoming and productive community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-2xl mb-3">🤝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Be Respectful</h3>
            <p className="text-gray-600">
              Treat everyone with respect and kindness. We're all here to learn and grow together.
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-2xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Search First</h3>
            <p className="text-gray-600">
              Check existing discussions before starting a new thread to avoid duplicates.
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-2xl mb-3">💡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Knowledge</h3>
            <p className="text-gray-600">
              Share your experiences, code examples, and insights to help others learn.
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-2xl mb-3">🚀</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay On Topic</h3>
            <p className="text-gray-600">
              Keep discussions focused on MIFF framework, game development, and related topics.
            </p>
          </div>
        </div>
      </section>

      {/* Alternative Contact */}
      <section className="py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Other Ways to Connect</h2>
        <p className="text-lg text-gray-600 mb-6">
          Can't wait for the forum? Connect with us through these channels
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="https://github.com/miffframework"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            GitHub Discussions
          </a>
          <a 
            href="/contributors"
            className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            Join Contributors
          </a>
        </div>
      </section>
    </div>
  );
}