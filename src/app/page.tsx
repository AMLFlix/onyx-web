export const runtime = 'edge';

import { LiveMatchCard } from '../components/LiveMatchCard';
import { UpcomingSection } from '../components/UpcomingSection';
import { HighlightCard } from '../components/HighlightCard';
import { BannerAd } from '../components/BannerAd';
import Link from 'next/link';

async function getHomePageData() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const secretKey = process.env.APP_SECRET_KEY;

  if (!baseUrl || !secretKey) return { live: [], upcoming: [], highlights: [], ads: [] };

  const headers = {
    'X-App-Key': secretKey,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Accept': 'application/json',
  };

  try {
    const [liveRes, upcomingRes, highlightsRes, adsRes] = await Promise.all([
      fetch(`${baseUrl}api/v1/matches?date=1`, { headers, next: { revalidate: 30 } }),
      fetch(`${baseUrl}api/v1/upcoming?page=1&limit=30`, { headers, next: { revalidate: 30 } }),
      fetch(`${baseUrl}api/v1/highlights`, { headers, next: { revalidate: 60 } }),
      fetch(`${baseUrl}api/v1/ads`, { headers, next: { revalidate: 60 } })
    ]);

    const [liveJson, upcomingJson, highlightsJson, adsJson] = await Promise.all([
      liveRes.ok ? liveRes.json() : { data: [] },
      upcomingRes.ok ? upcomingRes.json() : { data: [] },
      highlightsRes.ok ? highlightsRes.json() : { data: [] },
      adsRes.ok ? adsRes.json() : { data: [] }
    ]);

    return {
      live: Array.isArray(liveJson.data) ? liveJson.data.reverse() : [],
      upcoming: Array.isArray(upcomingJson.data) ? upcomingJson.data : [],
      highlights: Array.isArray(highlightsJson.data) ? highlightsJson.data.reverse() : [],
      ads: Array.isArray(adsJson.data) ? adsJson.data.reverse() : []
    };
  } catch (error) {
    return { live: [], upcoming: [], highlights: [], ads: [] };
  }
}

export default async function HomePage() {
  const { live, upcoming, highlights, ads } = await getHomePageData();

  const homeBanners = ads.filter((ad: any) => ad.position === 'home_banner' && ad.is_active === 1);

  return (
    <main className="min-h-screen bg-[#000000] text-white w-full overflow-x-hidden pb-10">
      
      <div className="flex justify-between items-center px-4 md:px-8 py-4">
        <h1 className="text-2xl font-black tracking-wider">
          ONY<span className="text-[#00E676]">X</span>
        </h1>
      </div>

      {homeBanners.length > 0 && (
        <div className="px-4 md:px-8 mb-6 mt-2">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4">
            {homeBanners.map((ad: any) => (
              <div key={ad.id} className="snap-center shrink-0 w-full md:w-[600px]">
                <BannerAd ad={ad} heightClass="h-[130px] md:h-[180px]"/>
              </div>
            ))}
          </div>
        </div>
      )}

      {live.length > 0 && (
        <section className="mb-6">
          <div className="flex justify-between items-center px-4 md:px-8 mb-3">
            <h2 className="text-base font-bold text-white">Live Matches</h2>
            <Link className="text-[11px] font-semibold text-[#00E676] cursor-pointer hover:underline" href="/live">
              See All
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 md:px-8 pb-4 scrollbar-none snap-x snap-mandatory">
            {live.map((match: any) => (
              <div key={match.match_id} className="snap-start shrink-0">
                <a href={`http://localhost:3001/match/${match.match_id}`} target="_blank" rel="noopener noreferrer" className="block">
                  <LiveMatchCard match={match}/>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-6">
          <div className="flex justify-between items-center px-4 md:px-8 mb-3">
            <h2 className="text-base font-bold text-white">Upcoming Matches</h2>
          </div>
          <UpcomingSection matches={upcoming}/>
        </section>
      )}

      {highlights.length > 0 && (
        <section className="mb-6">
          <div className="flex justify-between items-center px-4 md:px-8 mb-3">
            <h2 className="text-base font-bold text-white">Highlights & VODs</h2>
            <Link className="text-[11px] font-semibold text-[#00E676] cursor-pointer hover:underline" href="/highlights">
              See All
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 md:px-8 pb-4 scrollbar-none snap-x snap-mandatory">
            {highlights.map((match: any) => (
              <div key={match.match_id} className="snap-start shrink-0">
                <a href={`https://stream.onyx.com/match/${match.match_id}`} target="_blank" rel="noopener noreferrer" className="block">
                  <HighlightCard match={match}/>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}