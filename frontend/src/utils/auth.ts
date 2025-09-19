const TOKEN_KEY = "auth_token";

export const storage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      console.error("Failed to store auth token");
    }
  },

  clearToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      console.error("Failed to clear auth token");
    }
  },

  isAuthenticated: (): boolean => {
    return !!storage.getToken();
  },
};
