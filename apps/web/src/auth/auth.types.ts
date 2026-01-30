export type User = {
  id: string;
  email: string;
  role: string;
};

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  isAuthed: boolean;
};

export type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
