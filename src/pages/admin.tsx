import { useState, useEffect, useRef } from "react";
import { Redirect } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Skeleton } from "../components/ui/skeleton";
import { Switch } from "../components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  Image,
  Mail,
  Eye,
  Bell,
  Settings as SettingsIcon,
  Ban,
  MessageSquare,
  PlayCircleIcon,
  Loader2,
  DeleteIcon,
  LoaderCircle,
  CameraIcon,
  ImageIcon,
  Circle,
  ArchiveIcon,
  Settings,
  Loader,
  RefreshCwIcon,
  PlaySquare,
} from "lucide-react";
import { format, set } from "date-fns";
import { useForm } from "react-hook-form";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import LoginForm from "../components/login-form";
import axios from "axios";
import { Configs } from "../lib/utils";
import { useSermons } from "../hooks/useSermons";
import { useEvents } from "../hooks/useEvents";

// Define types locally since shared/schema is removed
export type Event = {
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
};

export type Sermon = {
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
  thumbnail: { url?: string; public_id?: string };
  isLive?: boolean;
};

export type Newsletter = {
  id: string;
  email: string;
  subscribedAt: string;
  active: boolean;
};

export type Donation = {
  id: string;
  amount: string;
  donorName?: string;
  purpose: "general" | "missions" | "building" | "special";
  status: "completed" | "pending" | "failed";
  createdAt: string;
};

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

export type Notification = {
  _id: string;
  title: string;
  description: string;
  type: "donation" | "event" | "system" | "user" | "sermon" | "gallery";
  createdAt: string;
  read: boolean;
  archived?: boolean;
};

export type User = {
  _id: string;
  name?: string;
  email?: string;
  profileImage?: { url?: string; public_id?: string };
  reminder?: boolean;
  banned?: boolean;
  createdAt?: string | null;
  imageUrl?: string;
  contact?: string;
};

const mockNewsletters: Newsletter[] = [
  {
    id: "1",
    email: "test1@example.com",
    subscribedAt: new Date().toISOString(),
    active: true,
  },
  {
    id: "2",
    email: "test2@example.com",
    subscribedAt: new Date().toISOString(),
    active: false,
  },
];

const mockDonations: Donation[] = [
  {
    id: "1",
    amount: "100.00",
    donorName: "Jane Doe",
    purpose: "missions",
    status: "completed",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    amount: "50.00",
    purpose: "general",
    status: "completed",
    createdAt: new Date().toISOString(),
  },
];

type EventForm = Omit<Event, "id">;
type SermonForm = Omit<Sermon, "id">;
type GalleryForm = Omit<GalleryImage, "id">;
type PastorForm = Omit<Pastor, "id">;

