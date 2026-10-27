/*
 * CareerAtlas AI — site configuration.
 * Everything works with the defaults below (no server, no cost).
 * Fill these in to switch on the optional pieces.
 */
window.CA_CONFIG = {
  // Name shown in the header
  appName: "CareerAtlas AI",
  eventName: "IEEE Young Professionals Summit",

  // Optional: URL of your deployed Cloudflare Worker (see worker/README.md).
  // Enables the AI Career Assistant chat and anonymous usage counters.
  // Example: "https://careeratlas-api.<your-subdomain>.workers.dev"
  apiBase: "",

  // Optional: published Google Sheet CSV of opt-in mentors.
  // Sheet > File > Share > Publish to web > (sheet) > CSV, paste the link here.
  mentorSheetCsv: "",

  // Optional: Google Form link where people can volunteer as mentors.
  mentorSignupUrl: "",

  // Shown in the footer
  privacyNote: "Your resume is analyzed in your browser and is not uploaded or stored."
};
