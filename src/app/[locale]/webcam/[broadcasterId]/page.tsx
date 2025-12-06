"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { FaUser, FaCamera, FaShareAlt, FaImages, FaVolumeUp, FaExpand, FaGift } from "react-icons/fa";

// Sample/mock data
const broadcaster = {
  id: "1",
  name: "Vane",
  isLive: true,
  videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  preRecordedUrl: "https://www.w3schools.com/html/movie.mp4",
  bio: {
    realName: "VANE",
    followers: 1665304,
    iAm: "A Woman",
    interestedIn: "Women, Men, Couples, Trans",
    location: "IN YOUR HEART",
    lastBroadcast: "4 days ago",
    languages: "English, Français (French), Italiano (Italian)",
    bodyType: "naked",
    smokeDrink: "your mouth",
    bodyDecorations: "onlyfans/vanessavipx",
    social: [
      { name: "Telegram", url: "#", icon: "telegram" },
      { name: "OnlyFans", url: "#", icon: "onlyfans" },
      { name: "X", url: "#", icon: "x" },
    ],
    aboutMe: "register and surprise and you will be surprised click link",
    wishList: "https://www.amazon.com/hz/wishlist/ls/327H6T6MEPY4?ref_=wl_share",
  },
  pics: [
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  ],
  videos: [
    "https://www.w3schools.com/html/movie.mp4",
  ],
  shareLinks: [
    { label: "Share Cam", url: "#" },
    { label: "Embed Cam", url: "#" },
  ],
  usersOnline: [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Carlos" },
  ],
};

const TABS = ["Bio", "Pics & Videos", "Share", "More Rooms Like This"];

