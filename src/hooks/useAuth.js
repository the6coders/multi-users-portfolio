import { useContext } from "react";
import { AuthContext } from "../../datacontext";

export function useAuth() {
  return useContext(AuthContext);
}
