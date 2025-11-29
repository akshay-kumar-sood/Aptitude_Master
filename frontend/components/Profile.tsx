
import React, { useRef, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import Heatmap from './Heatmap';
import Badges from './Badges';
import { Camera, Edit2, Save, Trophy, Flame, Target, Linkedin, Instagram, Link as LinkIcon, Award, Github, Lock } from 'lucide-react';

const Profile: React.FC = () => {
  const { progress, streak, updateProfile } = useProgress();
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  
  // Temp state for editing
  const [tempName, setTempName] = useState(progress.profileName);
  const [tempBio, setTempBio] = useState(progress.profileBio);
  const [tempLinks, setTempLinks] = useState(progress.socialLinks);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate Mock Rank (Total Users mock - Solved * 3)
  const totalUsers = 1240;
  // Rank gets better (lower) as you solve more
  const rank = Math.max(1, totalUsers - (progress.totalSolved * 3));

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-16 text-center flex flex-col items-center">
              <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 ring-1 ring-gray-100">
                  <Lock className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Profile Restricted</h2>
              <p className="text-gray-500 mb-8 max-w-md text-lg leading-relaxed">
                  Join Aptitude Master to track your daily streaks, earn badges, and compete on the global leaderboard.
              </p>
              <div className="flex gap-4">
                <button 
                    onClick={() => setAuthModalOpen(true)}
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-blue-200"
                >
                    Login / Sign Up
                </button>
              </div>
          </div>
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
      </div>
    );
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateProfile(progress.profileName, base64String, progress.profileBio, progress.socialLinks);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
      if (tempName.trim()) {
          updateProfile(tempName, progress.profileImage, tempBio, tempLinks);
          setIsEditing(false);
      }
  };

  // Helper to force https:// if missing
  const ensureProtocol = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
      }
      return `https://${url}`;
  };

  const CircularProgress = ({ value, total, color, label }: { value: number, total: number, color: string, label: string }) => {
      const percentage = progress.totalSolved === 0 ? 0 : (value / progress.totalSolved) * 100;
      
      return (
        <div className="flex flex-col items-center">
            <div className="relative h-20 w-20">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                    <path
                        className="text-gray-200"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    <path
                        className={color}
                        strokeDasharray={`${percentage}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm font-bold text-gray-800">{value}</span>
                </div>
            </div>
            <span className="mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        </div>
      );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header Card - Dark Theme with White text area inside */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
         
         {/* Top Dark Section containing Profile Info */}
         <div className="bg-zinc-900 p-8 md:p-12 relative">
             <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                 
                 {/* Profile Image - Larger */}
                 <div className="relative group shrink-0">
                     <div className="h-48 w-48 rounded-full border-4 border-zinc-700 bg-zinc-800 shadow-2xl overflow-hidden flex items-center justify-center">
                         {progress.profileImage ? (
                             <img src={progress.profileImage} alt="Profile" className="h-full w-full object-cover" />
                         ) : (
                             <div className="text-6xl font-bold text-gray-500">
                                 {progress.profileName.charAt(0).toUpperCase()}
                             </div>
                         )}
                     </div>
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-3 right-3 p-3 bg-white text-black rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                     >
                         <Camera className="h-5 w-5" />
                     </button>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                     />
                 </div>

                 {/* Text Info (Inside Dark Background) */}
                 <div className="flex-1 w-full text-center md:text-left">
                     {isEditing ? (
                         <div className="space-y-4 bg-zinc-800 p-6 rounded-2xl border border-zinc-700 shadow-xl max-w-2xl mx-auto md:mx-0">
                             <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase">Display Name</label>
                                <input 
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="w-full text-xl font-bold text-white border-b border-zinc-600 outline-none bg-transparent py-1 focus:border-yellow-500"
                                    placeholder="Your Name"
                                />
                             </div>
                             <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase">Bio</label>
                                <textarea 
                                    value={tempBio}
                                    onChange={(e) => setTempBio(e.target.value)}
                                    className="w-full text-sm text-gray-300 border-b border-zinc-600 outline-none bg-transparent py-1 resize-none focus:border-yellow-500"
                                    rows={2}
                                    placeholder="Tell us about yourself..."
                                />
                             </div>
                             <div className="grid grid-cols-1 gap-3">
                                 <input 
                                     value={tempLinks.linkedin}
                                     onChange={(e) => setTempLinks({...tempLinks, linkedin: e.target.value})}
                                     className="text-xs bg-zinc-900 text-white border border-zinc-700 rounded px-3 py-2 placeholder-zinc-500"
                                     placeholder="LinkedIn URL"
                                 />
                                 <input 
                                     value={tempLinks.github}
                                     onChange={(e) => setTempLinks({...tempLinks, github: e.target.value})}
                                     className="text-xs bg-zinc-900 text-white border border-zinc-700 rounded px-3 py-2 placeholder-zinc-500"
                                     placeholder="GitHub URL"
                                 />
                                 <input 
                                     value={tempLinks.instagram}
                                     onChange={(e) => setTempLinks({...tempLinks, instagram: e.target.value})}
                                     className="text-xs bg-zinc-900 text-white border border-zinc-700 rounded px-3 py-2 placeholder-zinc-500"
                                     placeholder="Instagram URL"
                                 />
                             </div>
                             <div className="flex justify-end pt-2">
                                <button onClick={handleSave} className="px-5 py-2 bg-yellow-500 text-black rounded-lg text-sm font-bold hover:bg-yellow-400 flex items-center gap-2">
                                    <Save className="h-4 w-4" /> Save Profile
                                </button>
                             </div>
                         </div>
                     ) : (
                         <div className="group">
                            <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{progress.profileName}</h1>
                                <button onClick={() => setIsEditing(true)} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                            </div>
                            
                            <p className="text-zinc-300 text-lg mb-6 max-w-2xl leading-relaxed mx-auto md:mx-0">{progress.profileBio || "No bio added yet."}</p>
                            
                            {/* Visible Social Links */}
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                {progress.socialLinks.linkedin && (
                                    <a href={ensureProtocol(progress.socialLinks.linkedin)} target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-800 rounded-xl hover:bg-[#0077b5] text-white transition-all shadow-md hover:-translate-y-1">
                                        <Linkedin className="h-5 w-5" />
                                    </a>
                                )}
                                {progress.socialLinks.github && (
                                    <a href={ensureProtocol(progress.socialLinks.github)} target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-800 rounded-xl hover:bg-white hover:text-black text-white transition-all shadow-md hover:-translate-y-1">
                                        <Github className="h-5 w-5" />
                                    </a>
                                )}
                                {progress.socialLinks.instagram && (
                                    <a href={ensureProtocol(progress.socialLinks.instagram)} target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-800 rounded-xl hover:bg-pink-600 text-white transition-all shadow-md hover:-translate-y-1">
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                )}
                                {(!progress.socialLinks.linkedin && !progress.socialLinks.instagram && !progress.socialLinks.github) && (
                                    <span className="text-sm text-zinc-500 italic flex items-center gap-1 border border-zinc-800 px-4 py-1.5 rounded-full">
                                        <LinkIcon className="h-3 w-3" /> Click edit to add social links
                                    </span>
                                )}
                            </div>
                         </div>
                     )}
                 </div>
                 
                 {/* Rank Badge - Floating or positioned */}
                 {!isEditing && (
                    <div className="hidden md:flex flex-col items-end gap-1 absolute top-12 right-12">
                        <div className="flex items-center gap-3 bg-zinc-800/80 backdrop-blur-sm px-5 py-3 rounded-2xl border border-zinc-700 shadow-xl">
                            <Award className="h-8 w-8 text-yellow-500" />
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Global Rank</div>
                                <div className="text-2xl font-black text-white leading-none">#{rank}</div>
                            </div>
                        </div>
                    </div>
                 )}
                 {/* Mobile Rank Badge */}
                 {!isEditing && (
                    <div className="md:hidden mt-6 flex items-center justify-center gap-3 bg-zinc-800/80 backdrop-blur-sm px-5 py-3 rounded-xl border border-zinc-700 w-full max-w-xs mx-auto">
                        <Award className="h-6 w-6 text-yellow-500" />
                        <div className="text-left">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Global Rank</div>
                            <div className="text-xl font-black text-white leading-none">#{rank}</div>
                        </div>
                    </div>
                 )}
             </div>
         </div>

         {/* Stats Row - White Background */}
         <div className="bg-white p-6 md:p-8">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 p-5 rounded-2xl flex items-center gap-4 border border-orange-100 transition-transform hover:-translate-y-1">
                    <div className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-orange-100"><Flame className="h-6 w-6 text-orange-500" /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{streak}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Streak</div>
                    </div>
                </div>
                <div className="bg-yellow-50 p-5 rounded-2xl flex items-center gap-4 border border-yellow-100 transition-transform hover:-translate-y-1">
                    <div className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-yellow-100"><Trophy className="h-6 w-6 text-yellow-500" /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{progress.maxStreak}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Best Streak</div>
                    </div>
                </div>
                <div className="bg-blue-50 p-5 rounded-2xl flex items-center gap-4 border border-blue-100 transition-transform hover:-translate-y-1">
                    <div className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-blue-100"><Target className="h-6 w-6 text-blue-500" /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{progress.points}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Paisa</div>
                    </div>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl flex items-center gap-4 border border-gray-100 transition-transform hover:-translate-y-1">
                    <div className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-gray-200"><Trophy className="h-6 w-6 text-gray-700" /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{progress.totalSolved}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Solved</div>
                    </div>
                </div>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Difficulty Chart */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Target className="h-5 w-5 text-gray-400" /> Problem Statistics
                </h3>
                
                <div className="flex justify-between items-end px-2 mb-8">
                     <CircularProgress 
                        value={progress.easySolved} 
                        total={progress.totalSolved} 
                        color="text-green-500" 
                        label="Easy" 
                     />
                     <CircularProgress 
                        value={progress.mediumSolved} 
                        total={progress.totalSolved} 
                        color="text-yellow-500" 
                        label="Medium" 
                     />
                     <CircularProgress 
                        value={progress.hardSolved} 
                        total={progress.totalSolved} 
                        color="text-red-500" 
                        label="Hard" 
                     />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-gray-500">Total Solved</span>
                        <span className="font-bold text-gray-900">{progress.totalSolved}</span>
                    </div>
                     <div className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-gray-500">Global Rank</span>
                        <span className="font-bold text-gray-900">#{rank}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Col: Heatmap & Badges */}
        <div className="lg:col-span-2 space-y-6">
            {/* Heatmap */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Flame className="h-5 w-5 text-gray-400" /> Consistency
                    </h3>
                    <div className="text-xs text-gray-400">Last 12 Months</div>
                </div>
                <Heatmap />
            </div>

            {/* Badges */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-gray-400" /> Earned Badges
                </h3>
                <Badges />
            </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;
