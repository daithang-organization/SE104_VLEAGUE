export type AuthState = {
  accessToken: string | null;
};

export type AuthContextValue = AuthState & {
  login: (accessToken: string) => void;
  logout: () => void;
};
