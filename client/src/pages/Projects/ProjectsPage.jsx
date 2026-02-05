import { useDeleteFloorPlan, useUserFloorPlans } from "@/hooks/useFloorPlan";
import { useDeleteMoodboard, useUserMoodboards } from "@/hooks/useMoodboard";
import { useDeleteThreeDModel, useUserThreeDModels } from "@/hooks/useThreeD";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Clock,
  Filter,
  Image as ImageIcon,
  LayoutGrid,
  Loader2,
  Search,
  Trash2,
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

  // Fetch data from server
  const { data: moodboardData, isLoading: moodboardsLoading } = useUserMoodboards(1, 100);
  const { data: floorPlanData, isLoading: floorPlansLoading } = useUserFloorPlans();
  const { data: threeDData, isLoading: threeDLoading } = useUserThreeDModels();

  // Deletion mutations
  const deleteMoodboard = useDeleteMoodboard();
  const deleteFloorPlan = useDeleteFloorPlan();
  const deleteThreeDModel = useDeleteThreeDModel();

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

  return (
    <div className='min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] font-["Poppins"] selection:bg-[#8d775e]/10'>
      <TopBar />

      <main className='max-w-[1800px] mx-auto px-6 md:px-12 pt-28 pb-12'>
        
        {/* Simple Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>

            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative group min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#8d775e] transition-colors" />
                    <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#151515] border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#8d775e] transition-colors"
                    />
                </div>

                {/* Filters */}
                <div className="relative">
                  <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-[#151515] border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8d775e]/20 focus:border-[#8d775e] transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                  >
                      {FILTER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-[#151515] border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8d775e]/20 focus:border-[#8d775e] transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                  >
                      {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8">
          {moodboardsLoading || floorPlansLoading || threeDLoading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                 <div className="aspect-[4/3] rounded-2xl bg-gray-100 dark:bg-[#151515] animate-pulse" />
                 <div className="h-4 w-2/3 bg-gray-100 dark:bg-[#151515] rounded animate-pulse" />
                 <div className="h-3 w-1/3 bg-gray-100 dark:bg-[#151515] rounded animate-pulse" />
              </div>
            ))
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutGrid className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm">No projects found.</p>
            </div>
          ) : (
            paginatedProjects.map((project, index) => (
              <motion.div
                key={project.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleCardClick(project)}
                className="group cursor-pointer flex flex-col gap-3"
              >
                  {/* Image Card */}
                  <div className="relative aspect-[4/3] bg-gray-100 dark:bg-[#151515] rounded-2xl overflow-hidden shadow-sm transition-all duration-500 group-hover:shadow-md group-hover:shadow-black/5 dark:group-hover:shadow-black/20">
                    {project.thumbnail ? (
                        <img 
                        src={project.thumbnail} 
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-[#1a1a1a] flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                        </div>
                    )}
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                         <span className="px-2.5 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-white shadow-sm">
                            {project.type === "moodboard" ? "Moodboard" : project.type === "threed" ? "3D Model" : "Floor Plan"}
                         </span>
                    </div>

                    {/* Delete Icon Overlay */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => handleDeleteClick(e, project)}
                        className="p-2 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                  </div>

                  {/* Content Below */}
                  <div className="space-y-1 px-1">
                     <div className="flex justify-between items-start gap-2">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#8d775e] transition-colors">
                            {project.title}
                        </h3>
                     </div>
                     <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {formatDate(project.createdAt)}
                     </p>
                  </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!moodboardsLoading && !floorPlansLoading && !threeDLoading && totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#8d775e] disabled:opacity-30 disabled:hover:text-gray-600 transition-colors"
                >
                    Previous
                </button>
                
                <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                                currentPage === i + 1
                                    ? "bg-[#8d775e] text-white shadow-lg shadow-[#8d775e]/20"
                                    : "bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#8d775e] disabled:opacity-30 disabled:hover:text-gray-600 transition-colors"
                >
                    Next
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
    </div>
  );
};

export default ProjectsPage;
