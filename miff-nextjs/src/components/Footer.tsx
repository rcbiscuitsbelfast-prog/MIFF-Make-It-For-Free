export default function Footer() {
  return (
    <footer className="bg-gray-100 text-sm text-center p-4 mt-12">
      <div className="max-w-7xl mx-auto">
        <p className="text-gray-600">
          © {new Date().getFullYear()} MIFF Framework. Built with ❤️ by contributors.
        </p>
        <div className="mt-2 flex justify-center space-x-4">
          <a href="/contributors" className="text-purple-700 hover:text-purple-800 hover:underline">
            Contribute
          </a>
          <a href="https://github.com/miffframework" className="text-purple-700 hover:text-purple-800 hover:underline">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}