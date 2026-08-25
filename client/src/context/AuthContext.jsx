import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    try {
      const token =
        sessionStorage.getItem(
          "token"
        );

      const storedUser =
        sessionStorage.getItem(
          "user"
        );

      if (
        token &&
        storedUser
      ) {
        setUser(
          JSON.parse(
            storedUser
          )
        );
      }
    } catch (error) {
      console.error(
        "AUTH RESTORE ERROR:",
        error
      );

      sessionStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (
    token,
    userData
  ) => {
    sessionStorage.setItem(
      "token",
      token
    );

    sessionStorage.setItem(
      "user",
      JSON.stringify(
        userData
      )
    );

    setUser(userData);
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated:
          Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

export default AuthContext;