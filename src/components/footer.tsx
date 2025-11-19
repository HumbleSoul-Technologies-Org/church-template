import {
  Church,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Link } from "wouter";
import { FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Church Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Church className="h-8 w-8 text-primary" />
              <span
                className="text-2xl font-bold text-card-foreground"
                style={{ fontFamily: "Dancing Script" }}
              >
                FaithLife Ministries
              </span>
            </div>
            <p className="text-muted-foreground mb-6">
              A place where everyone belongs, grows in faith, and discovers
              their purpose in God's love.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-5 h-5 mr-3 text-primary" />
                <span>Kitetika, mutuba 1, wakiso, Uganda</span>
              </div>
              <div className="flex items-center  text-muted-foreground">
                <Phone className="w-5 h-5 mr-3 text-primary" />
                <span>(+256) 7xx-xxx-xxx</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Mail className="w-5 h-5 mr-3 text-primary" />
                <span>faithlifeministries.church.ug@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/about">
                  <a
                    className="hover:text-primary transition-colors"
                    data-testid="footer-about"
                  >
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a
                    className="hover:text-primary transition-colors"
                    data-testid="footer-beliefs"
                  >
                    Beliefs
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a
                    className="hover:text-primary transition-colors"
                    data-testid="footer-staff"
                  >
                    Staff
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a
                    className="hover:text-primary transition-colors"
                    data-testid="footer-ministries"
                  >
                    Ministries
                  </a>
                </Link>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://kisibojonathan-technologies.vercel.app/"
                  className="hover:text-primary transition-colors"
                  data-testid="footer-contact"
                >
                  Website Development
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-4">
              Resources
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/sermons">
                  <a
                    className="hover:text-primary transition-colors"
                    data-testid="footer-sermons"
                  >
                    Sermons
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/events">
                  <a
                    className="hover:text-primary transition-colors"
                    data-testid="footer-events"
                  >
                    Events
                  </a>
                </Link>
              </li>
              {/* <li>
                <Link href="/sermons">
                  <a className="hover:text-primary transition-colors" data-testid="footer-bible-studies">Bible Studies</a>
                </Link>
              </li> */}
              <li>
                <Link href="#">
                  <a
                    className="hover:text-primary transition-colors"
                    data-testid="footer-prayer"
                  >
                    Prayer Requests
                  </a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a
                    className="hover:text-primary transition-colors"
                    data-testid="footer-give"
                  >
                    Give Online
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 sm:mb-0">
            <a
              href="https://www.facebook.com/faithlife256"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="social-facebook"
            >
              <Facebook className="h-6 w-6" />
            </a>
            <a
              href="https://www.tiktok.com/@faithlifemin_ug"
              className="text-muted-foreground hidden hover:text-primary transition-colors"
              data-testid="social-tiktok"
              target="_blank"
            >
              {/* <Instagram className="h-6 w-6" /> */}
              <FaTiktok className="h-4 w-4" />
            </a>
            <a
              href="https://youtube.com/@faithlifeug?si=6Qms06O5o3ckHROg"
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="social-youtube"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Youtube className="h-6 w-6" />
            </a>
            <a
              href="https://x.com/FaithLifeMin_Ug?t=YPS_K3U14KT4oVUPxRx9GA&s=09"
              target="_blank"
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="social-twitter"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="https://www.instagram.com/the_faithlife_256?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="social-instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
          </div>

          <p className="text-muted-foreground text-sm" data-testid="copyright">
            © 2024 FaithLife Ministries. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
