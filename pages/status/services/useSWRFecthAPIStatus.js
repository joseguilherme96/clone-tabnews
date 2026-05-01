import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = response.json();

  return responseBody;
}

function useSWRFecthAPIStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  return { isLoading, data };
}

export default useSWRFecthAPIStatus;
