export type User = {
  id: string;
  email: string;
  role: string;
  name?: string | null;
};

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  isAuthed: boolean;
};

export type AuthContextValue = AuthState & {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  applyOAuthTokens: (accessToken: string, refreshToken: string) => void;
};
