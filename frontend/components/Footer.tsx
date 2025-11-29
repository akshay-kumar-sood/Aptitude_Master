import React from 'react';
import { Github, Linkedin, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const socials = [
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/akshay-sood-3692b5297/', icon: Linkedin },
    { name: 'GitHub', href: 'https://github.com/akshay-kumar-sood', icon: Github },
    { name: 'Instagram', href: 'https://www.instagram.com/i_akshay_23/', icon: Instagram },

  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-8 text-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-400">Created by</p>
            <h3 className="text-2xl font-semibold text-white mt-2">Akshay Kumar Sood</h3>
            <p className="mt-2 text-gray-400 text-sm">Crafted with passion for aptitude aspirants.</p>
          </div>
          <div className="flex items-center justify-center gap-4">
            {socials.map(({ name, href, icon: Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={name}
                className="p-3 rounded-full border border-white/10 text-white hover:text-blue-400 hover:border-blue-400 transition-colors"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} AptitudeMaster. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

