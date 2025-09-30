import React, { useState, useEffect } from "react";
// 🎯 CRITICAL CHANGE: Import the configured axios instance
import axios from '@/lib/axiosInstance'; 
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import DefaultLayout from '@/components/DefaultLayout';

// --- MOCK UI Components (Assuming these exist or are local mocks as before) ---
const MockCard = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
    {children}
  </div>
);

const MockCardHeader = ({ children, className = "" }) => (
  <div className={`p-6 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);
const MockCardTitle = ({ children, className = "" }) => (
  <h2 className={`text-xl font-semibold text-gray-800 ${className}`}>
    {children}
  </h2>
);
const MockCardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const MockButton = ({ children, onClick, variant = 'default', size = 'default', className = "", disabled }) => {
  let style = "bg-blue-600 hover:bg-blue-700 text-white";
  if (variant === 'destructive') {
    style = "bg-red-600 hover:bg-red-700 text-white";
  } else if (variant === 'outline') {
    style = "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50";
  } else if (variant === 'ghost') {
    style = "bg-transparent text-gray-600 hover:bg-gray-100";
  }

  let padding = "px-4 py-2";
  if (size === 'sm') {
    padding = "px-3 py-1.5 text-sm";
  } else if (size === 'icon') {
    padding = "p-2";
  }

  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      onClick={disabled ? null : onClick}
      className={`rounded-lg transition-colors duration-200 font-medium ${padding} ${style} ${disabledStyle} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const MockInput = ({ value, onChange, placeholder, type = 'text', className = "", id }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${className}`}
  />
);

const MockLabel = ({ children, className = "", htmlFor }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
);

// MOCK: Simple inline SVGs for clarity
const Plus = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const Save = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const Trash = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const Loader2 = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const motion = { div: ({ children, ...props }) => <div {...props}>{children}</div> };


// --- Main Application Component (Titles) ---

const Titles = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const showToast = toast; 

  useEffect(() => {
    fetchTitles();
  }, []);

  const fetchTitles = async () => {
    try {
      // 🎯 MODIFIED: Use axios instance with relative path. Auth header and base URL are automatic.
      const response = await axios.get('/hackathons/domains-and-questions'); 
      
      if (Array.isArray(response.data)) {
        setDomains(response.data);
      } else {
        console.error("API response is not an array:", response.data);
        showToast({ title: "Warning", description: "Fetched data format is incorrect. Starting with empty state.", variant: 'destructive' });
      }

    } catch (error) {
      console.error("Error fetching data:", error.message || error);
      showToast({ 
        title: "Connection Error", 
        description: "Failed to fetch data. Ensure the server is running and you are logged in.", 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = () => {
    setDomains([
      ...domains,
      { name: `New Domain ${domains.length + 1}`, criteria: [], projects: [] },
    ]);
  };

  const handleDomainChange = (domainIndex, value) => {
    const newDomains = [...domains];
    newDomains[domainIndex].name = value;
    setDomains(newDomains);
  };

  const handleDeleteDomain = (domainIndex) => {
    const newDomains = [...domains];
    newDomains.splice(domainIndex, 1);
    setDomains(newDomains);
    showToast({ title: "Domain Removed", description: "Domain deleted locally. Remember to perform backend cleanup if necessary.", variant: 'destructive' });
  };

  const handleAddCriteria = (domainIndex) => {
    const newDomains = [...domains];
    newDomains[domainIndex].criteria.push({ name: "", maxScore: 10 });
    setDomains(newDomains);
  };

  const handleCriteriaChange = (domainIndex, criteriaIndex, field, value) => {
    const newDomains = [...domains];
    let typedValue = value;
    if (field === 'maxScore') {
        typedValue = parseInt(value, 10);
        if (isNaN(typedValue)) typedValue = 0;
    }
    newDomains[domainIndex].criteria[criteriaIndex][field] = typedValue;
    setDomains(newDomains);
  };

  const handleDeleteCriteria = (domainIndex, criteriaIndex) => {
    const newDomains = [...domains];
    newDomains[domainIndex].criteria.splice(criteriaIndex, 1);
    setDomains(newDomains);
  };

  const handleAddProject = (domainIndex) => {
    const newDomains = [...domains];
    newDomains[domainIndex].projects.push({
      _id: null,
      title: `New Project ${newDomains[domainIndex].projects.length + 1}`,
      description: "",
    });
    setDomains(newDomains);
  };

  const handleProjectChange = (domainIndex, projectIndex, field, value) => {
      const newDomains = [...domains];
      newDomains[domainIndex].projects[projectIndex][field] = value;
      setDomains(newDomains);
  };


  const handleDeleteProject = async (domainIndex, projectIndex) => {
    const project = domains[domainIndex].projects[projectIndex];
    
    // Attempt deletion from MongoDB if the project has an ID
    if (project._id) {
      try {
        // 🎯 MODIFIED: Use axios instance with relative path and project ID.
        await axios.delete(`/questions/${project._id}`);
        showToast({ title: "Deleted", description: `${project.title} permanently removed from MongoDB.` });
      } catch (err) {
        console.error("Delete Error:", err);
        showToast({ title: "Error", description: `Failed to delete project from backend.`, variant: 'destructive' });
        return;
      }
    }

    // Delete from local state
    const newDomains = [...domains];
    newDomains[domainIndex].projects.splice(projectIndex, 1);
    setDomains(newDomains);
    if (!project._id) {
        showToast({ title: "Deleted", description: `Unsaved project ${project.title} removed locally.` });
    }
  };

  // --- Save Changes (Interacts with MongoDB) ---
  const handleSaveChanges = async (domainIndex, projectIndex) => {
    const project = domains[domainIndex].projects[projectIndex];
    
    // Construct payload
    const payload = {
      q_title: project.title,
      q_description: project.description,
      domain: domains[domainIndex].name,
      // Pass only criteria with non-empty names
      evaluationCriteria: domains[domainIndex].criteria.filter((c) => c.name.trim() !== ""),
    };

    if (!payload.domain.trim() || !payload.q_title.trim()) {
        showToast({ variant: 'destructive', title: "Validation Error", description: "Domain Name and Project Title cannot be empty." });
        return;
    }
    
    try {
      if (project._id) {
        // 🎯 MODIFIED: HTTP PUT using axios instance.
        await axios.put(`/questions/${project._id}`, payload);
        showToast({ title: "Updated", description: `${project.title} updated successfully in MongoDB.` });
      } else {
        // 🎯 MODIFIED: HTTP POST using axios instance.
        const res = await axios.post('/questions', payload);
        
        // Update local state with the new MongoDB ID from the response
        const newDomains = [...domains];
        newDomains[domainIndex].projects[projectIndex]._id = res.data.question._id;
        setDomains(newDomains);
        
        showToast({ title: "Created", description: `${project.title} saved successfully to MongoDB.` });
      }
    } catch (err) {
      console.error("Save Error:", err.message || err);
      showToast({ 
        title: "Error Saving", 
        description: `Failed to save project to MongoDB. Check server logs.`, 
        variant: 'destructive' 
      });
    }
  };

  // --- Cancel Handler (FIXED to navigate) ---
  const handleCancel = () => {
    showToast({ title: "Cancelled", description: "Changes discarded and navigating back to Admin Dashboard." });
    navigate('/admin'); 
  };

  if (loading) {
    return (
      <DefaultLayout userRole="admin">
          <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-slate-50 to-blue-50/30">
            <div className="text-xl font-semibold text-blue-600 flex items-center">
              <Loader2 className="h-6 w-6 mr-3" /> Loading Hackathon Structure...
            </div>
          </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout userRole="admin"> 
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 font-sans">
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b pb-2 border-blue-200">
              Manage Project Titles & Criteria
            </h1>

            <div className="flex flex-wrap gap-4 mb-8">
              <MockButton onClick={handleAddDomain} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" /> Add Domain
              </MockButton>
              <MockButton 
                onClick={handleCancel}
                variant="outline"
                className="border-red-400 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Cancel
              </MockButton>
            </div>

            <div className="space-y-8">
              {domains.length === 0 && (
                  <div className="text-center p-12 border-4 border-dashed border-gray-300 rounded-xl bg-white/70">
                      <p className="text-xl font-semibold text-gray-700">No Domains Loaded</p>
                      <p className="text-gray-500 mt-2">Click "Add Domain" to begin creating the structure.</p>
                  </div>
              )}

              {domains.map((domain, domainIndex) => (
                <MockCard key={domainIndex} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <MockCardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex-grow w-full sm:mr-4 mb-4 sm:mb-0">
                      <MockLabel htmlFor={`domain-name-${domainIndex}`} className="text-sm font-medium text-gray-500">
                        Domain Name
                      </MockLabel>
                      <MockInput
                        id={`domain-name-${domainIndex}`}
                        placeholder="Enter Domain Name"
                        value={domain.name}
                        onChange={(e) => handleDomainChange(domainIndex, e.target.value)}
                        className="text-2xl font-bold h-auto p-2 border-2 border-transparent focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-500"
                      />
                    </div>
                    <MockButton
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteDomain(domainIndex)}
                    >
                      <Trash className="h-4 w-4 mr-2" /> Delete Domain
                    </MockButton>
                  </MockCardHeader>
                  <MockCardContent className="space-y-6">
                    {/* Domain-level Criteria */}
                    <div>
                      <MockLabel className="font-bold text-lg text-gray-800 mb-2">Evaluation Criteria (Applies to all Projects in this Domain)</MockLabel>
                      <div className="space-y-3 mt-3 p-4 border border-blue-200 rounded-lg bg-blue-50/50">
                        {domain.criteria.map((criterion, criteriaIndex) => (
                          <div key={criteriaIndex} className="flex flex-col sm:flex-row gap-2 items-center">
                            <MockInput
                              placeholder="Criterion Name (e.g., UI/UX)"
                              value={criterion.name}
                              onChange={(e) => handleCriteriaChange(domainIndex, criteriaIndex, "name", e.target.value)}
                              className="flex-grow"
                            />
                            <MockInput
                              type="number"
                              placeholder="Max Score"
                              value={criterion.maxScore}
                              onChange={(e) => handleCriteriaChange(domainIndex, criteriaIndex, "maxScore", e.target.value)}
                              className="w-full sm:w-28 text-center"
                            />
                            <MockButton
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteCriteria(domainIndex, criteriaIndex)}
                              className="hover:bg-red-100 p-2"
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </MockButton>
                          </div>
                        ))}
                          <MockButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddCriteria(domainIndex)}
                            className="mt-4 border-blue-400 text-blue-600 hover:bg-blue-50"
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Criterion
                          </MockButton>
                      </div>
                    </div>
                    
                    {/* Projects */}
                    <div className="mt-6">
                       <h3 className="font-bold text-xl text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
                         Projects / Problem Statements
                       </h3>
                       <MockButton
                          variant="default"
                          size="sm"
                          onClick={() => handleAddProject(domainIndex)}
                          className="mb-6 bg-green-500 hover:bg-green-600"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Project
                        </MockButton>

                      <div className="space-y-6">
                        {domain.projects.map((project, projectIndex) => (
                          <MockCard key={project._id || projectIndex} className="p-4 bg-white border border-gray-200 shadow-sm">
                            <div className="space-y-4">
                              <div>
                                <MockLabel htmlFor={`project-title-${projectIndex}`} className="font-semibold">Project Title</MockLabel>
                                <MockInput
                                   id={`project-title-${projectIndex}`}
                                   className="mt-1"
                                   placeholder="Enter Project Title"
                                   value={project.title}
                                   onChange={(e) => handleProjectChange(domainIndex, projectIndex, "title", e.target.value)}
                                />
                                 {project._id && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        MongoDB ID: <span className="font-mono text-blue-600">{project._id}</span>
                                    </p>
                                )}
                              </div>
                              
                              <div>
                                <MockLabel htmlFor={`project-desc-${projectIndex}`} className="font-semibold">Description</MockLabel>
                                <MockInput
                                   id={`project-desc-${projectIndex}`}
                                   className="mt-1"
                                   placeholder="Enter a brief description"
                                   value={project.description}
                                   onChange={(e) => handleProjectChange(domainIndex, projectIndex, "description", e.target.value)}
                                />
                              </div>

                              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <MockButton
                                 size="sm"
                                 variant="destructive"
                                 onClick={() => handleDeleteProject(domainIndex, projectIndex)}
                                >
                                  <Trash className="h-4 w-4 mr-1" /> Delete
                                </MockButton>
                                <MockButton
                                  size="sm"
                                  onClick={() => handleSaveChanges(domainIndex, projectIndex)}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  <Save className="h-4 w-4 mr-2" /> {project._id ? "Update Project" : "Save Project"}
                                </MockButton>
                              </div>
                            </div>
                          </MockCard>
                        ))}
                      </div>
                    </div>
                  </MockCardContent>
                </MockCard>
              ))}
            </div>
          </motion.div>
        </div>
    </DefaultLayout>
  );
};

export default Titles;