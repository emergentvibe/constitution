import HomeClient from "./HomeClient";

export default function Home() {
  // Data is fetched client-side to ensure live registry data
  return <HomeClient />;
}

export const metadata = {
  title: "The Constitution for Human-AI Coordination | emergentvibe",
  description: "27 principles for democratic AI governance. Join the constitutional network for human-AI coordination.",
};