export default function BroadcasterVideoPage() {
  const params = useParams();
  const broadcasterId = params.broadcasterId as string;
  const locale = (params?.locale as string) || 'pt';
  const [tab, setTab] = useState("Bio");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chat, setChat] = useState([
    { user: "Alice", message: "Hi!" },
    { user: "Vane", message: "Welcome to my room!" },
  ]);
  const [message, setMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setChat([...chat, { user: "You", message }]);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
        {/* Video Player */}
        <div className="relative bg-black">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
            <video
              src={broadcaster.isLive ? broadcaster.videoUrl : broadcaster.preRecordedUrl}
              controls={false}
              autoPlay
              muted
              className={`absolute inset-0 w-full h-full object-contain ${isFullscreen ? "fixed inset-0 z-50 h-full w-full" : "rounded-t-lg"}`}
              style={{ background: "#000" }}
            />
            {/* Controls */}
            <div className={`absolute bottom-4 left-4 flex space-x-4 items-center ${isFullscreen ? "z-50" : ""}`}>
              <button className="bg-black/60 border border-white/20 hover:bg-red-600 hover:border-red-600 p-2 rounded-full text-white">
                <FaVolumeUp size={20} />
              </button>
              <button
                className="bg-black/60 border border-white/20 hover:bg-red-600 hover:border-red-600 p-2 rounded-full text-white"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <FaExpand size={20} />
              </button>
            </div>
          </div>
          {/* Overlay Chat in Fullscreen */}
          {isFullscreen && (
            <div className="absolute right-0 top-0 h-full w-1/3 bg-black/30 p-4 flex flex-col justify-end z-50">
              <div className="flex-1 overflow-y-auto space-y-2">
                {chat.map((c, i) => (
                  <div key={i} className="text-white text-sm">
                    <span className="font-bold text-red-400">{c.user}:</span> {c.message}
                  </div>
                ))}
              </div>
              <form onSubmit={handleSend} className="mt-2 flex">
                <input
                  className="flex-1 rounded-l bg-black/60 text-white px-2 py-1 border-none focus:ring-0"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button className="bg-red-600 px-4 py-1 rounded-r" type="submit">Send</button>
              </form>
            </div>
          )}
        </div>
        {/* Tabs */}
        <div className="bg-black px-4 pt-4 pb-2 flex space-x-4 border-b border-white/10">
          {TABS.map((t) => (
            <button
              key={t}
              className={`px-4 py-2 rounded-t font-semibold ${tab === t ? "bg-black text-red-600 border-t border-x border-white/10" : "text-white hover:text-red-600"}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        <div className="bg-black px-4 py-6 min-h-[200px] border-b border-white/10">
          {tab === "Bio" && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div><span className="font-bold">Real Name:</span> {broadcaster.bio.realName}</div>
                  <div><span className="font-bold">Followers:</span> {broadcaster.bio.followers}</div>
                  <div><span className="font-bold">I Am:</span> {broadcaster.bio.iAm}</div>
                  <div><span className="font-bold">Interested In:</span> {broadcaster.bio.interestedIn}</div>
                  <div><span className="font-bold">Location:</span> {broadcaster.bio.location}</div>
                  <div><span className="font-bold">Last Broadcast:</span> {broadcaster.bio.lastBroadcast}</div>
                  <div><span className="font-bold">Languages:</span> {broadcaster.bio.languages}</div>
                  <div><span className="font-bold">Body Type:</span> {broadcaster.bio.bodyType}</div>
                  <div><span className="font-bold">Smoke / Drink:</span> {broadcaster.bio.smokeDrink}</div>
                  <div><span className="font-bold">Body Decorations:</span> {broadcaster.bio.bodyDecorations}</div>
                </div>
                <div>
                  <div className="flex space-x-2 mb-2">
                    {broadcaster.bio.social.map((s, i) => (
                      <a key={i} href={s.url} className="inline-block p-2 rounded bg-black border border-white/20 hover:bg-red-600 hover:border-red-600">
                        {s.icon === "telegram" && <img src="/icons/telegram.svg" alt="Telegram" className="h-6 w-6" />}
                        {s.icon === "onlyfans" && <img src="/icons/onlyfans.svg" alt="OnlyFans" className="h-6 w-6" />}
                        {s.icon === "x" && <img src="/icons/x.svg" alt="X" className="h-6 w-6" />}
                      </a>
                    ))}
                  </div>
                  <div><span className="font-bold">About Me:</span> {broadcaster.bio.aboutMe}</div>
                  <div><span className="font-bold">Wish List:</span> <a href={broadcaster.bio.wishList} className="text-red-400 underline">Click here</a></div>
                </div>
              </div>
            </div>
          )}
          {tab === "Pics & Videos" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {broadcaster.pics.map((pic, i) => (
                <img key={i} src={pic} alt="pic" className="rounded-lg w-full h-32 object-cover" />
              ))}
              {broadcaster.videos.map((vid, i) => (
                <video key={i} src={vid} controls className="rounded-lg w-full h-32 object-cover" />
              ))}
            </div>
          )}
          {tab === "Share" && (
            <div className="space-y-2">
              {broadcaster.shareLinks.map((link, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <FaShareAlt />
                  <a href={link.url} className="text-red-400 underline">{link.label}</a>
                </div>
              ))}
            </div>
          )}
          {tab === "More Rooms Like This" && (
            <div className="text-gray-400">Coming soon...</div>
          )}
        </div>
      </div>
      {/* Sidebar */}
      <aside className="w-full lg:w-96 bg-black border-l border-white/10 flex flex-col">
        {/* Chat */}
        <div className="flex-1 flex flex-col p-4">
          <div className="font-bold text-lg mb-2">Live Chat</div>
          <div className="flex-1 overflow-y-auto space-y-2 mb-2">
            {chat.map((c, i) => (
              <div key={i} className="text-white text-sm">
                <span className="font-bold text-red-400">{c.user}:</span> {c.message}
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="flex">
            <input
              className="flex-1 rounded-l bg-black text-white px-2 py-1 border-none focus:ring-0"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button className="bg-red-600 px-4 py-1 rounded-r" type="submit">Send</button>
          </form>
        </div>
        {/* Private Messages & Users Online */}
        <div className="border-t border-white/10 p-4">
          <div className="font-bold mb-2 text-white">Users Online</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {broadcaster.usersOnline.map((u) => (
              <span key={u.id} className="bg-black border border-white/20 text-white px-2 py-1 rounded-full text-xs">{u.name}</span>
            ))}
          </div>
          <button className="w-full bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2 mb-2 hover:bg-red-700 transition">
            <FaGift /> Tip Creator
          </button>
          <button className="w-full bg-black border border-white/20 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-white/10 transition">
            Private Message
          </button>
        </div>
      </aside>
    </div>
  );
} 