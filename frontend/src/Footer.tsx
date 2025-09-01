import {
  IconArrowRotated,
  IconDiscuss,
  IconDocs,
  IconTutorials,
} from './components/icons';

export function Footer() {
  return (
    <footer className="w-full bg-gray-950 text-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-8">
        {/* Cards in a row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tutorials */}
          <a
            className="group flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition rounded-2xl p-6 shadow-md"
            href="https://www.Basechain.com/docs/developers/tutorials/intro/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-4">
              <IconTutorials className="text-yellow-400 w-8 h-8" />
              <div>
                <h3 className="text-lg font-semibold tracking-wide">
                  Build Your Own
                </h3>
                <p className="text-sm text-gray-400">Tutorials</p>
              </div>
            </div>
            <IconArrowRotated className="w-6 h-6 text-gray-400 group-hover:text-yellow-400 transition" />
          </a>

          {/* Docs */}
          <a
            className="group flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition rounded-2xl p-6 shadow-md"
            href="https://Basechain.com/docs/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-4">
              <IconDocs className="text-blue-400 w-8 h-8" />
              <div>
                <h3 className="text-lg font-semibold tracking-wide">
                  Documentation
                </h3>
                <p className="text-sm text-gray-400">Dig into the docs</p>
              </div>
            </div>
            <IconArrowRotated className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition" />
          </a>

          {/* Discord */}
          <a
            className="group flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition rounded-2xl p-6 shadow-md"
            href="https://discord.gg/Basechain"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-4">
              <IconDiscuss className="text-green-400 w-8 h-8" />
              <div>
                <h3 className="text-lg font-semibold tracking-wide">
                  Ask Questions
                </h3>
                <p className="text-sm text-gray-400">Discuss on Discord</p>
              </div>
            </div>
            <IconArrowRotated className="w-6 h-6 text-gray-400 group-hover:text-green-400 transition" />
          </a>
        </div>

        {/* Footer bottom */}
        <div className="text-center md:text-left mt-12 text-sm text-gray-500 border-t border-gray-800 pt-6">
          © 2025 BaseChain · All rights reserved
        </div>
      </div>
    </footer>
  );
}
   