import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header
      className="bg-white shadow-sm border-b border-gray-200"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            >
              <Image
                src="/moneybox-logo.svg"
                alt="Moneybox - Return to homepage"
                width={120}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>
          <nav
            className="flex items-center space-x-4"
            role="navigation"
            aria-label="Main navigation"
          >
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900 focus:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Admin Panel
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
