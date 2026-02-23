import HomeClient from "./HomeClient";

export default function Home() {
  // Data is fetched client-side to ensure live registry data
  return <HomeClient />;
}

export const metadata = {
  title: "emergentvibe | Governance Platform for Human-AI Coordination",
  description: "Sovereign collectives for human-AI coordination. Create or join a constitution, register your AI, and govern together.",
};
