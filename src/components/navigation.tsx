import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Church, Menu, LogOut, Settings, Brush } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useEvents } from "../hooks/useEvents";
import { useSermons } from "../hooks/useSermons";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { data: events = [], isLoading: hookLoading, refetch } = useEvents();
  // const { data: allSermons = [], isLoading: sermonsLoading } = useSermons();

  useEffect(() => {
    setTimeout(() => {
      refetch();
    }, 5000);
  }, []);
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/sermons", label: "Sermons" },
    { href: "/events", label: "Events" },
  ];

  const NavLink = ({
    href,
    label,
    mobile = false,
  }: {
    href: string;
    label: string;
    mobile?: boolean;
  }) => (
    <Link href={href}>
      <a
        className={`
    transition-colors relative font-medium  group
    ${
      location === href
        ? "text-accent"
        : mobile
        ? "text-primary hover:border-b-2 hover:border-primary"
        : "text-white"
    }
    ${mobile ? "block py-2" : ""}
  `}
        onClick={mobile ? () => setIsOpen(false) : undefined}
        data-testid={`nav-${label.toLowerCase()}`}
      >
        {label}
        {events.length > 0 && href === "/events" && (
          <span
            className=" mt-2 inline-block absolute z-40  text-accent text-xs font-bold p-2 py-0.5 rounded-full"
            data-testid="event-notification-badge"
          >
            {events.filter((e: any) => new Date(e.date) >= new Date()).length >
              0 &&
              events.filter((e: any) => new Date(e.date) >= new Date()).length}
          </span>
        )}
        {/* Bottom border for desktop hover */}
        {!mobile && location !== href && (
          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent transform scale-x-0 origin-center transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
        )}
      </a>
    </Link>
  );

  return (
    <header
      className="
    bg-gradient-to-r w-full  from-black/30 via-black/20 to-transparent
    backdrop-blur-md backdrop-saturate-150
    shadow-sm  fixed top-0 z-50
  "
      style={{ backgroundColor: "rgba(0,0,0,0.28)" }} // fallback for browsers without backdrop-filter
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <a
              className="flex items-center space-x-2 text-2xl font-bold text-white"
              data-testid="logo"
            >
              <img
                src={
                  "https://res.cloudinary.com/ghost150/image/upload/v1761304321/FAITHLIFE_LOGO_gtiwoq.png"
                }
                alt="Church Logo"
                className="h-20 w-20 object-contain"
              />
              <span
                style={{ fontFamily: "Dancing Script" }}
                className="text-white text-2xl"
              >
                Ministries
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
            {/* <Link href="/donations">
          <Button className="bg-accent text-accent-foreground hover:opacity-90" data-testid="button-give-online">
            Give Online
          </Button>
        </Link> */}
            {isAdmin && (
              <>
                <Link href="/admin">
                  <Button
                    variant="outline"
                    className="border-0"
                    size="sm"
                    data-testid="button-admin"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
                <Link href="/customize">
                  <Button
                    variant="outline"
                    className="hidden"
                    size="sm"
                    data-testid="button-customize"
                  >
                    <Brush className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <span
                onClick={logout}
                className="flex justify-center hover:bg-accent p-2 hover:text-primary rounded-md cursor-pointer items-center text-white flex-1 "
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </span>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-mobile-menu"
              >
                <Menu className="h-6 w-6 text-white" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    mobile
                  />
                ))}
                <Link href="/donations">
                  <Button
                    className="bg-accent hidden text-accent-foreground hover:opacity-90 w-full mt-4"
                    onClick={() => setIsOpen(false)}
                    data-testid="button-give-online-mobile"
                  >
                    Give Online
                  </Button>
                </Link>
                {isAdmin && (
                  <>
                    <Link href="/admin">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsOpen(false)}
                        data-testid="button-admin-mobile"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                    <Link href="/customize">
                      <Button
                        variant="outline"
                        className="w-full hidden"
                        onClick={() => setIsOpen(false)}
                        data-testid="button-customize-mobile"
                      >
                        <Brush className="h-4 w-4 mr-2" />
                        Customize
                      </Button>
                    </Link>
                  </>
                )}
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    className="w-full hover:bg-red-600/10"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    data-testid="button-logout-mobile"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
