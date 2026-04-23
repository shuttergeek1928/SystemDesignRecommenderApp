import Link from "next/link";
import { Cpu, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Cpu className="text-primary w-6 h-6" />
              <span className="font-bold text-xl tracking-tight">
                Context Aware
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Personalized system design recommendations based on your
              application needs and team context.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/recommendations" className="hover:text-primary">
                  Recommendations
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-primary">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-primary">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-primary">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex gap-4 mb-6">
              <Link
                href="#"
                className="p-2 bg-accent hover:bg-primary/20 hover:text-primary rounded-lg transition-all"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="p-2 bg-accent hover:bg-primary/20 hover:text-primary rounded-lg transition-all"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="p-2 bg-accent hover:bg-primary/20 hover:text-primary rounded-lg transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Stay updated with our latest architecture tips.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2026 Context Aware Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
