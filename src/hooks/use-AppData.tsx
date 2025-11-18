import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Configs } from "../lib/utils";
import { set } from "date-fns";

interface Event {
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
}

interface Sermon {
  _id: string;
  title: string;
  speaker: string;
  date: string;
  description: string;
  videoUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  scripture?: string;
  series?: string;
  isLive?: boolean;
  likes: string[];
  thumbnail: { url?: string; public_id?: string };
  createdAt: string;
}

interface AppData {
  events: Event[];
  Sermons: Sermon[];
  gallery: GalleryImage[];
  Pastors: Pastor[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  setEvents: (events: Event[]) => void;
}
export type GalleryImage = {
  _id: string;
  title: string;
  imageUrl: string;
  category: "general" | "events" | "worship" | "community";
  image: { url?: string; public_id?: string };
};

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

export const useAppData = (): AppData => {
  const [events, setEvents] = useState<Event[]>([]);
  const [Sermons, setSermons] = useState<Sermon[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [Pastors, setPastors] = useState<Pastor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const updateEvents = useCallback((newEvents: Event[]) => {
    setEvents(newEvents);
  }, []);

  const fetchData = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // Fetch both endpoints in parallel
      const [eventsRes, sermonsRes, galleryRes, pastorsRes] = await Promise.all(
        [
          axios.get(`${Configs.url}/api/events/all`),
          axios.get(`${Configs.url}/api/sermons/all`),
          axios.get(`${Configs.url}/api/gallery/all`),
          axios.get(`${Configs.url}/api/pastors/all`),
        ]
      );

      // Batch state updates
      const updates = () => {
        setEvents(eventsRes.data.events || []);
        setSermons(sermonsRes.data.sermons || []);
        setGallery(galleryRes.data.gallery || []);
        setPastors(pastorsRes.data.pastors || []);
        // Force refresh
      };

      updates();
    } catch (err: any) {
      console.error("API Error:", err);
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to fetch data on mount and when updateTrigger changes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    events,
    Sermons,
    gallery,
    Pastors,
    loading,
    error,
    refresh: fetchData,
    setEvents: updateEvents, // Use our new memoized setter
  };
};
