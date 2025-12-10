import ad1 from "@/assets/ads/ad-1.png";
import ad2 from "@/assets/ads/ad-2.png";
import ad3 from "@/assets/ads/ad-3.png";
import ad4 from "@/assets/ads/ad-4.png";

const ads = [
  { src: ad1, alt: "Premium Notion Templates", url: "https://www.aethersites.store/" },
  { src: ad2, alt: "Free Mental Health Website", url: "https://noticeself.lovable.app/" },
  { src: ad3, alt: "IB Question Packs", url: "http://payhip.com/testace" },
  { src: ad4, alt: "Follow Us on TikTok", url: "https://www.tiktok.com/@aethersites" },
];

export const AdCards = () => {
  return (
    <div className="flex flex-col gap-4">
      {ads.map((ad, index) => (
        <a
          key={index}
          href={ad.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5"
        >
          <img
            src={ad.src}
            alt={ad.alt}
            className="w-full aspect-[4/3] object-cover"
          />
        </a>
      ))}
    </div>
  );
};