import { useState, useEffect, createContext, useContext } from 'react';
import { Configs } from '../lib/utils';
import axios from 'axios';
import { v4 as uuidv4 } from "uuid";
interface User {
  id: string;
  username: string;
  role: string;
}
interface Visitor {
  _id: string;
  visitorId: string;
  uuid: string;
  profileImage: { url: string; public_id: string };
  reminders: any[];
  banned: { status: boolean; reason: string };
  isVerified: boolean;
  email: string;
}

interface AuthContextType {
  user: User | null;
  visitor: Visitor | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshVisitor: () => Promise<void>; // Add ability to manually refresh visitor data
  visitorError: string | null; // Add error state for visitor operations
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider(): AuthContextType {
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  const createVisitorProfile = async (retryCount = 0): Promise<Visitor | null> => {
    const storedVisitorId = localStorage.getItem('visitor_id');
    try {
      setVisitorError(null);
      
      // Generate new UUID if no stored visitor ID exists
      const visitorUuid: string = storedVisitorId || uuidv4();
      const isNewVisitor = !storedVisitorId;

      // Try to create/retrieve visitor profile
      const response = await axios.post(`${Configs.url}/api/news-letter/new/visitor`, {
        uuid: visitorUuid
      });

      if (response.status === 201 || response.status === 200 && response.data.visitor) {
        // Store the visitor ID if it's new
        if (isNewVisitor) {
          localStorage.setItem('visitor_id', visitorUuid);
        }
        
        // Update visitor ID and visitor state
        setVisitorId(visitorUuid);
        
        console.log(isNewVisitor ? "New visitor created" : "Existing visitor retrieved");
        return response.data.visitor;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Error in visitor profile creation:', error);
      
      // Implement retry logic
      if (retryCount < MAX_RETRIES) {
        await delay(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
        return createVisitorProfile(retryCount + 1);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to create/retrieve visitor profile';
      setVisitorError(errorMessage);
      return null;
    }
  };

  const refreshVisitor = async () => {
    if (!visitorId) return;
    
    try {
      setVisitorError(null);
      const response = await axios.get(`${Configs.url}/api/news-letter/visitor/${visitorId}`);
      
      if (response.status === 200 && response.data.visitor) {
        setVisitor(response.data.visitor);
      } else {
        throw new Error('Failed to refresh visitor profile');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh visitor profile';
      setVisitorError(errorMessage);
      console.error('Error refreshing visitor profile:', error);
    }
  };
   
  

  const login = async (username: string, password: string): Promise<boolean> => {
    const key = import.meta.env.VITE_EKISUMULUZO || '';
    if (username === 'admin' && password === key) {
      const adminUser: User = {
        id: '1',
        username: 'admin',
        role: 'admin'
      };
      setUser(adminUser);
      localStorage.setItem('auth_user', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

    // Check for stored authentication on load
  useEffect(() => {
    let isActive = true;
    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    const initialize = async () => {
      // Load stored user
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser && isActive) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          localStorage.removeItem('auth_user');
        }
      }

      // Create or retrieve visitor profile
      await createVisitorProfile();
      if (isActive) {
        setIsLoading(false);
      }
    };

    initialize();

    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      if (visitorId) {
        refreshVisitor();
      }
    }, REFRESH_INTERVAL);

    // Cleanup function
    return () => {
      isActive = false;
      clearInterval(refreshInterval);
    };
  }, [visitorId]); // Add visitorId as dependency

  return {
    user,
    visitor,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    isLoading,
    refreshVisitor,
    visitorError
  };
}

export { AuthContext };