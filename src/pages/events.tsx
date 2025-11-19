import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import ReactPaginate from "react-paginate";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Calendar, MapPin, Clock, User, Users } from "lucide-react";
import { format, isPast, isToday, parseISO, isFuture, set } from "date-fns";
import { Skeleton } from "../components/ui/skeleton";
import EventCard from "../components/event-card";
import { useAppData } from "../hooks/use-AppData"; // <- ensure this path/name matches your hook file

interface EventItem {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  speaker?: string;
  thumbnailUrl?: string;
  category: "general" | "service" | "youth" | "community";
  thumbnail: { url?: string; public_id?: string };
  reminders?: string[];
}

export default function Events() {
  // destructure according to your hook's API
  const { events = [], loading: hookLoading = false } = useAppData();

  const [activeTab, setActiveTab] = useState<"upcoming" | "ongoing" | "past">(
    "upcoming"
  );
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState<boolean>(true);
  // true once the initial full load has completed
  const [initialLoadCompleted, setInitialLoadCompleted] =
    useState<boolean>(false);
  // true when subsequent loads are happening in the background (do not show skeletons)
  const [backgroundLoading, setBackgroundLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(0);
  const eventsPerPage = 6;

  // scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // when hook data or hook loading changes, update local state
  useEffect(() => {
    // Initial load: show skeletons. After first successful load, subsequent loads
    // happen in background (no skeletons) and simply update the allEvents array.
    if (hookLoading) {
      if (!initialLoadCompleted) {
        // first-time loading -> show full loading UI
        setEventsLoading(true);
        setBackgroundLoading(false);
      } else {
        // subsequent loading -> keep UI visible, mark background updating
        setEventsLoading(false);
        setBackgroundLoading(true);
      }
    } else {
      // loading finished: hide loading UI and mark initial load completed
      setEventsLoading(false);
      setBackgroundLoading(false);
      setInitialLoadCompleted(true);
    }

    // safely set events array (default to empty array)
    setAllEvents(Array.isArray(events) ? events : []);
  }, [events, hookLoading, initialLoadCompleted]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getEventDateTime = (event: EventItem) => {
    if (!event?.date || !event?.time) return null;
    const [hours, minutes] = event.time.split(":").map(Number);
    const date = parseISO(event.date);
    if (isNaN(date.getTime()) || isNaN(hours) || isNaN(minutes)) return null;
    return set(date, { hours, minutes });
  };

  const getEventStatus = (event: EventItem) => {
    const eventDateTime = getEventDateTime(event);
    if (!eventDateTime) return "upcoming";

    if (isPast(set(eventDateTime, { hours: 23, minutes: 59, seconds: 59 }))) {
      return "past";
    }

    if (isToday(eventDateTime)) {
      const now = currentTime;
      const eventTime = set(now, {
        hours: eventDateTime.getHours(),
        minutes: eventDateTime.getMinutes(),
      });

      if (eventTime.getTime() <= now.getTime()) {
        return "ongoing";
      }
    }

    return "upcoming";
  };

  // derive upcoming/ongoing/past with useMemo for performance
  const { upcomingEvents, ongoingEvents, pastEvents } = useMemo(() => {
    return allEvents.reduce(
      (acc, event) => {
        const status = getEventStatus(event);
        if (status === "upcoming") acc.upcomingEvents.push(event);
        else if (status === "ongoing") acc.ongoingEvents.push(event);
        else acc.pastEvents.push(event);
        return acc;
      },
      {
        upcomingEvents: [] as EventItem[],
        ongoingEvents: [] as EventItem[],
        pastEvents: [] as EventItem[],
      }
    );
  }, [allEvents, currentTime]);

  const getCategoryColor = (category: string) => {
    switch ((category || "").toLowerCase()) {
      case "service":
        return "bg-primary text-primary-foreground";
      case "youth":
        return "bg-secondary text-secondary-foreground";
      case "community":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const EventsGrid = ({
    events,
    loading,
    currentPage,
    setCurrentPage,
  }: {
    events?: EventItem[];
    loading: boolean;
    currentPage: number;
    setCurrentPage: (page: number) => void;
  }) => {
    const pageCount = Math.ceil((events?.length || 0) / eventsPerPage);
    const offset = currentPage * eventsPerPage;
    const currentEvents = events?.slice(offset, offset + eventsPerPage);

    const handlePageChange = ({ selected }: { selected: number }) => {
      setCurrentPage(selected);
      window.scrollTo({
        top: document.getElementById("events-grid")?.offsetTop || 0,
        behavior: "smooth",
      });
    };

    return (
      <div className="space-y-8">
        <div
          id="events-grid"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : currentEvents && currentEvents.length > 0 ? (
            currentEvents.map((event) => (
              <EventCard
                key={event._id}
                event={{
                  ...event,
                  id: event._id,
                  reminders: event.reminders || [],
                }}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p
                className="text-muted-foreground text-lg"
                data-testid="no-events"
              >
                No events available in this category.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {events && events.length > eventsPerPage && (
          <div className="mt-8 flex justify-center">
            <ReactPaginate
              previousLabel="Previous"
              nextLabel="Next"
              pageCount={pageCount}
              onPageChange={handlePageChange}
              containerClassName="flex gap-2 items-center"
              previousClassName="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              nextClassName="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              pageClassName="px-3 py-1  rounded-md hover:bg-muted"
              activeClassName="!bg-primary  text-primary-foreground"
              disabledClassName="opacity-50 cursor-not-allowed"
              forcePage={currentPage}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6" data-testid="events-title">
              Church Events
            </h1>
            <p
              className="text-xl max-w-3xl mx-auto"
              data-testid="events-subtitle"
            >
              Join us for worship, fellowship, and community events that brings
              us together in faith and friendship.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Event */}
      {eventsLoading ? (
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <Skeleton className="h-96 w-full" />
          </div>
        </section>
      ) : ongoingEvents.length > 0 || upcomingEvents.length > 0 ? (
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <h2
                className="text-4xl font-bold text-card-foreground mb-4"
                data-testid="featured-event-title"
              >
                {ongoingEvents.length > 0 ? "Happening Now" : "Next Event"}
              </h2>
              <p
                className="text-xl text-muted-foreground"
                data-testid="featured-event-description"
              >
                {ongoingEvents.length > 0
                  ? "Currently in progress"
                  : "Don't miss our upcoming gathering"}
              </p>
            </div>

            <Card className="overflow-hidden shadow-xl max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2">
                <div>
                  <img
                    src={
                      (ongoingEvents[0] || upcomingEvents[0])?.thumbnail?.url ||
                      (ongoingEvents[0] || upcomingEvents[0])?.thumbnailUrl ||
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png"
                    }
                    alt={(ongoingEvents[0] || upcomingEvents[0]).title}
                    className="w-full h-64 md:h-full object-cover"
                    data-testid="featured-event-image"
                  />
                </div>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge
                      className={getCategoryColor(
                        (ongoingEvents[0] || upcomingEvents[0]).category
                      )}
                      data-testid="featured-event-category"
                    >
                      {(
                        ongoingEvents[0] || upcomingEvents[0]
                      ).category?.toUpperCase()}
                    </Badge>
                    {ongoingEvents.length > 0 && <Badge>On Going</Badge>}
                  </div>

                  <h3
                    className="text-3xl font-bold text-card-foreground mb-4"
                    data-testid="featured-event-name"
                  >
                    {(ongoingEvents[0] || upcomingEvents[0]).title}
                  </h3>

                  <p
                    className="text-muted-foreground mb-6 text-lg"
                    data-testid="featured-event-desc"
                  >
                    {(ongoingEvents[0] || upcomingEvents[0]).description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-3 h-5 w-5 text-primary" />
                      <span data-testid="featured-event-date">
                        {upcomingEvents[0].date
                          ? format(
                              new Date(upcomingEvents[0].date),
                              "EEEE, MMMM d, yyyy"
                            )
                          : "Date TBA"}
                      </span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-3 h-5 w-5 text-primary" />
                      <span data-testid="featured-event-time">
                        {upcomingEvents[0].time || "Time TBA"}
                      </span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-3 h-5 w-5 text-primary" />
                      <span data-testid="featured-event-location">
                        {upcomingEvents[0].location || "Location TBA"}
                      </span>
                    </div>
                    {upcomingEvents[0].speaker && (
                      <div className="flex items-center text-muted-foreground">
                        <User className="mr-3 h-5 w-5 text-primary" />
                        <span data-testid="featured-event-speaker">
                          {upcomingEvents[0].speaker}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      ) : null}

      {/* Events Tabs */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3">
              <h2
                className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
                data-testid="all-events-title"
              >
                All Events
              </h2>
              {/* {backgroundLoading && (
                <span className="text-sm text-muted-foreground mb-4">
                  Updating...
                </span>
              )} */}
            </div>
            <p
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
              data-testid="all-events-description"
            >
              Browse upcoming and past church events
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as "upcoming" | "ongoing" | "past");
              setCurrentPage(0); // Reset to first page when switching tabs
            }}
            className="w-full"
          >
            <div className="w-full overflow-x-auto pb-4 mb-8">
              <TabsList className="inline-flex min-w-full sm:w-auto justify-start sm:justify-center gap-1 sm:gap-2 p-1">
                <TabsTrigger
                  value="upcoming"
                  data-testid="tab-upcoming"
                  className="flex-1 sm:flex-none whitespace-nowrap px-3 sm:px-6"
                >
                  <Calendar className="w-4 h-4 mr-2 hidden sm:inline-block" />
                  Upcoming ({upcomingEvents.length})
                </TabsTrigger>
                <TabsTrigger
                  value="ongoing"
                  data-testid="tab-ongoing"
                  className="flex-1 sm:flex-none whitespace-nowrap px-3 sm:px-6"
                >
                  <Clock className="w-4 h-4 mr-2 hidden sm:inline-block" />
                  Happening Now ({ongoingEvents.length})
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  data-testid="tab-past"
                  className="flex-1 sm:flex-none whitespace-nowrap px-3 sm:px-6"
                >
                  <Calendar className="w-4 h-4 mr-2 hidden sm:inline-block" />
                  Past Events ({pastEvents.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upcoming" data-testid="upcoming-events-content">
              <EventsGrid
                events={upcomingEvents}
                loading={eventsLoading}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </TabsContent>

            <TabsContent value="ongoing" data-testid="ongoing-events-content">
              <EventsGrid
                events={ongoingEvents}
                loading={eventsLoading}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </TabsContent>

            <TabsContent value="past" data-testid="past-events-content">
              <EventsGrid
                events={pastEvents}
                loading={eventsLoading}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
