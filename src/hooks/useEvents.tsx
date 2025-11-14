import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Configs } from "../lib/utils";

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await axios.get(`${Configs.url}/api/events/all`);
      return response.data.events || [];
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export default useEvents;
