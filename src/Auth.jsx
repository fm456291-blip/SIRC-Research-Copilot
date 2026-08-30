import { useState } from "react";

const API_BASE_URL =
  "https://sirc-research-copilot-api.onrender.com";

export default function Auth({ setUser }) {

  const [isSignup, setIsSignup] =
    useState(false);

  const [authUsername, setAuthUsername] =
    useState("");

  const [authPassword, setAuthPassword] =
    useState("");

  const [authError, setAuthError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleAuthSubmit =
    async (e) => {

      e.preventDefault();

      if (loading) return;

      setAuthError("");
      setLoading(true);

      const endpoint =
        isSignup
          ? "/api/signup"
          : "/api/login";

      try {

        const response =
          await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json"
              },

              body: JSON.stringify({
                username:
                  authUsername.trim(),

                password:
                  authPassword
              })
            }
          );

        const rawResponse =
          await response.text();

        console.log(
          "AUTH STATUS:",
          response.status
        );

        console.log(
          "AUTH RESPONSE:",
          rawResponse
        );

        let data;

        try {

          data =
            JSON.parse(
              rawResponse
            );

        }

        catch (jsonError) {

          console.error(
            "SERVER RETURNED NON-JSON:",
            rawResponse
          );

          throw new Error(
            "Authentication server returned an invalid response. Please try again."
          );

        }

        if (!response.ok) {

          throw new Error(
            data?.error ||
            data?.message ||
            "Authentication failed."
          );

        }

        if (!data?.success) {

          throw new Error(
            data?.error ||
            "Authentication was unsuccessful."
          );

        }

        const userData = {

          id:
            data.userId,

          username:
            data.username ||
            authUsername.trim()

        };

        localStorage.setItem(
          "sirc_user",
          JSON.stringify(
            userData
          )
        );

        setUser(
          userData
        );

      }

      catch (error) {

        console.error(
          "AUTHENTICATION ERROR:",
          error
        );

        setAuthError(
          error.message ||
          "Unable to connect to authentication server."
        );

      }

      finally {

        setLoading(false);

      }

    };

  const switchMode =
    () => {

      if (loading) return;

      setIsSignup(
        (previous) =>
          !previous
      );

      setAuthError("");
      setAuthUsername("");
      setAuthPassword("");

    };

  return (

    <div
      style={{
        display:
          "flex",

        justifyContent:
          "center",

        alignItems:
          "center",

        minHeight:
          "100vh",

        background:
          "#0f172a",

        color:
          "#fff",

        fontFamily:
          "sans-serif",

        padding:
          "20px",

        boxSizing:
          "border-box"
      }}
    >

      <form
        onSubmit={
          handleAuthSubmit
        }

        style={{
          background:
            "#1e293b",

          padding:
            "40px",

          borderRadius:
            "12px",

          width:
            "350px",

          maxWidth:
            "100%",

          boxShadow:
            "0 4px 20px rgba(0,0,0,0.3)"
        }}
      >

        <div
          style={{
            textAlign:
              "center",

            marginBottom:
              "20px"
          }}
        >

          <h2
            style={{
              color:
                "#6366f1",

              margin:
                "0 0 5px 0"
            }}
          >
            SIRC
          </h2>

          <span
            style={{
              fontSize:
                "14px",

              color:
                "#94a3b8"
            }}
          >
            Research Copilot Login
          </span>

        </div>

        {authError && (

          <div
            style={{
              background:
                "#ef4444",

              color:
                "#fff",

              padding:
                "10px",

              borderRadius:
                "6px",

              fontSize:
                "13px",

              marginBottom:
                "15px",

              textAlign:
                "center",

              lineHeight:
                "1.4"
            }}
          >
            {authError}
          </div>

        )}

        <div
          style={{
            marginBottom:
              "15px"
          }}
        >

          <label
            style={{
              display:
                "block",

              fontSize:
                "13px",

              marginBottom:
                "5px",

              color:
                "#cbd5e1"
            }}
          >
            Username
          </label>

          <input
            type="text"
            required
            minLength={3}
            maxLength={50}
            placeholder="Enter username"
            value={authUsername}
            onChange={
              (e) =>
                setAuthUsername(
                  e.target.value
                )
            }
            disabled={loading}
            autoComplete={
              isSignup
                ? "username"
                : "username"
            }
            style={{
              width:
                "100%",

              padding:
                "10px",

              borderRadius:
                "6px",

              border:
                "1px solid #475569",

              background:
                "#0f172a",

              color:
                "#fff",

              boxSizing:
                "border-box",

              outline:
                "none"
            }}
          />

        </div>

        <div
          style={{
            marginBottom:
              "20px"
          }}
        >

          <label
            style={{
              display:
                "block",

              fontSize:
                "13px",

              marginBottom:
                "5px",

              color:
                "#cbd5e1"
            }}
          >
            Password
          </label>

          <input
            type="password"
            required
            minLength={6}
            placeholder="Enter password"
            value={authPassword}
            onChange={
              (e) =>
                setAuthPassword(
                  e.target.value
                )
            }
            disabled={loading}
            autoComplete={
              isSignup
                ? "new-password"
                : "current-password"
            }
            style={{
              width:
                "100%",

              padding:
                "10px",

              borderRadius:
                "6px",

              border:
                "1px solid #475569",

              background:
                "#0f172a",

              color:
                "#fff",

              boxSizing:
                "border-box",

              outline:
                "none"
            }}
          />

        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width:
              "100%",

            padding:
              "11px",

            background:
              loading
                ? "#4f46a5"
                : "#6366f1",

            color:
              "#fff",

            border:
              "none",

            borderRadius:
              "6px",

            cursor:
              loading
                ? "not-allowed"
                : "pointer",

            fontWeight:
              "bold",

            fontSize:
              "14px"
          }}
        >
          {loading
            ? "Please wait..."
            : isSignup
              ? "Sign Up"
              : "Login"}
        </button>

        <p
          onClick={
            switchMode
          }

          style={{
            marginTop:
              "20px",

            cursor:
              loading
                ? "default"
                : "pointer",

            fontSize:
              "13px",

            color:
              "#93c5fd",

            textAlign:
              "center"
          }}
        >
          {isSignup
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </p>

      </form>

    </div>

  );

}