import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Send } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import Axios from "axios";
import { Configs } from "../lib/utils";
import { v4 as uuidv4 } from "uuid";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      setIsSubscribing(false);
      return;
    }

    try {
      // Get or create UUID
      let uuid = localStorage.getItem("visitor_id");
      if (!uuid) {
        uuid = uuidv4();
        localStorage.setItem("visitor_id", uuid);
      }

      // Send request
      const Res = await Axios.post(
        `${Configs.url}/api/news-letter/register`,
        { email, uuid },
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      // Handle response
      if (Res.status === 201) {
        toast({
          title: "Successfully Subscribed!",
          description:
            "Please check your email for a verification link to verify your email.",
        });
        setEmail("");
      }
    } catch (error: any) {
      toast({
        title: "Subscription Error!",
        description: `Error: ${
          error.response?.data?.message ||
          "Failed to register email, try again!"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
        <h2
          style={{ fontFamily: "Dancing Script" }}
          className="text-4xl font-bold mb-4"
          data-testid="newsletter-title"
        >
          Stay Connected
        </h2>
        <p
          className="text-xl mb-8 opacity-90"
          data-testid="newsletter-description"
        >
          Get weekly encouragement, event updates, and prayer requests delivered
          to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow text-foreground bg-card border border-border focus:ring-2 focus:ring-accent"
              data-testid="input-newsletter-email"
            />
            <Button
              type="submit"
              disabled={isSubscribing}
              className="bg-accent text-accent-foreground hover:opacity-90 flex items-center px-6"
              data-testid="button-newsletter-subscribe"
            >
              <span>{isSubscribing ? "Subscribing..." : "Subscribe"}</span>
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>

        <p className="text-sm opacity-75 mt-4" data-testid="newsletter-privacy">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
