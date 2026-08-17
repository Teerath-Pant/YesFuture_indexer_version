import { User } from "lucide-react";

interface ProfileHeaderProps {
  username: string;
  id: string | number;
  avatarUrl?: string;
}

export default function ProfileHeader({ username, id, avatarUrl }: ProfileHeaderProps) {
  return (
    <div className="text-center">
      {/* Gradient banner */}
      <div
        className="relative h-[220px] rounded-3xl overflow-hidden"
        style={{
          background:
            "linear-gradient(120deg, #f5a742 0%, #e879c4 22%, #f3e8ff 40%, #a855f7 55%, #6d28d9 75%, #1e88a8 100%)",
        }}
      >
        {/* soft wave overlay for depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 20% 80%, rgba(20,120,140,0.55), transparent 60%), radial-gradient(ellipse 50% 60% at 80% 20%, rgba(109,40,217,0.5), transparent 65%)",
          }}
        />

        {/* Avatar overlapping bottom edge */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-10">
          <div
            className="w-24 h-24 rounded-full p-1"
            style={{
              background: "linear-gradient(135deg, #f5a742, #e879c4, #a855f7)",
            }}
          >
            <div className="w-full h-full rounded-full bg-[#0e0e15] flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                  <User size={32} className="text-indigo-500" fill="currentColor" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Username + ID below banner */}
      <div className="mt-12 space-y-1">
        <h2 className="text-white text-xl font-bold">{username}</h2>
        <p className="text-gray-500 text-sm font-medium">ID {id}</p>
      </div>
    </div>
  );
}
