import { useUserFloorPlans } from "@/hooks/useFloorPlan";
import { useUserMoodboards } from "@/hooks/useMoodboard";
import { useUserThreeDModels } from "@/hooks/useThreeD";
import { AnimatePresence, motion } from "framer-motion";
import {
    Calendar,
    ChevronDown,
    Clock,
    Filter,
    Image as ImageIcon,
    Plus,
    Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../components/Layout/Topbar";

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent", icon: Clock },
  { value: "oldest", label: "Oldest First", icon: Calendar },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All Projects" },
  { value: "moodboard", label: "Moodboards" },
  { value: "floorplan", label: "Floor Plans" },
  { value: "threed", label: "3D Models" },
];

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterType, setFilterType] = useState("all");
  const [combinedProjects, setCombinedProjects] = useState([]);

  // Fetch data from server
  const { data: moodboardData, isLoading: moodboardsLoading } = useUserMoodboards(1, 100);
  const { data: floorPlanData, isLoading: floorPlansLoading } = useUserFloorPlans();
  const { data: threeDData, isLoading: threeDLoading } = useUserThreeDModels();

  useEffect(() => {
    // Process floor plans from server
    const floorPlans = (floorPlanData?.data || []).map(fp => ({
      id: fp._id,
      type: "floorplan",
      title: fp.name || "Untitled Floor Plan",
      createdAt: fp.createdAt,
      thumbnail: fp.thumbnail,
      status: fp.status,
      raw: fp
    }));

    // Process moodboards
    const moodboards = (moodboardData?.data?.moodboards || []).map(mb => ({
      id: mb._id,
      type: "moodboard",
      title: mb.title,
      createdAt: mb.createdAt,
      thumbnail: mb.compositeMoodboard?.url,
      status: mb.status,
      style: mb.style,
      roomType: mb.roomType,
      raw: mb
    }));

    // Process 3D models
    const threeDModels = (threeDData?.data || []).map(td => ({
        id: td._id,
        type: "threed",
        title: td.name || "3D Project",
        createdAt: td.createdAt,
        thumbnail: td.sourceImage || (td.versions?.[0]?.image?.url),
        status: td.status,
        style: td.versions?.[0]?.style,
        raw: td
    }));

    // Combine and sort
    const combined = [...floorPlans, ...moodboards, ...threeDModels].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortBy === "recent" ? dateB - dateA : dateA - dateB;
    });

    setCombinedProjects(combined);
  }, [moodboardData, floorPlanData, threeDData, sortBy]);

  const filteredProjects = combinedProjects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (p.style && p.style.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (p.roomType && p.roomType.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCardClick = (project) => {
    if (project.type === "moodboard") {
      navigate(`/moodboards/${project.id}`, { state: { project: project.raw } });
    } else if (project.type === "threed") {
      navigate("/visualizer", { state: { project: project.raw } });
    } else {
      navigate("/floorplans", { state: { project: project.raw } });
    }
  };

  return (
    <div className='min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] font-["Poppins"] selection:bg-[#8d775e]/10 overflow-x-hidden transition-colors duration-500'>
      <TopBar />

      <main className='relative z-10 max-w-[1600px] mx-auto px-4 md:px-12 pt-20 md:pt-32 pb-24'>
        {/* Header Section */}
        <div className='flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-4 md:mb-12'>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='space-y-4 md:space-y-6'
          >
            <div className='flex items-center gap-4'>
              <div className='w-12 h-[1px] bg-[#8d775e]'></div>
              <span className='text-[10px] font-bold tracking-[0.5em] text-[#8d775e] uppercase'>Synthesis Portfolio</span>
            </div>
            <h1 className='text-3xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tightest leading-[0.85]'>
              Your <br className="hidden md:block" />
              <span className='text-[#8d775e] font-serif italic'>Projects.</span>
            </h1>
            <p className='hidden md:block text-gray-400 dark:text-gray-500 font-medium text-lg max-w-xl leading-relaxed'>
              Manage and revisit your neural architectural visions. Everything you've synthesized in one central vault.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex gap-2'
          >
            <button 
              onClick={() => navigate("/floorplans")}
              className='flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white dark:bg-white/5 border border-[#e8e2dc] dark:border-white/10 rounded-full text-xs md:text-sm font-bold text-[#8d775e] hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm'
            >
              <Plus size={14} />
              Floor Plan
            </button>
            <button 
              onClick={() => navigate("/moodboard")}
              className='flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full text-xs md:text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-all shadow-xl'
            >
              <Plus size={14} />
              Moodboard
            </button>
          </motion.div>
        </div>

        {/* Controls Bar */}
        <div className="mb-6 md:mb-12 flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#8d775e] transition-colors" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-3 md:py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl md:rounded-[24px] focus:outline-none focus:ring-2 focus:ring-[#8d775e]/20 transition-all text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-2 md:gap-4">
            <div className="relative flex-1">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl md:rounded-[20px] pl-5 pr-10 py-2.5 md:py-4 text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8d775e]/20 cursor-pointer w-full"
              >
                {FILTER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl md:rounded-[20px] pl-5 pr-10 py-2.5 md:py-4 text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8d775e]/20 cursor-pointer w-full"
              >
                {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {moodboardsLoading || floorPlansLoading || threeDLoading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="flex md:flex-col gap-4 p-3 rounded-[24px] bg-white dark:bg-white/5 animate-pulse border border-gray-100 dark:border-white/10">
                <div className="w-24 h-24 md:w-full md:aspect-square rounded-xl bg-gray-200 dark:bg-white/10" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full py-24 text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No projects found</h3>
              <p className="text-gray-500">Try adjusting your filters or start a new project.</p>
            </div>
          ) : (
            filteredProjects.map((project, index) => (
              <motion.div
                key={project.id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: Math.min(index * 0.05, 0.3),
                  ease: [0.21, 0.47, 0.32, 0.98]
                }}
                onClick={() => handleCardClick(project)}
                className="group relative bg-white dark:bg-[#111] rounded-[24px] md:rounded-[32px] border border-gray-100 dark:border-white/5 overflow-hidden hover:border-[#8d775e]/40 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-[#8d775e]/10 flex flex-row md:flex-col p-3 md:p-0"
              >
                {/* Image Section */}
                <div className="w-24 h-24 md:w-full md:aspect-square shrink-0 overflow-hidden relative rounded-xl md:rounded-none">
                  {project.thumbnail ? (
                    <img 
                      src={project.thumbnail} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 md:w-12 md:h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity hidden md:block" />
                  
                  {/* Type Badge - Desktop only on image, Mobile in content or corner */}
                  <div className="absolute top-2 left-2 md:top-4 md:left-4">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                      project.type === "moodboard" 
                        ? "bg-[#8d775e]/20 text-[#8d775e] border-[#8d775e]/30" 
                        : project.type === "threed"
                        ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    }`}>
                      {project.type === "moodboard" ? "MB" : project.type === "threed" ? "3D" : "FP"}
                    </span>
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 pl-4 md:p-5 flex flex-col justify-center md:justify-start">
                  <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mb-1 md:mb-3 line-clamp-1 group-hover:text-[#8d775e] transition-colors">
                    {project.title}
                  </h3>
                  
                  <div className="flex items-center justify-between md:mt-auto md:pt-4 md:border-t border-gray-50 dark:border-white/5">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {project.status && (
                       <span className="hidden md:block text-[9px] font-bold text-[#8d775e] uppercase tracking-widest">{project.status}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Decorative background element */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[-10%] right-[-5%] w-[70%] h-[70%] rounded-full bg-[#8d775e]/5 dark:bg-[#8d775e]/10 blur-[140px]' />
        <div className='absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#b8a58c]/3 dark:bg-[#b8a58c]/5 blur-[120px]' />
      </div>
    </div>
  );
};

export default ProjectsPage;