function AdminDashboard() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("events");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [editingPastor, setEditingPastor] = useState<Pastor | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showSermonDialog, setShowSermonDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [showPastorDialog, setShowPastorDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Loader2 className="h-8 w-8" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <LoginForm />;
  }
  const { data: allSermons = [] } = useSermons();
  const { data: allEvents = [], isLoading: hookLoading, refetch } = useEvents();

  const { toast } = useToast();

  // State management for mock data
  const [events, setEvents] = useState<Event[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [newsletters, setNewsletters] = useState(mockNewsletters);
  const [donations, setDonations] = useState(mockDonations);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [pastors, setPastors] = useState<Pastor[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [eventsLoading, setEventsLoading] = useState(true);
  const [sermonsLoading, setSermonsLoading] = useState(true);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [pastorsLoading, setPastorsLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setdeleteLoading] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setEventsLoading(false);
      setSermonsLoading(false);
      setDonationsLoading(false);
      setGalleryLoading(false);
      setPastorsLoading(false);
      setNotificationsLoading(false);
      setUsersLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Event form
  const eventForm = useForm<EventForm>({
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      speaker: "",
      thumbnailUrl: "",
      category: "general",
    },
    resolver: zodResolver(
      z
        .object({
          title: z
            .string()
            .min(1, "Title is required")
            .max(100, "Title is too long"),
          description: z.string().min(1, "Description is required"),
          date: z
            .string()
            .min(1, "Date is required")
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
          time: z
            .string()
            .min(1, "Time is required")
            .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
          location: z.string().min(1, "Location is required"),
          speaker: z.string().optional().or(z.literal("")),
          thumbnailUrl: z.string().optional().or(z.literal("")),
          category: z
            .enum(["general", "service", "youth", "community"])
            .optional()
            .default("general"),
        })
        .partial({ speaker: true, thumbnailUrl: true })
    ),
  });

  // Sermon form
  const sermonForm = useForm<SermonForm>({
    defaultValues: {
      title: "",
      speaker: "",
      date: "",
      description: "",
      videoUrl: "",
      audioUrl: "",
      thumbnailUrl: "",
      scripture: "",
      series: "",
      isLive: false,
    },
    resolver: zodResolver(
      z
        .object({
          title: z
            .string()
            .min(1, "Title is required")
            .max(100, "Title is too long"),
          speaker: z.string().min(1, "Speaker is required"),
          date: z
            .string()
            .min(1, "Date is required")
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
          description: z.string().min(1, "Description is required"),
          videoUrl: z
            .string()
            .url("Invalid video URL")
            .optional()
            .or(z.literal("")),
          audioUrl: z
            .string()
            .url("Invalid audio URL")
            .optional()
            .or(z.literal("")),
          thumbnailUrl: z
            .string()
            .url("Invalid thumbnail URL")
            .optional()
            .or(z.literal("")),
          scripture: z.string().optional().or(z.literal("")),
          series: z.string().optional().or(z.literal("")),
          isLive: z.boolean().optional().default(false),
        })
        .partial({
          videoUrl: true,
          audioUrl: true,
          thumbnailUrl: true,
          scripture: true,
          series: true,
        })
    ),
  });

  // Gallery form
  const galleryForm = useForm<GalleryForm>({
    defaultValues: {
      title: "",
      imageUrl: "",
      category: "general",
    },
    resolver: zodResolver(
      z.object({
        title: z
          .string()
          .min(1, "Title is required")
          .max(100, "Title is too long"),
        imageUrl: z
          .string()
          .url("Invalid image URL")
          .optional()
          .or(z.literal("")),
        category: z.enum(["general", "events", "worship", "community"], {
          required_error: "Please select a category",
        }),
      })
    ),
  });

  // Pastor form
  const pastorForm = useForm<PastorForm>({
    defaultValues: {
      name: "",
      title: "",
      bio: "",
      imageUrl: "",
      email: "",
      isLead: false,
      order: 0,
    },
    resolver: zodResolver(
      z
        .object({
          name: z
            .string()
            .min(1, "Name is required")
            .max(100, "Name is too long"),
          title: z.string().min(1, "Title is required"),
          bio: z
            .string()
            .min(1, "Bio is required")
            .max(1000, "Bio is too long"),
          imageUrl: z
            .string()
            .url("Invalid image URL")
            .optional()
            .or(z.literal("")),
          email: z
            .string()
            .min(1, "Email is required")
            .email("Invalid email format"),
          isLead: z.boolean().optional().default(false),
          order: z
            .number()
            .int()
            .min(0, "Order must be 0 or greater")
            .optional()
            .default(0),
        })
        .partial({ imageUrl: true, isLead: true, order: true })
    ),
  });

  // 2) File chosen
  // handleImageUpload accepts optional react-hook-form setValue and field name to populate forms when uploading
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sel = e.target.files?.[0];
    if (!sel || !sel.type.startsWith("image/")) {
      return toast({ title: "Select a valid image", variant: "destructive" });
    }
    setFile(sel);
    const preview = URL.createObjectURL(sel);
    setPreviewUrl(preview);
  };

  // 3) Upload helper
  const uploadFileToServer = async (file: File, route: String) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await axios.post(
        `${Configs.url}/api/${route}/upload/image`,
        fd,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      return data;
    } catch (error) {
      toast({
        title: "Error!",
        description: "Image upload failed, please try again!",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  //get Events from server
  const getEvents = async () => {
    try {
      const response = await axios.get(`${Configs.url}/api/events/all`);
      if (response.status === 200) {
        setEvents(response.data.events);
      }
    } catch (error: any) {}
  };

  // Create Event
  const createEvent = async (data: EventForm) => {
    try {
      // Form validation
      const result = await eventForm.trigger();
      if (!result) {
        // Get all form errors
        const errors = eventForm.formState.errors;
        Object.entries(errors).forEach(([field, error]) => {
          if (error?.message) {
            toast({
              title: `Invalid ${field}`,
              description: error.message,
              variant: "destructive",
            });
          }
        });
        return;
      }

      if (file === null) {
        setLoading(true);
        const eventData = { ...data };

        const response = await axios.post(
          `${Configs.url}/api/events/new-event`,
          eventData,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        if (response.status === 201) {
          setEvents(response.data.events);

          toast({ title: "Event created successfully!" });
          setShowEventDialog(false);
          eventForm.reset();
          setPreviewUrl("");
        }
      } else {
        setLoading(true);
        const { url, public_id } = await uploadFileToServer(file, "events");
        const eventData = { ...data, url, public_id };

        const response = await axios.post(
          `${Configs.url}/api/events/new-event`,
          eventData,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        if (response.status === 201) {
          setEvents(response.data.events);
          toast({ title: "Event created successfully!" });
          setShowEventDialog(false);
          eventForm.reset();
          setPreviewUrl("");
        }
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        toast({
          title: "Error!",
          description: err.response.data.err || err.response.data.error,
          variant: "destructive",
        });

        console.error(
          "Error:",
          err.response.data.err || err.response.data.error
        );
      } else {
        toast({
          title: "Error!",
          description: err.message,
          variant: "destructive",
        });

        console.error("Network error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update Event
  const updateEvent = async (id: string, data: Partial<EventForm>) => {
    try {
      // Form validation
      const isValid = await eventForm.trigger();
      if (!isValid) {
        const errors = eventForm.formState.errors;
        Object.entries(errors).forEach(([field, error]) => {
          if (error?.message) {
            toast({
              title: `Invalid ${field}`,
              description: error.message,
              variant: "destructive",
            });
          }
        });
        return;
      }

      setLoading(true);

      // Upload file if present
      let eventData = { ...data };
      if (file !== null) {
        const uploadResult = await uploadFileToServer(file, "events");
        if (!uploadResult) {
          setLoading(false);
          return;
        }
        const { url, public_id } = uploadResult;
        eventData = {
          ...eventData,
          thumbnail: { url, public_id },
          thumbnailUrl: "",
        };
      }

      // Update the event
      const res = await axios.put(
        `${Configs.url}/api/events/update-event/${id}`,
        eventData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (res.status === 200) {
        // Update local state
        if (res.data.events) {
          setEvents(res.data.events);
        } else {
          setEvents((prev) =>
            prev.map((e) => (e._id === id ? { ...e, ...eventData } : e))
          );
        }
        toast({ title: "Event updated successfully!" });
        resetEventDialog();
        setEditingEvent(null);
      }
    } catch (error: any) {
      toast({
        title: "Error updating event",
        variant: "destructive",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to update event",
      });
    } finally {
      setLoading(false);
    }
  };
  // Delete Event
  const deleteEvent = async (id: string) => {
    setdeleteLoading(id);
    try {
      const res = await axios.delete(
        `${Configs.url}/api/events/delete-event/${id}`
      );
      if (res.status === 200) {
        setEvents(res.data.events);
        setEvents((prev) => prev.filter((e) => e._id !== id));
        toast({ title: "Event deleted successfully!" });
      }
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: `Failed to delete event: ${error}`,
      });
    } finally {
      setdeleteLoading("");
    }
  };

  // Create Sermon
  const createSermon = async (data: SermonForm) => {
    setLoading(true);
    try {
      // Form validation
      const result = await sermonForm.trigger();
      if (!result) {
        // Get all form errors
        const errors = sermonForm.formState.errors;
        Object.entries(errors).forEach(([field, error]) => {
          if (error?.message) {
            toast({
              title: `Invalid ${field}`,
              description: error.message,
              variant: "destructive",
            });
          }
        });
        return;
      }

      if (file !== null) {
        const { url, public_id } = await uploadFileToServer(file, "sermons");
        const eventData = { ...data, url, public_id };

        console.log("Sermon Data:", eventData);
        const response = await axios.post(
          `${Configs.url}/api/sermons/new-sermon`,
          eventData,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        if (response.status === 201) {
          const newSermon: Sermon = { ...data, _id: response.data.id };
          setSermons((prev) => [...prev, newSermon]);
          toast({ title: "Sermon created successfully!" });
          resetSermonDialog();
        }
      } else {
        const eventData = { ...data };

        console.log("Sermon Data:", eventData);
        const response = await axios.post(
          `${Configs.url}/api/sermons/new-sermon`,
          eventData,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        if (response.status === 201) {
          setSermons(response.data.sermons);

          toast({ title: "Sermon created successfully!" });
          // setShowSermonDialog(false);
          sermonForm.reset();
        }
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        toast({
          title: "Error!",
          description: err.response.data.err || err.response.data.error,
          variant: "destructive",
        });

        console.error(
          "Error:",
          err.response.data.err || err.response.data.error
        );
      } else {
        toast({
          title: "Error!",
          description: err.message,
          variant: "destructive",
        });

        console.error("Network error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get Sermons
  const getSermons = async () => {
    try {
      const response = await axios.get(`${Configs.url}/api/sermons/all`);
      if (response.status === 200) {
        setSermons(response.data.sermons);
      }
    } catch (error) {}
  };
  // Update Sermon
  const updateSermon = async (id: string, data: Partial<SermonForm>) => {
    try {
      // Form validation
      const isValid = await sermonForm.trigger();
      if (!isValid) {
        const errors = sermonForm.formState.errors;
        Object.entries(errors).forEach(([field, error]) => {
          if (error?.message) {
            toast({
              title: `Invalid ${field}`,
              description: error.message,
              variant: "destructive",
            });
          }
        });
        return;
      }

      setLoading(true);

      // Upload file if present
      let sermonData = { ...data };
      if (file !== null) {
        const uploadResult = await uploadFileToServer(file, "sermons");
        if (!uploadResult) {
          setLoading(false);
          return;
        }
        const { url, public_id } = uploadResult;
        sermonData = {
          ...sermonData,
          thumbnail: { url, public_id },
          thumbnailUrl: "", // override any existing thumbnailUrl
        };
      }

      // Update the sermon
      const res = await axios.put(
        `${Configs.url}/api/sermons/update-sermon/${id}`,
        sermonData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (res.status === 200) {
        // Update local state
        if (res.data.sermons) {
          setSermons(res.data.sermons);
        } else {
          setSermons((prev) =>
            prev.map((sermon) =>
              sermon._id === id ? { ...sermon, ...sermonData } : sermon
            )
          );
        }

        toast({ title: "Sermon updated successfully!" });
        resetSermonDialog();
        setEditingSermon(null);
      }
    } catch (error: any) {
      console.error("Error updating sermon:", error);
      toast({
        title: "Error updating sermon",
        variant: "destructive",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to update sermon",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete Sermon
  const deleteSermon = async (id: string) => {
    setdeleteLoading(id);
    try {
      const res = await axios.delete(
        `${Configs.url}/api/sermons/delete-sermon/${id}`
      );
      if (res.status === 200) {
        // server returns remaining sermons or success; remove locally by id
        setSermons((prev) => prev.filter((s) => s._id !== id));
        toast({ title: "Sermon deleted successfully!" });
      }
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: `Failed to delete sermon: ${error}`,
      });
    } finally {
      setdeleteLoading("");
    }
  };

  // Create Gallery Image
  const createGalleryImage = async (data: GalleryForm) => {
    try {
      // Form validation
      const result = await galleryForm.trigger();
      if (!result) {
        // Get all form errors
        const errors = galleryForm.formState.errors;
        Object.entries(errors).forEach(([field, error]) => {
          if (error?.message) {
            toast({
              title: `Invalid ${field}`,
              description: error.message,
              variant: "destructive",
            });
          }
        });
        return;
      }

      setLoading(true);
      if (file) {
        const { url, public_id } = await uploadFileToServer(file, "gallery");
        const galleryData = { ...data, url, public_id };

        const response = await axios.post(
          `${Configs.url}/api/gallery/new`,
          galleryData,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        if (response.status === 201) {
          setGalleryImages(response.data.gallery);
          toast({ title: "Image added to gallery!" });
          resetGalleryDialog();
        }
      } else {
        const galleryData = { ...data };

        const response = await axios.post(
          `${Configs.url}/api/gallery/new`,
          galleryData,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        if (response.status === 201) {
          setGalleryImages(response.data.gallery);
          toast({ title: "Image added to gallery!" });
          resetGalleryDialog();
        }
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        toast({
          title: "Error!",
          description: err.response.data.err || err.response.data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error!",
          description: "Failed to add image to gallery",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  // Get Gallery Images
  const getGalleryImages = async () => {
    try {
      const response = await axios.get(`${Configs.url}/api/gallery/all`);
      if (response.status === 200) {
        setGalleryImages(response.data.gallery);
      }
    } catch (error: any) {}
  };

  // Delete Gallery Image
  const deleteImage = async (id: string) => {
    setdeleteLoading(id);
    try {
      const res = await axios.delete(`${Configs.url}/api/gallery/delete/${id}`);
      if (res.status === 200) {
        setGalleryImages(res.data.gallery);
        toast({ title: "Gallery image deleted successfully!" });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        variant: "destructive",
        description:
          error.response.data.err || "Failed to delete gallery image.",
      });
    } finally {
      setdeleteLoading("");
    }
  };

  // Create Pastor
  const createPastor = async (data: PastorForm) => {
    try {
      // Form validation
      const result = await pastorForm.trigger();
      if (!result) {
        // Get all form errors
        const errors = pastorForm.formState.errors;
        Object.entries(errors).forEach(([field, error]) => {
          if (error?.message) {
            toast({
              title: `Invalid ${field}`,
              description: error.message,
              variant: "destructive",
            });
          }
        });
        return;
      }

      setLoading(true);
      if (file === null) {
        const res = await axios.post(
          `${Configs.url}/api/pastors/new-pastor`,
          data
        );
        if (res.status === 201) {
          setPastors(res.data.pastors);
          setNotifications(res.data.notifications);
          toast({ title: "Pastor added successfully!" });
          setShowPastorDialog(false);
          pastorForm.reset();
        }
      } else {
        const { url, public_id } = await uploadFileToServer(file, "pastors");
        const pastorData = { ...data, profileImage: { url, public_id } };

        const res = await axios.post(
          `${Configs.url}/api/pastors/new-pastor`,
          pastorData
        );
        if (res.status === 201) {
          setPastors(res.data.pastors);
          toast({ title: "Pastor added successfully!" });
          setShowPastorDialog(false);
          pastorForm.reset();
        }
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        toast({
          title: "Error!",
          description: err.response.data.err || err.response.data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error!",
          description: "Failed to add pastor",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  //get Pastors
  const getPastors = async () => {
    try {
      const response = await axios.get(`${Configs.url}/api/pastors/all`);
      if (response.status === 200) {
        setPastors(response.data.pastors);
      }
    } catch (error) {
      // log({title:"Error", variant:"destructive",description:"Failed to fetch pastors."});
    }
  };
  // Update Pastor
  const updatePastor = async (id: string, data: Partial<PastorForm>) => {
    try {
      // Form validation
      const isValid = await pastorForm.trigger();
      if (!isValid) {
        const errors = pastorForm.formState.errors;
        Object.entries(errors).forEach(([field, error]) => {
          if (error?.message) {
            toast({
              title: `Invalid ${field}`,
              description: error.message,
              variant: "destructive",
            });
          }
        });
        return;
      }

      setLoading(true);

      // Upload file if present
      let pastorData = { ...data };
      if (file !== null) {
        const uploadResult = await uploadFileToServer(file, "pastors");
        if (!uploadResult) {
          setLoading(false);
          return;
        }
        const { url, public_id } = uploadResult;
        pastorData = { ...pastorData, profileImg: { url, public_id } };
      }

      const res = await axios.put(
        `${Configs.url}/api/pastors/update-profile/${id}`,
        pastorData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (res.status === 200) {
        // Update local state
        if (res.data.pastors) {
          setPastors(res.data.pastors);
        } else {
          setPastors((prev) =>
            prev.map((p) => (p._id === id ? { ...p, ...pastorData } : p))
          );
        }
        if (res.data.notifications) {
          setNotifications(res.data.notifications);
        }

        toast({ title: "Pastor updated successfully!" });
        resetPastorDialog();
        setEditingPastor(null);
      }
    } catch (error: any) {
      toast({
        title: "Error updating pastor",
        variant: "destructive",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to update pastor profile",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete Pastor
  const deletePastor = async (id: string) => {
    setdeleteLoading(id);
    try {
      const res = await axios.delete(
        `${Configs.url}/api/pastors/delete-pastor/${id}`
      );
      if (res.status === 200) {
        setPastors(res.data.pastors);
        setNotifications(res.data.notifications);
        setPastors((prev) => prev.filter((p) => p._id !== id));
        toast({ title: "Pastor deleted successfully!" });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        variant: "destructive",
        description: `Failed to delete pastor: ${
          error.response?.data?.err || error.message
        }`,
      });
    } finally {
      setdeleteLoading("");
    }
  };

  const getNotifications = async () => {
    try {
      const response = await axios.get(
        `${Configs.url}/api/notifications/get-notifications`
      );
      if (response.status === 200) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to fetch notifications.",
      });
    }
  };
  //archieved Notification
  const archiveNotification = async (id: string) => {
    try {
      const res = await axios.put(
        `${Configs.url}/api/notifications/archive-notification/${id}`
      );
      if (res.status === 200) {
        setNotifications(res.data.notifications);
        toast({ title: "Notification archived." });
      }
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to archive notification.",
      });
    }
  };

  // Delete Notification
  const deleteNotification = async (id: string) => {
    setdeleteLoading(id);
    try {
      const res = await axios.delete(
        `${Configs.url}/api/notifications/delete-notification/${id}`
      );
      if (res.status === 200) {
        toast({ title: "Notification deleted." });
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Failed to delete notification.",
      });
    } finally {
      setdeleteLoading("");
    }
  };

  // Unarchive notifications
  const UnArchiveNotifications = async () => {
    try {
      const res = await axios.put(
        `${Configs.url}/api/notifications/unarchive-notifications`
      );
      if (res.status === 200) {
        setNotifications(res.data.notifications);
        toast({ title: "All notifications unarchived." });
      }
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to unarchive notifications.",
      });
    }
  };
  // Clear all notifications
  const clearAllNotifications = async () => {
    setdeleteLoading("clear-all");
    try {
      const res = await axios.delete(
        `${Configs.url}/api/notifications/clear-notifications`
      );
      if (res.status === 200) {
        toast({ title: "All notifications cleared." });
        setNotifications([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to clear notifications.",
      });
    } finally {
      setdeleteLoading("");
    }

    setNotifications([]);
    toast({ title: "All notifications cleared." });
  };

  // Get Users
  const getSubscribers = async () => {
    try {
      const response = await axios.get(
        `${Configs.url}/api/news-letter/subscribers`
      );
      if (response.status === 200) {
        // Normalize subscriber objects to a consistent shape for the UI.
        const subs = Array.isArray(response.data.subscribers)
          ? response.data.subscribers
          : [];
        const normalized: User[] = subs.map((s: any, i: number) => ({
          _id: s._id || s.id || `${s.email || "user"}-${i}`,
          name:
            s.name ||
            s.fullName ||
            s.displayName ||
            s.email?.split("@")?.[0] ||
            `User ${i}`,
          email: s.email || "",
          contact: s.contact,
          profileImage: s.profileImage || s.pr || s.avatarUrl || "",

          createdAt: s.createdAt || s.createdAt || null,
          banned: !!s.banned,
        }));
        setUsers(normalized);
      }
    } catch (error) {}
  };

  // Event handlers
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    eventForm.reset({
      title: event.title,
      description: event.description,
      date: format(new Date(event.date), "yyyy-MM-dd"),
      time: event.time,
      location: event.location,
      speaker: event.speaker || "",
      thumbnailUrl: event?.thumbnailUrl || "",
      category: event.category,
    });
    setPreviewUrl(event?.thumbnailUrl || event?.thumbnail?.url || "");
    setShowEventDialog(true);
  };

  const handleSubmitEvent = async (data: EventForm) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent._id, data);
      } else {
        await createEvent(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save event",
        variant: "destructive",
      });
    }
  };

  const handleSubmitSermon = async (data: SermonForm) => {
    try {
      if (editingSermon) {
        await updateSermon(editingSermon._id, data);
      } else {
        await createSermon(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save sermon",
        variant: "destructive",
      });
    }
  };

  const handleEditSermon = (sermon: Sermon) => {
    setEditingSermon(sermon);
    setPreviewUrl(sermon.thumbnailUrl || sermon.thumbnail.url || "");
    sermonForm.reset({
      ...sermon,
      date: format(new Date(sermon.date), "yyyy-MM-dd"),
    });
    setShowSermonDialog(true);
  };

  const handleSubmitGallery = async (data: GalleryForm) => {
    try {
      await createGalleryImage(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save gallery image",
        variant: "destructive",
      });
    }
  };

  const handleSubmitPastor = async (data: PastorForm) => {
    try {
      if (editingPastor) {
        await updatePastor(editingPastor._id, data);
      } else {
        await createPastor(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save pastor",
        variant: "destructive",
      });
    }
  };

  const handleEditPastor = (pastor: Pastor) => {
    setPreviewUrl(pastor.imageUrl || pastor.profileImg.url || "");
    setEditingPastor(pastor);
    pastorForm.reset(pastor);
    setShowPastorDialog(true);
  };

  const resetEventDialog = () => {
    setShowEventDialog(false);
    setEditingEvent(null);
    setFile(null);
    setPreviewUrl("");
    eventForm.reset();
  };

  const resetSermonDialog = () => {
    setShowSermonDialog(false);
    setEditingSermon(null);
    setFile(null);
    setPreviewUrl("");
    sermonForm.reset();
  };

  const resetPastorDialog = () => {
    setShowPastorDialog(false);
    setEditingPastor(null);
    setFile(null);
    setPreviewUrl("");
    pastorForm.reset();
  };

  const resetGalleryDialog = () => {
    setShowGalleryDialog(false);
    setFile(null);
    setPreviewUrl("");
    galleryForm.reset();
  };

  // Add this helper function before the AdminDashboard component
  const getEventStatus = (
    eventDate: string
  ): "upcoming" | "ongoing" | "past" => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);

    if (event < today) {
      return "past";
    } else if (event.getTime() === today.getTime()) {
      return "ongoing";
    } else {
      return "upcoming";
    }
  };

  const getStatusBadgeVariant = (status: "upcoming" | "ongoing" | "past") => {
    switch (status) {
      case "upcoming":
        return "secondary";
      case "ongoing":
        return "default";
      case "past":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: "upcoming" | "ongoing" | "past") => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "ongoing":
        return "Ongoing";
      case "past":
        return "Past";
      default:
        return "Unknown";
    }
  };

  useEffect(() => {
    getNotifications();
    getEvents();
    getSermons();
    getPastors();
    getGalleryImages();

    const interval = setInterval(() => {
      getSubscribers();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mt-4 mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <h1 className="text-4xl font-bold" data-testid="admin-title">
            Admin Dashboard
          </h1>
          <p className="text-xl mt-2 opacity-90" data-testid="admin-subtitle">
            Manage church events, sermons, and content
          </p>
        </div>
      </section>

      {/* Admin Tabs */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full justify-evenly grid-cols-9 mb-8">
              <TabsTrigger value="events" data-testid="tab-events">
                Events{" "}
                {allEvents.length > 0 &&
                  `(${
                    allEvents.filter((e: any) => new Date(e.date) >= new Date())
                      .length
                  })`}
              </TabsTrigger>
              <TabsTrigger value="sermons" data-testid="tab-sermons">
                Sermons {allSermons.length > 0 && `(${allSermons.length})`}
              </TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">
                Users
              </TabsTrigger>
              <TabsTrigger
                value="newsletters"
                className="hidden"
                data-testid="tab-newsletters"
              >
                Newsletter
              </TabsTrigger>
              <TabsTrigger
                className="hidden"
                value="donations"
                data-testid="tab-donations"
              >
                Donations
              </TabsTrigger>
              <TabsTrigger value="gallery" data-testid="tab-gallery">
                Gallery
              </TabsTrigger>
              <TabsTrigger value="pastors" data-testid="tab-pastors">
                Pastors
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                data-testid="tab-notifications"
              >
                Notifications{" "}
                {notifications.filter((n) => !n.read && !n.archived).length >
                  0 && (
                  <span className="ml-2 text-primary ">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                className="hidden"
                value="settings"
                data-testid="tab-settings"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="events">
              <Card className="max-h-[500px] ">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Events Management{" "}
                    {allEvents.length > 0 && `(${allEvents.length})`}
                    <Badge
                      onClick={async () => {
                        setRefreshing(true);
                        setEventsLoading(true);
                        await getEvents();
                        setEventsLoading(false);
                        setRefreshing(false);
                      }}
                      className="ml-2 cursor-pointer hover:bg-accent hover:text-primary"
                    >
                      Refresh
                      <RefreshCwIcon
                        className={`${
                          refreshing && "animate-spin"
                        } size-3 ml-2`}
                      />
                    </Badge>
                  </CardTitle>
                  <Dialog
                    open={showEventDialog}
                    onOpenChange={(open) => !open && resetEventDialog()}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingEvent(null);
                          eventForm.reset();
                          setShowEventDialog(true);
                        }}
                        data-testid="button-add-event"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <div className="max-h-[80vh] overflow-y-auto pr-3">
                        <DialogHeader>
                          <DialogTitle>
                            {editingEvent ? "Edit Event" : "Create New Event"}
                          </DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={eventForm.handleSubmit(handleSubmitEvent)}
                          className="space-y-4"
                        >
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="title">Event Title</Label>
                              <Input
                                id="title"
                                {...eventForm.register("title")}
                                data-testid="input-event-title"
                              />
                            </div>
                            <div>
                              <Label htmlFor="category">Category</Label>
                              <Select
                                value={eventForm.watch("category")}
                                onValueChange={(value) =>
                                  eventForm.setValue("category", value as any)
                                }
                              >
                                <SelectTrigger data-testid="select-event-category">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">
                                    General
                                  </SelectItem>
                                  <SelectItem value="service">
                                    Service
                                  </SelectItem>
                                  <SelectItem value="youth">Youth</SelectItem>
                                  <SelectItem value="community">
                                    Community
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              {...eventForm.register("description")}
                              data-testid="textarea-event-description"
                            />
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="date">Date</Label>
                              <Input
                                type="date"
                                {...eventForm.register("date")}
                                data-testid="input-event-date"
                              />
                            </div>
                            <div>
                              <Label htmlFor="time">Time</Label>
                              <Input
                                {...eventForm.register("time")}
                                placeholder="7:00 PM"
                                data-testid="input-event-time"
                              />
                            </div>
                            <div>
                              <Label htmlFor="location">Location</Label>
                              <Input
                                {...eventForm.register("location")}
                                data-testid="input-event-location"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="speaker">
                                Speaker (Optional)
                              </Label>
                              <Input
                                {...eventForm.register("speaker")}
                                data-testid="input-event-speaker"
                              />
                            </div>
                            <div>
                              <Label htmlFor="imageUrl">
                                Image (URL or Upload)
                              </Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  {...eventForm.register("thumbnailUrl")}
                                  placeholder="https://example.com/image.jpg"
                                  data-testid="input-event-image"
                                />
                                <Input
                                  type="file"
                                  id="event-image-upload"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    document
                                      .getElementById("event-image-upload")
                                      ?.click()
                                  }
                                >
                                  Upload
                                </Button>
                              </div>
                              {(previewUrl ||
                                eventForm.watch("thumbnailUrl")) && (
                                <div className="col-span-2 mt-4">
                                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                    <img
                                      src={
                                        previewUrl ||
                                        eventForm.watch("thumbnailUrl")
                                      }
                                      alt="Event preview"
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <DialogFooter className="flex justify-end gap-2 mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={resetEventDialog}
                              disabled={loading}
                              data-testid="button-cancel-event"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={loading}
                              data-testid="button-save-event"
                              className="min-w-[90px]"
                              onClick={eventForm.handleSubmit(
                                handleSubmitEvent
                              )}
                            >
                              {loading ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>
                                    {editingEvent
                                      ? "Updating..."
                                      : "Creating..."}
                                  </span>
                                </div>
                              ) : editingEvent ? (
                                "Update Event"
                              ) : (
                                "Create Event"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className=" max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thumbnail</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-28" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : events && events.length > 0 ? (
                        events.map((event) => {
                          const eventStatus = getEventStatus(event.date);
                          return (
                            <TableRow
                              key={event._id}
                              data-testid={`event-row-${event._id}`}
                            >
                              <TableCell className="font-medium">
                                <div className="relative h-12 w-12 rounded-md overflow-hidden">
                                  <img
                                    src={
                                      event.thumbnail?.url ||
                                      event.thumbnailUrl ||
                                      "https://via.placeholder.com/48?text=No+Image"
                                    }
                                    alt={event.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {event.title}
                              </TableCell>
                              <TableCell>
                                {format(new Date(event.date), "MMM d, yyyy")}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {event.category}
                                </Badge>
                              </TableCell>
                              <TableCell>{event.location}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={getStatusBadgeVariant(eventStatus)}
                                >
                                  {getStatusLabel(eventStatus)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditEvent(event)}
                                    data-testid={`button-edit-event-${event._id}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        className=""
                                        variant="destructive"
                                        data-testid={`button-delete-event-${event._id}`}
                                      >
                                        {deleteLoading === event._id ? (
                                          <Loader
                                            size={20}
                                            color="white"
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete Event
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "
                                          {event.title}"? This action cannot be
                                          undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteEvent(event._id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No events found. Create your first event!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sermons Tab */}
            <TabsContent value="sermons">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <PlaySquare className="mr-2 h-5 w-5" />
                    Sermons Management
                    <Badge
                      onClick={async () => {
                        setRefreshing(true);
                        setSermonsLoading(true);
                        await getSermons();
                        setSermonsLoading(false);
                        setRefreshing(false);
                      }}
                      className="ml-2 cursor-pointer hover:bg-accent hover:text-primary"
                    >
                      Refresh
                      <RefreshCwIcon
                        className={`${
                          refreshing && "animate-spin"
                        } size-3 ml-2`}
                      />
                    </Badge>
                  </CardTitle>
                  <Dialog
                    open={showSermonDialog}
                    onOpenChange={(open) => !open && resetSermonDialog()}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingSermon(null);
                          sermonForm.reset();
                          setShowSermonDialog(true);
                        }}
                        data-testid="button-add-sermon"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Sermon
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <div className="max-h-[80vh] overflow-y-auto pr-3">
                        <DialogHeader>
                          <DialogTitle>
                            {editingSermon
                              ? "Edit Sermon"
                              : "Create New Sermon"}
                          </DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            sermonForm.handleSubmit(handleSubmitSermon)(e);
                          }}
                          className="space-y-4"
                        >
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="title">Sermon Title</Label>
                              <Input
                                id="title"
                                {...sermonForm.register("title")}
                                data-testid="input-sermon-title"
                              />
                            </div>
                            <div>
                              <Label htmlFor="speaker">Speaker</Label>
                              <Input
                                {...sermonForm.register("speaker")}
                                data-testid="input-sermon-speaker"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              {...sermonForm.register("description")}
                              data-testid="textarea-sermon-description"
                            />
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="date">Date</Label>
                              <Input
                                type="date"
                                {...sermonForm.register("date")}
                                data-testid="input-sermon-date"
                              />
                            </div>
                            <div>
                              <Label htmlFor="scripture">Scripture</Label>
                              <Input
                                {...sermonForm.register("scripture")}
                                data-testid="input-sermon-scripture"
                              />
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="videoUrl">Video URL</Label>
                              <Input
                                {...sermonForm.register("videoUrl")}
                                data-testid="input-sermon-video"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="audioUrl"
                                className="text-muted-foreground"
                              >
                                Audio URL
                              </Label>
                              <Input
                                {...sermonForm.register("audioUrl")}
                                data-testid="input-sermon-audio"
                                disabled
                                placeholder="Coming Soon!"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="space-y-0.5">
                              <Label>Live Sermon</Label>
                              <p className="text-xs text-muted-foreground">
                                {sermonForm.watch("isLive")
                                  ? "This sermon will be shown as currently streaming live"
                                  : "Toggle this to mark the sermon as currently streaming live"}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  sermonForm.watch("isLive")
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              >
                                Status:{" "}
                                {sermonForm.watch("isLive")
                                  ? "Live Now"
                                  : "Not Live"}
                              </p>
                            </div>
                            <Switch
                              checked={sermonForm.watch("isLive")}
                              onCheckedChange={(checked) =>
                                sermonForm.setValue("isLive", checked)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="thumbnailUrl">
                              Thumbnail (URL or Upload)
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                {...sermonForm.register("thumbnailUrl")}
                                placeholder="https://example.com/thumb.jpg"
                                data-testid="input-sermon-thumbnail"
                              />
                              <Input
                                type="file"
                                id="sermon-thumb-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  document
                                    .getElementById("sermon-thumb-upload")
                                    ?.click()
                                }
                              >
                                Upload
                              </Button>
                            </div>
                            {(previewUrl ||
                              sermonForm.watch("thumbnailUrl")) && (
                              <div className="mt-2 space-y-2">
                                <div className="relative w-full rounded-lg overflow-hidden border">
                                  <img
                                    src={
                                      previewUrl ||
                                      sermonForm.watch("thumbnailUrl")
                                    }
                                    alt="Sermon thumbnail preview"
                                    className="w-full object-contain"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={resetSermonDialog}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                              {loading ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  {editingSermon
                                    ? "Updating Sermon..."
                                    : "Creating Sermon..."}
                                </div>
                              ) : editingSermon ? (
                                "Update Sermon"
                              ) : (
                                "Create Sermon"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className=" max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        {/* <TableHead>Thumbnail</TableHead> */}
                        <TableHead>Title</TableHead>
                        <TableHead>Speaker</TableHead>
                        <TableHead>Scripture</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sermonsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton className="h-12 w-12 rounded" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-48" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : sermons && sermons.length > 0 ? (
                        sermons.map((sermon) => (
                          <TableRow key={sermon._id}>
                            <TableCell>
                              <div className="relative h-12 w-12 rounded-md overflow-hidden">
                                <img
                                  src={
                                    sermon.thumbnail?.url ||
                                    sermon.thumbnailUrl ||
                                    "https://via.placeholder.com/48?text=No+Image"
                                  }
                                  alt={sermon.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {sermon.title}
                                </div>
                                {sermon.series && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {sermon.series}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{sermon.speaker}</TableCell>
                            <TableCell>
                              {(sermon.scripture &&
                                sermon.scripture !== "no  scripture") ||
                                (sermon.scripture !== "no-scripture" && (
                                  <Badge variant="outline" className="text-xs">
                                    {sermon.scripture}
                                  </Badge>
                                ))}
                            </TableCell>
                            <TableCell>
                              {format(new Date(sermon.date), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              {sermon.isLive ? (
                                <Badge
                                  variant="default"
                                  className="bg-green-500 text-white"
                                >
                                  <Circle className="text-white mr-2 animate-pulse" />
                                  Live Now
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <ArchiveIcon className=" mr-2" /> Recorded
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditSermon(sermon)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      {deleteLoading === sermon._id ? (
                                        <LoaderCircle
                                          size={20}
                                          color="white"
                                          className=" top-2 right-2 h-6 w-6 aboslute mx-auto animate-spin"
                                        />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Sermon
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "
                                        {sermon.title}"?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteSermon(sermon._id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            No sermons found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 ">
                  <Card className="max-h-[400px] min-h-[400px] overflow-y-auto">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        User Management
                        <Badge
                          onClick={async () => {
                            setRefreshing(true);
                            setUsersLoading(true);
                            await getSubscribers();
                            setUsersLoading(false);
                            setRefreshing(false);
                          }}
                          className="ml-2 cursor-pointer hover:bg-accent hover:text-primary"
                        >
                          Refresh
                          <RefreshCwIcon
                            className={`${
                              refreshing && "animate-spin"
                            } size-3 ml-2`}
                          />
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Subscribed</TableHead>
                            {users.filter((u) => u.reminder).length > 0 && (
                              <TableHead>Reminders</TableHead>
                            )}
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usersLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                              <TableRow key={i}>
                                <TableCell>
                                  <Skeleton className="h-10 w-10 rounded-full" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-4 w-40" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-4 w-12" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-8 w-24" />
                                </TableCell>
                              </TableRow>
                            ))
                          ) : users && users.length > 0 ? (
                            users.map((user, index) => {
                              const key = user._id || index;

                              // friendly fallback values
                              const displayName =
                                user.name?.trim() || `User ${index + 1}`;
                              const displayEmail =
                                user.email?.trim() || "Visitor";
                              const displayPhone =
                                user.contact?.trim() || "no contact!";
                              const subscribedAt = user.createdAt
                                ? (() => {
                                    try {
                                      return format(
                                        new Date(user.createdAt),
                                        "MMM d, yyyy"
                                      );
                                    } catch {
                                      return "—";
                                    }
                                  })()
                                : "—";

                              const avatarSrc =
                                user.profileImage?.url ||
                                user.imageUrl ||
                                "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80";

                              return (
                                <TableRow key={key}>
                                  {/* Avatar + name + email */}
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={avatarSrc}
                                        alt={displayName}
                                        className="h-10 w-10 rounded-full object-cover"
                                        loading="lazy"
                                      />
                                      <div>
                                        <p className="font-medium">
                                          {displayName}
                                        </p>
                                        <p className="text-sm text-muted-foreground text-gray-400">
                                          {displayEmail}
                                        </p>
                                      </div>
                                    </div>
                                  </TableCell>

                                  {/* contact */}
                                  <TableCell className="text-gray-400 p-1">
                                    {displayPhone}
                                  </TableCell>

                                  {/* Subscribed at */}
                                  <TableCell className="text-gray-400 p-1">
                                    {subscribedAt}
                                  </TableCell>

                                  {/* Actions */}
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                          toast({
                                            title: `Emailing ${displayName}`,
                                          })
                                        }
                                      >
                                        <Mail className="h-4 w-4" />
                                      </Button>

                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                          toast({
                                            title: `Sending SMS to ${displayName}`,
                                          })
                                        }
                                      >
                                        <MessageSquare className="h-4 w-4" />
                                      </Button>

                                      <Button
                                        className="bg-red-200 hover:bg-red-300"
                                        size="icon"
                                        onClick={() =>
                                          toast({
                                            title: `Banning ${displayName}`,
                                          })
                                        }
                                      >
                                        <Ban className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="py-12">
                                <div className="text-center space-y-4">
                                  <img
                                    src="https://img.freepik.com/premium-vector/flat-design-no-user-found_108061-1605.jpg"
                                    alt="No users"
                                    className="mx-auto h-36 w-auto"
                                  />
                                  <h3 className="text-lg font-semibold">
                                    No users yet
                                  </h3>
                                  <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                                    It looks like no one has signed up for the
                                    newsletter yet. Invite your congregation,
                                    share the site link, or import contacts to
                                    get started.
                                  </p>
                                  <div className="flex items-center justify-center gap-2 mt-4">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        try {
                                          navigator.clipboard?.writeText(
                                            window.location.href
                                          );
                                          toast({
                                            title: "Invite link copied",
                                          });
                                        } catch (e) {
                                          toast({
                                            title: "Could not copy invite link",
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                    >
                                      Copy Invite Link
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}

                          <div className="py-4">
                            <Button
                              variant="outline"
                              onClick={() => {
                                try {
                                  const rootUrl = `${window.location.origin}/`;
                                  navigator.clipboard?.writeText(rootUrl);
                                  toast({ title: "Invite link copied" });
                                } catch (e) {
                                  toast({
                                    title: "Could not copy invite link",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              Copy Invite Link
                            </Button>
                          </div>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Mail className="mr-2 h-5 w-5" />
                        Broadcast Message
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        className="space-y-4"
                        onSubmit={async (e) => {
                          setLoading(true);
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const subject = (
                            form.elements.namedItem(
                              "broadcast-subject"
                            ) as HTMLInputElement
                          ).value;
                          const message = (
                            form.elements.namedItem(
                              "broadcast-message"
                            ) as HTMLTextAreaElement
                          ).value;

                          if (!subject || !message) {
                            toast({
                              title: "Error",
                              description:
                                "Subject and message cannot be empty.",
                              variant: "destructive",
                            });
                            return;
                          }

                          try {
                            const response = await axios.post(
                              `${Configs.url}/api/news-letter/broadcast`,
                              {
                                subject,
                                message,
                                recipientCount: users.length,
                              }
                            );

                            if (response.status === 200) {
                              toast({
                                title: "Broadcast Sent!",
                                description: `Message with subject "${subject}" sent to ${users.length} users.`,
                              });
                              form.reset();
                            }
                          } catch (error) {
                            console.error("Broadcast error:", error);
                            toast({
                              title: "Error sending broadcast",
                              description:
                                "An error occurred while sending the broadcast. Please try again.",
                              variant: "destructive",
                            });
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        <div className="space-y-2">
                          <Label htmlFor="broadcast-subject">Subject</Label>
                          <Input
                            id="broadcast-subject"
                            placeholder="Enter subject..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="broadcast-message">Message</Label>
                          <Textarea
                            id="broadcast-message"
                            placeholder="Type your message to all users..."
                            rows={5}
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          {loading ? (
                            <span className=" flex-row  flex items-center gap-2     p-3 text-xs text-white">
                              Broadcasting Message...
                              <Loader className="animate-spin" size={16} />
                            </span>
                          ) : (
                            "Send Broadcast"
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Donations Tab */}
            <TabsContent value="donations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Donation Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-muted-foreground">
                      Total Donations:{" "}
                      <span className="font-semibold">
                        $
                        {donations
                          ?.reduce(
                            (sum, donation) =>
                              sum + parseFloat(donation.amount),
                            0
                          )
                          .toFixed(2) || "0.00"}
                      </span>
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>Donor</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donationsLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : donations && donations.length > 0 ? (
                        donations.map((donation) => (
                          <TableRow
                            key={donation.id}
                            data-testid={`donation-row-${donation.id}`}
                          >
                            <TableCell className="font-medium">
                              ${donation.amount}
                            </TableCell>
                            <TableCell>
                              {donation.donorName || "Anonymous"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {donation.purpose}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  donation.status === "completed"
                                    ? "default"
                                    : donation.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {donation.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(donation.createdAt || new Date()),
                                "MMM d, yyyy"
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No donations recorded yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Image className="mr-2 h-5 w-5" />
                    Gallery Management
                    <Badge
                      onClick={async () => {
                        setRefreshing(true);
                        setGalleryLoading(true);
                        await getGalleryImages();
                        setGalleryLoading(false);
                        setRefreshing(false);
                      }}
                      className="ml-2 cursor-pointer hover:bg-accent hover:text-primary"
                    >
                      Refresh
                      <RefreshCwIcon
                        className={`${
                          refreshing && "animate-spin"
                        } size-3 ml-2`}
                      />
                    </Badge>
                  </CardTitle>
                  <Dialog
                    open={showGalleryDialog}
                    onOpenChange={setShowGalleryDialog}
                  >
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-gallery-image">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Image
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      onOpenAutoFocus={() => {
                        setPreviewUrl("");
                        setFile(null);
                        galleryForm.reset();
                      }}
                    >
                      <div className="max-h-[80vh] overflow-y-auto pr-3">
                        <DialogHeader>
                          <DialogTitle>Add Gallery Image</DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            galleryForm.handleSubmit(handleSubmitGallery)(e);
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <Label htmlFor="title">Image Title</Label>
                            <Input
                              {...galleryForm.register("title")}
                              data-testid="input-gallery-title"
                            />
                          </div>
                          <div>
                            <Label htmlFor="imageUrl">
                              Image (URL or Upload)
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                {...galleryForm.register("imageUrl")}
                                placeholder="https://example.com/image.jpg"
                                data-testid="input-gallery-url"
                              />
                              <Input
                                type="file"
                                id="gallery-image-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  document
                                    .getElementById("gallery-image-upload")
                                    ?.click()
                                }
                              >
                                Upload
                              </Button>
                            </div>
                            {(previewUrl || galleryForm.watch("imageUrl")) && (
                              <div className="mt-2 space-y-2">
                                <div className="relative w-full rounded-lg overflow-hidden border">
                                  <img
                                    src={
                                      previewUrl ||
                                      galleryForm.watch("imageUrl")
                                    }
                                    alt="Gallery image preview"
                                    className="w-full object-contain"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => {
                                    setPreviewUrl("");
                                    setFile(null);
                                    galleryForm.setValue("imageUrl", "");
                                  }}
                                >
                                  Change Image
                                </Button>
                              </div>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                              value={galleryForm.watch("category")}
                              onValueChange={(value) =>
                                galleryForm.setValue("category", value as any)
                              }
                            >
                              <SelectTrigger data-testid="select-gallery-category">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="events">Events</SelectItem>
                                <SelectItem value="worship">Worship</SelectItem>
                                <SelectItem value="community">
                                  Community
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={resetGalleryDialog}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">
                              {loading ? "Adding Image..." : "Add Image"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className=" max-h-[400px] overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className="aspect-square rounded-lg"
                        />
                      ))
                    ) : galleryImages && galleryImages.length > 0 ? (
                      galleryImages.map((image) => (
                        <div
                          key={image._id}
                          className="relative group"
                          data-testid={`gallery-item-${image._id}`}
                        >
                          <img
                            src={
                              image?.image?.url ||
                              image?.imageUrl ||
                              "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/No-Image-Placeholder-landscape.svg/1280px-No-Image-Placeholder-landscape.svg.png"
                            }
                            alt={image.title}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <div className="text-white text-center">
                              <p className="font-medium">{image.title}</p>
                              <Badge className="mt-1 text-white">
                                {image.category}
                              </Badge>
                              {deleteLoading === image._id ? (
                                <LoaderCircle
                                  size={20}
                                  color="white"
                                  className=" top-2 right-2 h-6 w-6 aboslute mx-auto animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={20}
                                  color="white"
                                  className="absolute top-2 right-2 cursor-pointer"
                                  onClick={() => deleteImage(image._id)}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">
                          No gallery images yet. Add your first image!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pastors Tab */}
            <TabsContent value="pastors">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Pastors Management
                    <Badge
                      onClick={async () => {
                        setRefreshing(true);
                        setPastorsLoading(true);
                        await getPastors();
                        setPastorsLoading(false);
                        setRefreshing(false);
                      }}
                      className="ml-2 cursor-pointer hover:bg-accent hover:text-primary"
                    >
                      Refresh
                      <RefreshCwIcon
                        className={`${
                          refreshing && "animate-spin"
                        } size-3 ml-2`}
                      />
                    </Badge>
                  </CardTitle>
                  <Dialog
                    open={showPastorDialog}
                    onOpenChange={(open) => !open && resetPastorDialog()}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingPastor(null);
                          pastorForm.reset();
                          setShowPastorDialog(true);
                        }}
                        data-testid="button-add-pastor"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Pastor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <div className="max-h-[80vh] overflow-y-auto pr-3">
                        <DialogHeader>
                          <DialogTitle>
                            {editingPastor ? "Edit Pastor" : "Add New Pastor"}
                          </DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            pastorForm.handleSubmit(handleSubmitPastor)(e);
                          }}
                          className="space-y-4"
                        >
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Name</Label>
                              <Input {...pastorForm.register("name")} />
                            </div>
                            <div>
                              <Label htmlFor="title">Title</Label>
                              <Input {...pastorForm.register("title")} />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea {...pastorForm.register("bio")} />
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                type="email"
                                {...pastorForm.register("email")}
                              />
                            </div>
                            <div>
                              <Label htmlFor="imageUrl">
                                Image (URL or Upload)
                              </Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  {...pastorForm.register("imageUrl")}
                                  placeholder="https://example.com/pastor.jpg"
                                />
                                <Input
                                  type="file"
                                  id="pastor-image-upload"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    document
                                      .getElementById("pastor-image-upload")
                                      ?.click()
                                  }
                                >
                                  Upload
                                </Button>
                              </div>
                            </div>
                            {(previewUrl || pastorForm.watch("imageUrl")) && (
                              <div className="col-span-2 mt-4">
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                  <img
                                    src={
                                      previewUrl || pastorForm.watch("imageUrl")
                                    }
                                    alt="Pastor profile preview"
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={resetPastorDialog}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                              {loading ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  {editingPastor
                                    ? "Updating..."
                                    : "Creating..."}
                                </div>
                              ) : editingPastor ? (
                                "Update Pastor"
                              ) : (
                                "Add Pastor"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className=" max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Avatar</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastorsLoading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-40" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : pastors && pastors.length > 0 ? (
                        pastors.map((pastor) => (
                          <TableRow className="p-10" key={pastor._id}>
                            <img
                              src={
                                pastor.profileImg?.url ||
                                pastor?.imageUrl ||
                                "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80"
                              }
                              alt={pastor.name}
                              className="size-16  shadow-md rounded-full object-cover"
                            />

                            <TableCell className="font-medium">
                              {pastor.name}
                            </TableCell>
                            <TableCell>{pastor.title}</TableCell>
                            <TableCell>{pastor.email}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditPastor(pastor)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      {deleteLoading === pastor._id ? (
                                        <LoaderCircle
                                          size={20}
                                          color="white"
                                          className=" top-2 right-2 h-6 w-6 aboslute mx-auto animate-spin"
                                        />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Pastor
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete{" "}
                                        {pastor.name}?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deletePastor(pastor._id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            No pastors found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    Notifications
                    <Badge
                      onClick={async () => {
                        setRefreshing(true);

                        await getNotifications();

                        setRefreshing(false);
                      }}
                      className="ml-2 cursor-pointer hover:bg-accent hover:text-primary"
                    >
                      Refresh
                      <RefreshCwIcon
                        className={`${
                          refreshing && "animate-spin"
                        } size-3 ml-2`}
                      />
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    {notifications.filter((n) => n.archived).length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={UnArchiveNotifications}
                      >
                        {`Unarchive All (${
                          notifications.filter((n) => n.archived).length
                        })`}
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          {deleteLoading === "clear-all" ? (
                            <LoaderCircle
                              size={16}
                              color="white"
                              className="ml-2 animate-spin inline-block"
                            />
                          ) : (
                            "Clear All"
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete all notifications. This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={clearAllNotifications}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Clear All
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className=" max-h-[400px] overflow-y-auto">
                  <div className="space-y-4">
                    {notificationsLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-1/3" />
                          </div>
                        </div>
                      ))
                    ) : notifications.filter((n) => !n.read && !n.archived)
                        .length > 0 ? (
                      notifications
                        .filter((n) => !n.read && !n.archived)
                        .map((notification) => (
                          <div
                            key={notification._id}
                            className={`flex items-start gap-4 p-4 rounded-lg border ${
                              notification.read
                                ? "bg-muted/50"
                                : "bg-background"
                            }`}
                          >
                            <div className="flex-shrink-0 mt-1">
                              {notification.type === "donation" && (
                                <DollarSign className="h-5 w-5 text-green-500" />
                              )}
                              {notification.type === "event" && (
                                <Calendar className="h-5 w-5 text-blue-500" />
                              )}
                              {notification.type === "system" && (
                                <SettingsIcon className="h-5 w-5 text-gray-500" />
                              )}
                              {notification.type === "user" && (
                                <Users className="h-5 w-5 text-purple-500" />
                              )}
                              {notification.type === "sermon" && (
                                <PlayCircleIcon className="h-5 w-5 text-amber-500" />
                              )}
                              {notification.type === "gallery" && (
                                <ImageIcon className="h-5 w-5 text-pink-500" />
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-black">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {notification.description}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-purple-100 text-purple-600"
                                  >
                                    New
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground text-gray-400">
                                  {format(
                                    new Date(notification.createdAt),
                                    "MMM d, yyyy 'at' h:mm a"
                                  )}
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      archiveNotification(notification._id)
                                    }
                                    disabled={notification.read}
                                  >
                                    {notification.archived
                                      ? "Archived"
                                      : "Archive"}
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        {deleteLoading ? (
                                          <LoaderCircle
                                            size={16}
                                            color="white"
                                            className="ml-2 animate-spin inline-block"
                                          />
                                        ) : (
                                          "Delete"
                                        )}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete Notification?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently delete the
                                          notification titled "
                                          {notification.title}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            deleteNotification(notification._id)
                                          }
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Bell className="mx-auto h-10 w-10 mb-4" />
                        <h3 className="text-lg font-semibold">
                          No Notifications
                        </h3>
                        <p className="text-sm">You're all caught up!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <SettingsIcon className="mr-2 h-5 w-5" />
                    Website Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="general" orientation="vertical">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <TabsList className="flex flex-col h-full bg-transparent p-0">
                        <TabsTrigger
                          value="general"
                          className="justify-start w-full"
                        >
                          General
                        </TabsTrigger>
                        <TabsTrigger
                          value="social"
                          className="justify-start w-full"
                        >
                          Social Media
                        </TabsTrigger>
                        <TabsTrigger
                          value="streaming"
                          className="justify-start w-full"
                        >
                          Live Streaming
                        </TabsTrigger>
                        <TabsTrigger
                          value="donations"
                          className="justify-start w-full"
                        >
                          Donations
                        </TabsTrigger>
                        <TabsTrigger
                          value="email"
                          className="justify-start w-full"
                        >
                          Email
                        </TabsTrigger>
                        <TabsTrigger
                          value="system"
                          className="justify-start w-full"
                        >
                          System
                        </TabsTrigger>
                      </TabsList>
                      <div className="md:col-span-3">
                        {/* General Settings */}
                        <TabsContent value="general">
                          <Card>
                            <CardHeader>
                              <CardTitle>General Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold">
                                  Church Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="churchName">
                                      Church Name
                                    </Label>
                                    <Input
                                      id="churchName"
                                      placeholder="Enter church name"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="churchEmail">
                                      Contact Email
                                    </Label>
                                    <Input
                                      id="churchEmail"
                                      type="email"
                                      placeholder="contact@church.com"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="churchPhone">
                                      Phone Number
                                    </Label>
                                    <Input
                                      id="churchPhone"
                                      placeholder="+1 (555) 000-0000"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="churchAddress">
                                      Address
                                    </Label>
                                    <Input
                                      id="churchAddress"
                                      placeholder="Church address"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="churchDescription">
                                    About Church
                                  </Label>
                                  <Textarea
                                    id="churchDescription"
                                    placeholder="Enter a brief description about your church"
                                    className="min-h-[100px]"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Social Media Settings */}
                        <TabsContent value="social">
                          <Card>
                            <CardHeader>
                              <CardTitle>Social Media Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="facebookUrl">
                                    Facebook URL
                                  </Label>
                                  <Input
                                    id="facebookUrl"
                                    placeholder="https://facebook.com/..."
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="instagramUrl">
                                    Instagram URL
                                  </Label>
                                  <Input
                                    id="instagramUrl"
                                    placeholder="https://instagram.com/..."
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="youtubeUrl">
                                    YouTube Channel
                                  </Label>
                                  <Input
                                    id="youtubeUrl"
                                    placeholder="https://youtube.com/..."
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="twitterUrl">
                                    Twitter/X URL
                                  </Label>
                                  <Input
                                    id="twitterUrl"
                                    placeholder="https://twitter.com/..."
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Streaming Settings */}
                        <TabsContent value="streaming">
                          <Card>
                            <CardHeader>
                              <CardTitle>Live Streaming Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label htmlFor="streamingPlatform">
                                  Default Streaming Platform
                                </Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select platform" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="youtube">
                                      YouTube
                                    </SelectItem>
                                    <SelectItem value="facebook">
                                      Facebook Live
                                    </SelectItem>
                                    <SelectItem value="custom">
                                      Custom RTMP
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="defaultStreamUrl">
                                  Default Stream URL
                                </Label>
                                <Input
                                  id="defaultStreamUrl"
                                  placeholder="https://..."
                                />
                              </div>
                              <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                  <Label>Auto-publish Live Streams</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Automatically publish streams when they go
                                    live
                                  </p>
                                </div>
                                <Switch />
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Donation Settings */}
                        <TabsContent value="donations">
                          <Card>
                            <CardHeader>
                              <CardTitle>Donations Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label htmlFor="paymentProcessor">
                                  Payment Processor
                                </Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment processor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="stripe">
                                      Stripe
                                    </SelectItem>
                                    <SelectItem value="paypal">
                                      PayPal
                                    </SelectItem>
                                    <SelectItem value="square">
                                      Square
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="donationCategories">
                                  Donation Categories
                                </Label>
                                <Textarea
                                  id="donationCategories"
                                  placeholder="Enter donation categories (one per line)"
                                  className="min-h-[100px]"
                                />
                              </div>
                              <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                  <Label>Enable Recurring Donations</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Allow donors to set up recurring donations
                                  </p>
                                </div>
                                <Switch />
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Email Settings */}
                        <TabsContent value="email">
                          <Card>
                            <CardHeader>
                              <CardTitle>Email Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label htmlFor="emailService">
                                  Email Service
                                </Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select email service" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sendgrid">
                                      SendGrid
                                    </SelectItem>
                                    <SelectItem value="mailchimp">
                                      Mailchimp
                                    </SelectItem>
                                    <SelectItem value="smtp">
                                      Custom SMTP
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="senderEmail">
                                  Sender Email
                                </Label>
                                <Input
                                  id="senderEmail"
                                  type="email"
                                  placeholder="noreply@church.com"
                                />
                              </div>
                              <div>
                                <Label htmlFor="emailTemplate">
                                  Default Email Template
                                </Label>
                                <Textarea
                                  id="emailTemplate"
                                  placeholder="Enter default email template"
                                  className="min-h-[100px]"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* System settings */}
                        <TabsContent className="" value="system">
                          <Card className="max-h-[400px] overflow-y-auto">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <SettingsIcon className="w-5 h-5" />
                                System Settings
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-8">
                                {/* Notification Settings Group */}
                                <div className="space-y-6">
                                  <div className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-muted-foreground" />
                                    <h3 className="text-lg font-semibold">
                                      Notifications & Reminders
                                    </h3>
                                  </div>
                                  <div className="grid gap-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                                      <div className="space-y-0.5">
                                        <Label className="text-base">
                                          System Notifications
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                          Enable push notifications for
                                          important updates
                                        </p>
                                      </div>
                                      <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                                      <div className="space-y-0.5">
                                        <Label className="text-base">
                                          Event Reminders
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                          Automatic reminders for upcoming
                                          events
                                        </p>
                                      </div>
                                      <Switch defaultChecked />
                                    </div>
                                    <div className="p-4 rounded-lg border bg-card space-y-4">
                                      <div className="space-y-2">
                                        <Label
                                          htmlFor="reminderTime"
                                          className="text-base"
                                        >
                                          Default Reminder Settings
                                        </Label>
                                        <Select defaultValue="60">
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select when to send reminders" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="15">
                                              15 minutes before
                                            </SelectItem>
                                            <SelectItem value="30">
                                              30 minutes before
                                            </SelectItem>
                                            <SelectItem value="60">
                                              1 hour before
                                            </SelectItem>
                                            <SelectItem value="120">
                                              2 hours before
                                            </SelectItem>
                                            <SelectItem value="1440">
                                              1 day before
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex items-center space-x-2 pt-2">
                                        <Switch id="multiple-reminders" />
                                        <Label
                                          htmlFor="multiple-reminders"
                                          className="text-sm text-muted-foreground"
                                        >
                                          Allow multiple reminders per event
                                        </Label>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* System Configuration Group */}
                                <div className="space-y-6">
                                  <div className="flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-muted-foreground" />
                                    <h3 className="text-lg font-semibold">
                                      System Configuration
                                    </h3>
                                  </div>
                                  <div className="grid gap-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                                      <div className="space-y-0.5">
                                        <Label className="text-base">
                                          Maintenance Mode
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                          Temporarily disable public access
                                        </p>
                                      </div>
                                      <Switch />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                                      <div className="space-y-0.5">
                                        <Label className="text-base">
                                          System Cache
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                          Enable caching for better performance
                                        </p>
                                      </div>
                                      <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                                      <div className="space-y-0.5">
                                        <Label className="text-base">
                                          Debug Mode
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                          Show detailed error messages
                                        </p>
                                      </div>
                                      <Switch />
                                    </div>
                                    <div className="p-4 rounded-lg border bg-card space-y-3">
                                      <Label
                                        htmlFor="maxUploadSize"
                                        className="text-base"
                                      >
                                        Maximum Upload Size
                                      </Label>
                                      <div className="flex items-center space-x-2">
                                        <Input
                                          id="maxUploadSize"
                                          type="number"
                                          defaultValue={10}
                                          min={1}
                                          max={100}
                                          className="max-w-[120px]"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                          MB
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-6 border-t">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      if (
                                        confirm(
                                          "Are you sure you want to reset all settings to default?"
                                        )
                                      ) {
                                        toast({
                                          title: "Settings Reset",
                                          description:
                                            "All settings have been restored to default values.",
                                        });
                                      }
                                    }}
                                  >
                                    <span className="inline-flex items-center gap-2">
                                      Reset to Default
                                    </span>
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      toast({
                                        title: "Settings Saved",
                                        description:
                                          "Your system settings have been updated successfully.",
                                      });
                                    }}
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </div>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Other tabs would be implemented similarly... */}
          </Tabs>

          {/* Other tabs would be implemented similarly... */}
        </div>
      </section>
    </div>
  );
  // export default Admin;
}
const Admin = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return <LoginForm />;
  }

  return <AdminDashboard />;
};

export default Admin;
