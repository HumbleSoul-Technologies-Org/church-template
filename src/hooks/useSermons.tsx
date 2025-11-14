import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Configs } from "../lib/utils";

export const useSermons = () => {
  return useQuery({
    queryKey: ["sermons"],
    queryFn: async () => {
      const response = await axios.get(`${Configs.url}/api/sermons/all`);
      return response.data.sermons || [];
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export default useSermons;
