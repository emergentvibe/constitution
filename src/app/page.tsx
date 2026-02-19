import HomeClient from "./HomeClient";

// Fetch live data from registry API
async function getRegistryData() {
  try {
    // Fetch from our own API endpoint
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const [agentsRes, statsRes] = await Promise.all([
      fetch(`${baseUrl}/api/symbiont-hub/agents`, { 
        cache: 'no-store' // Always fresh
      }),
      fetch(`${baseUrl}/api/symbiont-hub/stats`, { 
        cache: 'no-store' 
      }),
    ]);

    const agentsData = await agentsRes.json();
    const statsData = await statsRes.json();

    return {
      signatories: agentsData.agents || [],
      stats: {
        total: statsData.agents?.total || 0,
        byTier: statsData.agents?.by_tier || {},
        constitutionVersion: statsData.constitution?.version || "0.1.5",
      },
    };
  } catch (error) {
    console.error('Failed to fetch registry data:', error);
    // Return empty state on error
    return {
      signatories: [],
      stats: {
        total: 0,
        byTier: {},
        constitutionVersion: "0.1.5",
      },
    };
  }
}

export default async function Home() {
  const data = await getRegistryData();
  return <HomeClient {...data} />;
}
