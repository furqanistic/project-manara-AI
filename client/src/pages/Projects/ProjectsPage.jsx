import { Badge } from "@/components/ui/badge";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { useDeleteFloorPlan, useUpdateFloorPlan, useUserFloorPlans } from "@/hooks/useFloorPlan";
import { useDeleteMoodboard, useUpdateMoodboard, useUserMoodboards } from "@/hooks/useMoodboard";
import { useDeleteThreeDModel, useUpdateThreeDModel, useUserThreeDModels } from "@/hooks/useThreeD";
import { AnimatePresence, motion } from "framer-motion";
import {
 AlertCircle,
 ArrowRight,
 Box,
 Calendar,
 ChevronDown,
 ChevronLeft,
 ChevronRight,
 Clock,
 Edit2,
 Filter,
 Image as ImageIcon,
 Layers,
 LayoutGrid,
 Loader2,
 Image as MoodboardIcon,
 Package,
 Search,
 Sparkles,
 Trash2
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../components/Layout/Topbar";

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest First" },
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // Fetch data from server
  const { data: moodboardData, isLoading: moodboardsLoading } = useUserMoodboards(1, 100);
  const { data: floorPlanData, isLoading: floorPlansLoading } = useUserFloorPlans();
  const { data: threeDData, isLoading: threeDLoading } = useUserThreeDModels();

  // Mutations
  const deleteMoodboard = useDeleteMoodboard();
  const deleteFloorPlan = useDeleteFloorPlan();
  const deleteThreeDModel = useDeleteThreeDModel();
  
  const updateMoodboard = useUpdateMoodboard();
  const updateFloorPlan = useUpdateFloorPlan();
  const updateThreeDModel = useUpdateThreeDModel();

  // Helper to clean titles
  const cleanTitle = (title) => {
    if (!title) return "";
    return title.replace(/\s-\s\d{1,2}\/\d{1,2}\/\d{4}.*$/, "");
  };

  const combinedProjects = useMemo(() => {
    const floorPlans = (floorPlanData?.data || []).map(fp => ({
      id: fp._id,
      type: "floorplan",
      title: cleanTitle(fp.name) || "Untitled Floor Plan",
      createdAt: fp.createdAt,
      thumbnail: fp.thumbnail,
      status: fp.status,
      raw: fp
    }));

    const moodboards = (moodboardData?.data?.moodboards || []).map(mb => ({
      id: mb._id,
      type: "moodboard",
      title: cleanTitle(mb.title) || "Untitled Moodboard",
      createdAt: mb.createdAt,
      thumbnail: mb.compositeMoodboard?.url,
      status: mb.status,
      style: mb.style,
      roomType: mb.roomType,
      raw: mb
    }));

    const threeDModels = (threeDData?.data || []).map(td => ({
        id: td._id,
        type: "threed",
        title: cleanTitle(td.name) || "3D Project",
        createdAt: td.createdAt,
        thumbnail: td.sourceImage || (td.versions?.[0]?.image?.url),
        status: td.status,
        style: td.versions?.[0]?.style,
        isInteractive: td.glbUrl && td.meshyStatus === 'succeeded',
        raw: td
    }));

    return [...floorPlans, ...moodboards, ...threeDModels].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortBy === "recent" ? dateB - dateA : dateA - dateB;
    });
  }, [moodboardData, floorPlanData, threeDData, sortBy]);

  const filteredProjects = useMemo(() => {
    return combinedProjects.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (p.style && p.style.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (p.roomType && p.roomType.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === "all" || p.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [combinedProjects, searchQuery, filterType]);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats data
  const stats = useMemo(() => {
    const total = combinedProjects.length;
    const mb = combinedProjects.filter(p => p.type === 'moodboard').length;
    const fp = combinedProjects.filter(p => p.type === 'floorplan').length;
    const td = combinedProjects.filter(p => p.type === 'threed').length;
    return [
      { label: "Total", count: total, icon: Package, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-white/5" },
      { label: "Moodboards", count: mb, icon: MoodboardIcon, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10" },
      { label: "Floor Plans", count: fp, icon: Layers, color: "text-[#8d775e] dark:text-[#a68d71]", bg: "bg-[#8d775e]/5 dark:bg-[#8d775e]/10" },
      { label: "3D Models", count: td, icon: Box, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
    ];
  }, [combinedProjects]);

  const handleCardClick = (project) => {
    if (project.type === "moodboard") {
      navigate(`/moodboards/${project.id}`, { state: { project: project.raw } });
    } else if (project.type === "threed") {
      navigate("/visualizer", { state: { project: project.raw } });
    } else {
      navigate("/floorplans", { state: { project: project.raw } });
    }
  };

  const handleDeleteClick = (e, project) => {
    e.stopPropagation();
    setDeleteId(project.id);
    setDeleteType(project.type);
  };

  const handleEditClick = (e, project) => {
    e.stopPropagation();
    setEditProject(project);
    setEditTitle(project.title);
  };

  const handleUpdateProject = async () => {
    if (!editProject || !editTitle.trim()) return;

    try {
      if (editProject.type === "moodboard") {
        await updateMoodboard.mutateAsync({ 
          id: editProject.id, 
          title: editTitle 
        });
      } else if (editProject.type === "floorplan") {
        await updateFloorPlan.mutateAsync({ 
          id: editProject.id, 
          data: { name: editTitle } 
        });
      } else if (editProject.type === "threed") {
        await updateThreeDModel.mutateAsync({ 
          id: editProject.id, 
          data: { name: editTitle } 
        });
      }
      setEditProject(null);
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId || !deleteType) return;

    try {
      if (deleteType === "moodboard") {
        await deleteMoodboard.mutateAsync(deleteId);
      } else if (deleteType === "floorplan") {
        await deleteFloorPlan.mutateAsync(deleteId);
      } else if (deleteType === "threed") {
        await deleteThreeDModel.mutateAsync(deleteId);
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    } finally {
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Loading state for mutations
  const isDeleting = deleteMoodboard.isPending || deleteFloorPlan.isPending || deleteThreeDModel.isPending;
  const isUpdating = updateMoodboard.isPending || updateFloorPlan.isPending || updateThreeDModel.isPending;

  return (
    <div className='min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] font-["Poppins"] selection:bg-[#8d775e]/10'>
      <TopBar />

      <main className='max-w-[1800px] mx-auto px-6 md:px-12 pt-28 pb-12'>
        
        {/* Background Ambiance */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <motion.div 
              animate={{ 
                x: [0, 50, 0],
                y: [0, 30, 0],
                opacity: [0.03, 0.05, 0.03]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#8d775e] rounded-full blur-[120px]" 
            />
            <motion.div 
              animate={{ 
                x: [0, -40, 0],
                y: [0, -20, 0],
                opacity: [0.02, 0.04, 0.02]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[-15%] left-[-10%] w-[900px] h-[900px] bg-blue-500 rounded-full blur-[150px]" 
            />
        </div>

        {/* Header Section */}
        <div className="flex flex-col gap-8 mb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex flex-col gap-6 max-w-2xl">
                    <motion.h1 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight"
                    >
                      Your <span className="text-[#8d775e]">Portfolio</span>
                    </motion.h1>
                    
                    {/* Stats Chips - Fixed Grid for Mobile to avoid scrolling */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3"
                    >
                        {stats.map((stat, i) => (
                           <div key={i} className={`flex items-center gap-3 px-4 py-3 md:px-5 md:py-2.5 rounded-2xl ${stat.bg} ${stat.color} border border-transparent dark:border-white/5 shadow-sm backdrop-blur-md transition-all hover:scale-105 cursor-default`}>
                              <stat.icon className="w-4 h-4 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-0.5 truncate">{stat.label}</span>
                                <span className="text-sm font-black leading-none">{stat.count}</span>
                              </div>
                           </div>
                        ))}
                    </motion.div>
                </div>

                <div className="flex flex-col gap-4 w-full md:w-auto">
                    {/* Desktop: Row Layout for Controls */}
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Search */}
                        <div className="relative group w-full md:w-[280px] lg:w-[320px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#8d775e] transition-colors" />
                            <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full !h-[56px] !md:h-[46px] pl-11 pr-4 bg-white dark:bg-[#151515] text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-white/10 rounded-2xl md:rounded-xl text-base md:text-sm font-medium focus:outline-none focus:border-[#8d775e] transition-all shadow-sm focus:shadow-md"
                            />
                        </div>

                        {/* Filters Container */}
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="flex-1 md:flex-none">
                                <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="!h-[56px] !md:h-[46px] w-full md:min-w-[140px] rounded-2xl md:rounded-xl bg-white dark:bg-[#151515] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white shadow-sm">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a]">
                                    {FILTER_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg focus:bg-gray-100 dark:focus:bg-white/10 cursor-pointer">
                                        {opt.label}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1 md:flex-none">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="!h-[56px] !md:h-[46px] w-full md:min-w-[140px] rounded-2xl md:rounded-xl bg-white dark:bg-[#151515] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white shadow-sm">
                                    <SelectValue placeholder="Sort" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a]">
                                    {SORT_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg focus:bg-gray-100 dark:focus:bg-white/10 cursor-pointer">
                                        {opt.label}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* Content Area */}
        {moodboardsLoading || floorPlansLoading || threeDLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8">
                {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                    <div className="aspect-[4/3] rounded-[32px] bg-gray-100 dark:bg-[#151515] animate-pulse" />
                    <div className="h-4 w-2/3 bg-gray-100 dark:bg-[#151515] rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-gray-100 dark:bg-[#151515] rounded animate-pulse" />
                </div>
                ))}
            </div>
        ) : filteredProjects.length === 0 ? (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="flex flex-col items-center justify-center py-32 text-center bg-white/40 dark:bg-[#151515]/40 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[40px] backdrop-blur-xl"
           >
             <div className="w-24 h-24 bg-gray-100/50 dark:bg-white/5 rounded-full flex items-center justify-center mb-8 shadow-inner">
               <Sparkles className="w-12 h-12 text-[#8d775e]/40 dark:text-gray-600" />
             </div>
             <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Gallery Awaits</h3>
             <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium leading-relaxed">
                Your creative journey is just beginning. Start crafting your first moodboard or model to see it here!
             </p>
           </motion.div>
        ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8">
                {paginatedProjects.map((project, index) => (
              <motion.div
                key={project.id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03, ease: "easeOut" }}
                onClick={() => handleCardClick(project)}
                className="group cursor-pointer"
              >
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white dark:bg-[#151515] border border-gray-100 dark:border-white/5 transition-all duration-500 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] group-hover:-translate-y-1.5">
                    {project.thumbnail ? (
                        <img 
                        src={project.thumbnail} 
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-200 dark:text-gray-800" />
                        </div>
                    )}
                    
                    {/* Glass Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                    {/* Interactive Badge (Top Left) */}
                    {project.isInteractive && (
                        <div className="absolute top-5 left-5 z-10">
                            <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] bg-white/90 dark:bg-black/80 text-gray-900 dark:text-white backdrop-blur-xl shadow-lg border border-white/10">
                            Interactive
                            </span>
                        </div>
                    )}

                    {/* Delete Icon Overlay */}
                    <div className="absolute top-5 right-5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0">
                      <button
                        onClick={(e) => handleDeleteClick(e, project)}
                        className="p-3 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl border border-white/20 dark:border-white/5 active:scale-90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Edit Icon Overlay */}
                     <div className="absolute top-5 right-[70px] z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0 delay-75">
                      <button
                        onClick={(e) => handleEditClick(e, project)}
                        className="p-3 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-[#8d775e] hover:text-white transition-all shadow-xl border border-white/20 dark:border-white/5 active:scale-90"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Simple Info Overlay (Snappier Animation) */}
                    <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest text-white border border-white/20 ${
                                    project.type === "moodboard" 
                                        ? "bg-purple-600/50" 
                                        : project.type === "threed" 
                                            ? "bg-blue-600/50" 
                                            : "bg-[#8d775e]/50"
                                }`}>
                                    {project.type === "moodboard" ? "Moodboard" : project.type === "threed" ? "3D Render" : "Floor Plan"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                                <h3 className="text-lg font-black text-white truncate drop-shadow-md">
                                    {project.title}
                                </h3>
                                <ArrowRight className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-widest">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(project.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                  </div>
              </motion.div>
            ))}
        </div>
        )}

        {/* Pagination */}
        {!moodboardsLoading && !floorPlansLoading && !threeDLoading && totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-4">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-2xl bg-white dark:bg-[#151515] text-gray-600 dark:text-gray-400 hover:text-[#8d775e] border border-gray-100 dark:border-white/5 disabled:opacity-20 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex gap-2 p-1.5 bg-white/50 dark:bg-[#151515]/50 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-10 h-10 rounded-2xl text-xs font-black transition-all duration-300 ${
                                currentPage === i + 1
                                    ? "bg-[#8d775e] text-white shadow-lg shadow-[#8d775e]/30 scale-105"
                                    : "bg-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-2xl bg-white dark:bg-[#151515] text-gray-600 dark:text-gray-400 hover:text-[#8d775e] border border-gray-100 dark:border-white/5 disabled:opacity-20 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 h-screen">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeleteId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-[#151515] rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              {/* Decorative Circle */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#8d775e]/10 rounded-full blur-3xl" />

              <div className="relative">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete Project?
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                  This action cannot be undone. This will permanently remove the project and its associated high-quality renders from our servers and Cloudinary storage.
                </p>

                <div className="flex gap-3">
                  <button
                    disabled={isDeleting}
                    onClick={() => setDeleteId(null)}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={confirmDelete}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Yes, Delete"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 h-screen">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isUpdating && setEditProject(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-[#151515] rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              {/* Decorative Circle */}
               <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#8d775e]/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

              <div className="relative">
                <div className="w-14 h-14 bg-[#8d775e]/10 dark:bg-[#8d775e]/20 rounded-2xl flex items-center justify-center mb-6">
                  <Edit2 className="w-6 h-6 text-[#8d775e]" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Edit Project
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                  Update the details of your project.
                </p>

                <div className="flex flex-col gap-2 mb-8">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Project Title
                    </label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={editTitle}
                            onChange={(e) => {
                                if (e.target.value.length <= 60) {
                                    setEditTitle(e.target.value);
                                }
                            }}
                            className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#8d775e] transition-colors"
                            placeholder="Enter project title"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                            {editTitle.length}/60
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                  <button
                    disabled={isUpdating}
                    onClick={() => setEditProject(null)}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isUpdating || !editTitle.trim()}
                    onClick={handleUpdateProject}
                    className="flex-1 px-6 py-3 bg-[#8d775e] hover:bg-[#7a6650] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#8d775e]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProjectsPage;
