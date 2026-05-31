import { useState } from "react";

export function usePreferences() {
  const [pageSize, setPageSize] = useState(10);
  return { pageSize, setPageSize };
}
