import { Card, CardContent } from "../components/ui/card";
import {
  Clock,
  MapPin,
  Users,
  Heart,
  Book,
  Music,
  ArrowRight,
} from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { useEffect, useState } from "react";
import { useAppData } from "../hooks/use-AppData";
import axios from "axios";
import { Configs } from "../lib/utils";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "../styles/splide-custom.css";

// Define types locally
export type Pastor = {
  _id: string;
  name: string;
  title: string;
  bio: string;
  profileImg: { url?: string; public_id?: string };
  email: string;
  isLead: boolean;
  order: number;
  imageUrl?: string;
};

export type GalleryImage = {
  _id: string;
  title: string;
  imageUrl: string;
  category: "general" | "events" | "worship" | "community";
  image: { url?: string; public_id?: string };
};

export default function About() {
  const { Pastors, gallery } = useAppData();
  const [pastors, setPastors] = useState<Pastor[]>(Pastors || []);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(
    gallery || []
  );
  const [pastorsLoading, setPastorsLoading] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(true);

  const fetchGalleryImages = async () => {
    try {
      const res = await axios.get(`${Configs.url}/api/gallery/all`);
      if (res.status === 200) {
        setGalleryImages(res.data.gallery || []);
      }
    } catch (error) {}
  };

  const fetchPastors = async () => {
    try {
      const res = await axios.get(`${Configs.url}/api/pastors/all`);
      if (res.status === 200) {
        setPastors(res.data.pastors || []);
      }
    } catch (error) {}
  };
  useEffect(() => {
    window.scrollTo(0, 0);

    const timer = setTimeout(() => {
      fetchGalleryImages();
      fetchPastors();
      setPastorsLoading(false);
      setGalleryLoading(false);
    }, 1000); // Simulate network delay

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl text-center">
          <h1
            style={{ fontFamily: "Dancing Script" }}
            className="text-5xl font-bold mb-6"
            data-testid="about-title"
          >
            About FaithLife Church
          </h1>
          <p className="text-xl max-w-3xl mx-auto" data-testid="about-subtitle">
            Discover our story, meet our team, and learn about our heart for
            community and faith.
          </p>
        </div>
      </section>

      {/* Church History */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                style={{ fontFamily: "Dancing Script" }}
                className="text-4xl font-bold text-foreground mb-6"
                data-testid="history-title"
              >
                Our Story
              </h2>
              <div className="space-y-6 text-muted-foreground">
                <p data-testid="history-paragraph-1">
                  FaithLife Church was founded in 2015 with a simple vision: to
                  create a place where people from all walks of life could come
                  together to experience God's love and grow in their faith
                  journey. What started as a small gathering of 20 people in a
                  community center has grown into a vibrant congregation of over
                  1,200 members.
                </p>
                <p data-testid="history-paragraph-2">
                  Our church has always been committed to authentic worship,
                  practical teaching from God's Word, and genuine community. We
                  believe that church isn't just about Sunday services—it's
                  about building relationships, supporting one another, and
                  making a positive impact in our community and beyond.
                </p>
                <p data-testid="history-paragraph-3">
                  Over the years, we've launched numerous ministries, supported
                  local charities, and sent mission teams around the world. But
                  our heart remains the same: to help people discover their
                  purpose in God's love and live out their faith in meaningful
                  ways.
                </p>
              </div>
            </div>
            <div
              style={{ flex: 1, position: "relative" }}
              className="overflow-hidden rounded-xl w-full md:w-[120%]"
            >
              {/* White fade overlay (left → transparent) - hidden on mobile */}
              <div
                className="absolute inset-0 z-10 hidden md:block"
                style={{
                  background:
                    "linear-gradient(to right, white 5%, transparent 80%)",
                }}
              ></div>

              {/* Image */}
              <img
                src="https://images.unsplash.com/photo-1519491050282-cf00c82424b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
                alt="Historic church exterior building"
                className="object-cover w-full h-[300px] md:h-[500px] transform hover:scale-105 transition-transform duration-700"
                data-testid="church-history-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-bold text-foreground mb-4"
              data-testid="values-title"
              style={{ fontFamily: "Dancing Script" }}
            >
              Our Core Values
            </h2>
            <p
              className="text-xl text-muted-foreground"
              data-testid="values-description"
            >
              These principles guide everything we do as a church community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3
                  className="text-xl font-semibold text-card-foreground mb-3"
                  data-testid="value-love-title"
                >
                  Love
                </h3>
                <p
                  className="text-muted-foreground"
                  data-testid="value-love-description"
                >
                  We believe love is the foundation of our faith and the way we
                  treat one another and our community.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3
                  className="text-xl font-semibold text-card-foreground mb-3"
                  data-testid="value-community-title"
                >
                  Community
                </h3>
                <p
                  className="text-muted-foreground"
                  data-testid="value-community-description"
                >
                  We're committed to building genuine relationships and
                  supporting each other through life's journey.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Book className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3
                  className="text-xl font-semibold text-card-foreground mb-3"
                  data-testid="value-truth-title"
                >
                  Truth
                </h3>
                <p
                  className="text-muted-foreground"
                  data-testid="value-truth-description"
                >
                  We are devoted to teaching and living by the timeless truths
                  found in God's Word.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Music className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3
                  className="text-xl font-semibold text-card-foreground mb-3"
                  data-testid="value-worship-title"
                >
                  Worship
                </h3>
                <p
                  className="text-muted-foreground"
                  data-testid="value-worship-description"
                >
                  We celebrate God through heartfelt worship, music, and
                  expressions of praise and gratitude.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3
                  className="text-xl font-semibold text-card-foreground mb-3"
                  data-testid="value-service-title"
                >
                  Service
                </h3>
                <p
                  className="text-muted-foreground"
                  data-testid="value-service-description"
                >
                  We are called to serve our community and world with the same
                  love Christ showed us.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3
                  className="text-xl font-semibold text-card-foreground mb-3"
                  data-testid="value-growth-title"
                >
                  Growth
                </h3>
                <p
                  className="text-muted-foreground"
                  data-testid="value-growth-description"
                >
                  We encourage spiritual growth and personal development in
                  every stage of life.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pastoral Team */}
      {pastors.length > 0 && (
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <h2
                className="text-4xl font-bold text-foreground mb-4"
                data-testid="pastoral-team-title"
              >
                Meet Our Pastoral Team
              </h2>
              <p
                className="text-xl text-muted-foreground"
                data-testid="pastoral-team-description"
              >
                Dedicated leaders committed to shepherding our church family
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastorsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="text-center">
                    <CardContent className="pt-6">
                      <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
                      <Skeleton className="h-6 w-32 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto mb-4" />
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : pastors && pastors.length > 0 ? (
                pastors.slice(0, 4).map((pastor) => (
                  <Card
                    key={pastor._id}
                    className="text-center"
                    data-testid={`pastor-card-${pastor._id}`}
                  >
                    <CardContent className="pt-6">
                      <img
                        src={
                          pastor?.profileImg?.url ||
                          pastor?.imageUrl ||
                          "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80"
                        }
                        alt={pastor.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                        data-testid={`pastor-image-${pastor._id}`}
                      />
                      <h3
                        className="text-xl font-semibold text-card-foreground mb-2"
                        data-testid={`pastor-name-${pastor._id}`}
                      >
                        {pastor.name}
                      </h3>
                      <p
                        className="text-primary font-medium mb-4"
                        data-testid={`pastor-title-${pastor._id}`}
                      >
                        {pastor.title}
                      </p>
                      <p
                        className="text-muted-foreground text-sm"
                        data-testid={`pastor-bio-${pastor._id}`}
                      >
                        {pastor.bio}
                      </p>
                      {pastor.email && (
                        <p
                          className="text-primary text-sm mt-2"
                          data-testid={`pastor-email-${pastor._id}`}
                        >
                          {pastor.email}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground" data-testid="no-pastors">
                    No pastoral team information available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Service Times & Location */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Service Times */}
            <div>
              <h2
                className="text-4xl font-bold text-foreground mb-8"
                data-testid="service-times-section-title"
                style={{ fontFamily: "Dancing Script" }}
              >
                Service Times & Location
              </h2>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <h3
                    style={{ fontFamily: "Dancing Script" }}
                    className="text-2xl font-semibold text-card-foreground mb-6 flex items-center"
                  >
                    <Clock className="mr-3 h-6 w-6 text-primary" />
                    Sunday Services
                  </h3>
                  <div className="space-y-4">
                    <div
                      className="flex justify-between items-center"
                      data-testid="service-early"
                    >
                      <span className="font-medium">Early Service</span>
                      <span className="text-muted-foreground">8:30 AM</span>
                    </div>
                    <div
                      className="flex justify-between items-center"
                      data-testid="service-main"
                    >
                      <span className="font-medium">Main Service</span>
                      <span className="text-muted-foreground">10:30 AM</span>
                    </div>
                    <div
                      className="flex justify-between items-center"
                      data-testid="service-evening"
                    >
                      <span className="font-medium">Evening Service</span>
                      <span className="text-muted-foreground">6:00 PM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3
                    style={{ fontFamily: "Dancing Script" }}
                    className="text-2xl font-semibold text-card-foreground mb-6 flex items-center"
                  >
                    <MapPin className="mr-3 h-6 w-6 text-primary" />
                    Our Location
                  </h3>
                  <div className="space-y-2" data-testid="church-address">
                    <p className="font-medium">FaithLife Church</p>
                    <p className="text-muted-foreground">123 Faith Avenue</p>
                    <p className="text-muted-foreground">
                      Kitetika, mutuba 1, wakiso, Uganda
                    </p>
                    <p className="text-muted-foreground">(+256) 7xx-xxx-xxx</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Map */}

            <div>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.google.com/maps?q=0.402749113762963,32.58166666859604&z=15&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Custom Map"
                  data-testid="map"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}

      {/* Photo Gallery */}
      {galleryImages.length > 0 && (
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <h2
                className="text-4xl font-bold text-foreground mb-4"
                data-testid="gallery-title"
              >
                Our Gallery
              </h2>
              <p
                className="text-xl text-muted-foreground"
                data-testid="gallery-description"
              >
                Glimpses of our community in worship, fellowship, and service
              </p>
            </div>

            {galleryLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-full">
                    <Skeleton className="aspect-square rounded-lg" />
                  </div>
                ))}
              </div>
            ) : galleryImages && galleryImages.length > 0 ? (
              <Splide
                options={{
                  type: "loop",
                  perPage: 3, // default for large screens (>= ~1024px)
                  perMove: 1,
                  gap: "1rem",
                  arrows: false,
                  pagination: true,
                  drag: true,
                  autoplay: true,
                  interval: 3000,
                  speed: 600,
                  pauseOnHover: true,
                  pauseOnFocus: true,
                  width: "100%",
                  breakpoints: {
                    // <= 1024px -> show 2 slides per page (optional intermediate)
                    1024: {
                      perPage: 2,
                    },
                    // <= 640px -> show 1 slide per page (mobile)
                    640: {
                      perPage: 1,
                    },
                  },
                }}
                className="splide-custom"
              >
                {galleryImages.map((image) => (
                  <SplideSlide key={image._id}>
                    <div
                      className="relative group overflow-hidden rounded-lg aspect-square"
                      data-testid={`gallery-image-${image._id}`}
                    >
                      <img
                        src={
                          image?.image?.url ||
                          image?.imageUrl ||
                          "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
                        }
                        alt={image.title || "Gallery image"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p
                          className="text-white font-medium"
                          data-testid={`gallery-title-${image._id}`}
                        >
                          {image.title}
                        </p>
                      </div>
                    </div>
                  </SplideSlide>
                ))}
              </Splide>
            ) : (
              <div className="text-center py-12">
                <p
                  className="text-muted-foreground text-lg"
                  data-testid="no-gallery"
                >
                  Gallery images coming soon!
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
