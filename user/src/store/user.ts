import { create } from "zustand";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
} | null;

type State = {
  isAuth: boolean;
  user: User;
  setUser: (user: User) => void;
  clearUser: () => void;
};

export const useUserStore = create<State>((set) => ({
  isAuth: true,
  user: null,

  setUser: (user) =>
    set({
      user,
      isAuth: true,
    }),

  clearUser: () =>
    set({
      user: null,
      isAuth: false,
    }),
}));