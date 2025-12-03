const GOOGLE_OAUTH_ROOT = "https://accounts.google.com/o/oauth2/v2/auth";

export function getGoogleOAuthURL() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.warn("Google OAuth env vars are missing. Please set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_REDIRECT_URI.");
    return GOOGLE_OAUTH_ROOT;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: ["openid", "email", "profile", "https://www.googleapis.com/auth/calendar.readonly"].join(" "),
  });

  return `${GOOGLE_OAUTH_ROOT}?${params.toString()}`;
}

