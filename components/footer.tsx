import Link from "next/link"
import Image from "next/image"

const footerLinks = {
  Company: ["About Us", "Careers", "Press", "Blog"],
  Support: ["Help Center", "Contact Us", "Terms of Service", "Privacy Policy"],
  Social: ["YouTube", "Facebook", "Twitter", "Instagram"],
}

export default function Footer() {
  return (
    <footer className="border-t border-border mt-12">
      <div className="px-4 lg:px-6 py-8">
        {/* Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 relative rounded-full overflow-hidden flex-shrink-0">
                <Image src="/images/vj-piles-logo.jpg" alt="VJ Piles UG Movies" fill className="object-cover" />
              </div>
              <h2 className="text-xl font-bold">VJ Piles UG Movies</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Watch movies and TV series online and for free. Download the latest movies and popular TV series in HD
              quality.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="font-medium">Email:</span>
                <a href="mailto:vjpilesugmovies@gmail.com" className="hover:text-foreground transition-colors">
                  vjpilesugmovies@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Phone:</span>
                <a href="tel:+256789096965" className="hover:text-foreground transition-colors">
                  +256 789 096 965
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">WhatsApp:</span>
                <a
                  href="https://wa.me/256789096965"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  +256 789 096 965
                </a>
              </p>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    {category === "Social" ? (
                      <a
                        href={
                          link === "YouTube"
                            ? "https://youtube.com/@vjpilesugmovies"
                            : link === "Facebook"
                              ? "https://facebook.com/vjpilesugmovies"
                              : link === "Twitter"
                                ? "https://twitter.com/vjpilesugmovies"
                                : "https://instagram.com/vjpilesugmovies"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link}
                      </a>
                    ) : (
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © 2025 VJ Piles UG Movies. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
