import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Search,
  Users,
  BookOpen,
  RefreshCw,
  Download,
  TrendingUp,
  Mail,
  Award,
  MessageCircle,
  Plus,
  X,
  ChevronDown,
  Edit,
  Trash2,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  getAllStudentsAndEducators, 
  educatorAddStudent,
  educatorUpdateStudentCourses,
  educatorDeleteStudent
} from '../../Api/userApi.js';
import { getEducatorCourses } from '../../Api/courseApi.js';
const EducatorStudents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditCourseDropdown, setShowEditCourseDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudentCourses, setEditStudentCourses] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [educatorCourses, setEducatorCourses] = useState([]);
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    email: '',
    password: '',
    enrolledCourses: []
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const fetchEducatorCourses = async () => {
    try {
      const res = await getEducatorCourses();
      if (res?.success && Array.isArray(res.courses)) {
        setEducatorCourses(res.courses);
      }
    } catch (err) {
      console.error("Failed to fetch educator courses:", err);
    }
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');

    if (!newStudentData.name.trim() || !newStudentData.email.trim() || !newStudentData.password.trim()) {
      setAddError('All fields (name, email, password) are required');
      return;
    }

    try {
      setAddLoading(true);
      const res = await educatorAddStudent({
        name: newStudentData.name.trim(),
        email: newStudentData.email.trim(),
        password: newStudentData.password.trim(),
        enrolledCourses: newStudentData.enrolledCourses
      });

      if (res?.success) {
        setAddSuccess(res.message || 'Student added successfully!');
        setNewStudentData({ name: '', email: '', password: '', enrolledCourses: [] });
        setTimeout(() => {
          setShowAddModal(false);
          setAddSuccess('');
          fetchData(); // Refresh students list
        }, 1500);
      } else {
        throw new Error(res?.message || 'Failed to add student');
      }
    } catch (err) {
      setAddError(err?.response?.data?.message || err?.message || 'Failed to add student');
    } finally {
      setAddLoading(false);
    }
  };

  const handleCourseCheckboxChange = (courseId) => {
    setNewStudentData(prev => {
      const alreadySelected = prev.enrolledCourses.includes(courseId);
      const updated = alreadySelected
        ? prev.enrolledCourses.filter(id => id !== courseId)
        : [...prev.enrolledCourses, courseId];
      return { ...prev, enrolledCourses: updated };
    });
  };

  const handleOpenEditModal = (student) => {
    setSelectedStudent(student);
    setEditStudentCourses(student.courses || []);
    setEditError('');
    setEditSuccess('');
    setShowEditModal(true);
    setShowEditCourseDropdown(false);
  };

  const handleEditStudentCoursesSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setEditError('');
    setEditSuccess('');

    try {
      setEditLoading(true);
      const res = await educatorUpdateStudentCourses(selectedStudent.id, editStudentCourses);

      if (res?.success) {
        setEditSuccess(res.message || 'Access updated successfully!');
        setTimeout(() => {
          setShowEditModal(false);
          setEditSuccess('');
          fetchData(); // Refresh list
        }, 1500);
      } else {
        throw new Error(res?.message || 'Failed to update access');
      }
    } catch (err) {
      setEditError(err?.response?.data?.message || err?.message || 'Failed to update access');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCourseCheckboxChange = (courseId) => {
    setEditStudentCourses(prev => {
      const alreadySelected = prev.includes(courseId);
      const updated = alreadySelected
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId];
      return updated;
    });
  };

  const handleDeleteStudentSubmit = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to completely delete the student account for "${studentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await educatorDeleteStudent(studentId);
      if (res?.success) {
        alert(res.message || 'Student account deleted successfully!');
        fetchData(); // Refresh list
      } else {
        throw new Error(res?.message || 'Failed to delete student');
      }
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete student');
    }
  };

  // Placeholder data - replace with your backend data
  const [students, setStudents] = useState([]);

  const [courses, setCourses] = useState([]);
 
  // fetch and normalize data
  const fetchData = async () => {
    try {
      const [res, coursesRes] = await Promise.all([
        getAllStudentsAndEducators(),
        getEducatorCourses().catch(() => null)
      ]);

      const payload = res?.data ?? res;
      let rawStudents = Array.isArray(payload) ? payload : (payload.students ?? payload.users ?? payload.data ?? []);
      let rawEducatorCourses = coursesRes?.courses || [];

      // Create lookup map: courseId -> courseTitle
      const courseMap = {};
      rawEducatorCourses.forEach(c => {
        if (c._id) courseMap[c._id.toString()] = c.title || c.name || 'Untitled Course';
      });

      const normalizeStudent = (s) => {
        const name = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.fullName || s.email || 'Unknown';
        
        let coursesArray = [];
        if (Array.isArray(s.enrolledCourse)) {
          coursesArray = s.enrolledCourse;
        } else if (s.enrolledCourse) {
          coursesArray = [s.enrolledCourse];
        }
        
        const resolvedTitles = coursesArray.map(c => {
          if (c && typeof c === 'object') {
            if (c.title) return c.title;
            if (c.name) return c.name;
            if (c._id && courseMap[c._id.toString()]) return courseMap[c._id.toString()];
          }
          const idStr = String(c);
          if (courseMap[idStr]) return courseMap[idStr];
          return /^[0-9a-fA-F]{24}$/.test(idStr) ? (courseMap[idStr] || null) : idStr;
        }).filter(Boolean);
        
        const courseNames = [...new Set(resolvedTitles)].join(', ');
        
        return {
          id: s._id || s.id || s.userId || Math.random().toString(36).slice(2, 9),
          name,
          email: s.email || s.contactEmail || '',
          avatar: s.avatar || s.avatarUrl || s.photo || s.profilePic || s.image || null,
          status: s.status || (s.isActive ? 'active' : 'inactive') || 'active',
          courses: coursesArray.map(c => typeof c === 'object' ? (c._id || c.id) : c),
          courseName: courseNames || 'Unassigned',
          progress: typeof s.progress === 'number' ? s.progress : s.completion ?? s.progressPercent ?? 0,
          lessonsCompleted: s.lessonsCompleted ?? s.completedLessons ?? 0,
          timeSpent: s.timeSpent ?? s.hoursSpent ?? 0,
          rating: s.rating ?? s.avgRating ?? 0,
          createdAt: s.createdAt || s.created || s.joinedAt || null
        };
      };

      const studentsList = (Array.isArray(rawStudents) ? rawStudents : []).map(normalizeStudent);

      setStudents(studentsList);
      if (rawEducatorCourses.length > 0) {
        setCourses(rawEducatorCourses.map(c => ({ id: c._id, title: c.title })));
      }
    } catch (error) {
      console.error('Failed to fetch students/courses:', error);
    }
  };

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      alert("No student data available to export");
      return;
    }
    
    // Define the headers
    const headers = ["ID", "Name", "Email", "Status", "Course", "Progress (%)", "Lessons Completed", "Time Spent (hrs)", "Joined Date"];
    
    // Format the rows
    const rows = filteredStudents.map(student => [
      student.id,
      student.name,
      student.email,
      student.status,
      student.courseName,
      student.progress,
      student.lessonsCompleted,
      student.timeSpent,
      student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => {
        // Escape quotes/commas
        const textVal = String(val).replace(/"/g, '""');
        return textVal.includes(",") || textVal.includes("\n") || textVal.includes('"') ? `"${textVal}"` : textVal;
      }).join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `students_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchData();
    fetchEducatorCourses();
  }, []);

  const studentStats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    completedCourses: students.filter(s => s.progress === 100).length,
    avgProgress: students.length > 0 ? students.reduce((sum, s) => sum + s.progress, 0) / students.length : 0
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || student.courseId === filterCourse;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesCourse && matchesStatus;
  });
  
  // apply sorting to filtered results
  const sortedStudents = (() => {
    const list = [...filteredStudents];
    if (sortBy === 'progress') return list.sort((a, b) => (b.progress || 0) - (a.progress || 0));
    if (sortBy === 'time') return list.sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0));
    if (sortBy === 'name') return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    // recent/default - sort by createdAt desc (fallback to id)
    return list.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta || (b.id || '').localeCompare(a.id || '');
    });
  })();

  const EmptyState = () => (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="text-center py-16"
    >
      <Users className="w-20 h-20 text-slate-600 mx-auto mb-6" />
      <h3 className="text-2xl font-bold text-white mb-4">No students yet</h3>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        Once students start enrolling in your courses, you'll be able to track their progress and interact with them here.
      </p>
      <Link
        to="/educator/add-course"
        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
      >
        <BookOpen className="w-5 h-5" />
        <span>Create Your First Course</span>
      </Link>
    </motion.div>
  );

  const InitialsAvatar = ({ name }) => {
    const initials = (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0,2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
        {initials || '?'}
      </div>
    );
  };

  const StudentCard = ({ student }) => (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 hover:border-slate-600/50 transition-all duration-300">
      <div className="flex items-center space-x-4">
        {student.avatar ? (
          <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <InitialsAvatar name={student.name} />
        )}

        <div>
          <h3 className="text-white font-semibold">{student.name}</h3>
          <p className="text-slate-400 text-sm">{student.email}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-24">
      <div className="container mx-auto px-6 lg:px-8 pb-16">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link
              to="/educator/dashboard"
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Student Management
              </h1>
              <p className="text-slate-300 mt-2">
                Track student progress and engagement
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={fetchData} className="p-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors" title="Refresh">
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handleExportCSV}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>

            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-purple-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{studentStats.totalStudents}</h3>
                <p className="text-slate-400 text-sm">Total Students</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{studentStats.activeStudents}</h3>
                <p className="text-slate-400 text-sm">Active Students</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{studentStats.completedCourses}</h3>
                <p className="text-slate-400 text-sm">Completed</p>
              </div>
              <Award className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{Math.round(studentStats.avgProgress)}%</h3>
                <p className="text-slate-400 text-sm">Avg Progress</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-64"
                />
              </div>

              {/* Course Filter */}
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="recent">Most Recent</option>
                <option value="progress">Highest Progress</option>
                <option value="time">Most Time Spent</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-sm">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Students Table */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          {students.length === 0 ? (
            <EmptyState />
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No students found</h3>
              <p className="text-slate-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-sm border-b border-slate-700/40">
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Enrolled Course</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-3 align-middle">
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            { (student.name || '?').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() }
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 align-middle text-white">{student.name}</td>
                      <td className="py-3 px-3 align-middle text-slate-400 text-sm">{student.email}</td>
                      <td className="py-3 px-3 align-middle text-slate-300 text-sm">
                        {student.courseName && student.courseName !== 'Unassigned' ? (
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {student.courseName.split(', ').map((cName, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-300">
                                {cName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-500 border border-slate-700">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 align-middle text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(student)}
                            className="p-1.5 bg-slate-800 text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Manage Access"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudentSubmit(student.id, student.name)}
                            className="p-1.5 bg-slate-800 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
 
        {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-900/30">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 font-sans">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>Provision New Student Account</span>
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-4">
                {addError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{addError}</span>
                  </div>
                )}
                {addSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{addSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Student Full Name *</label>
                  <input 
                    type="text"
                    required
                    value={newStudentData.name}
                    onChange={e => setNewStudentData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Aniket Yadav"
                    className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Email Address *</label>
                    <input 
                      type="email"
                      required
                      value={newStudentData.email}
                      onChange={e => setNewStudentData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="student@example.com"
                      className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Password *</label>
                    <input 
                      type="password"
                      required
                      value={newStudentData.password}
                      onChange={e => setNewStudentData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
                    />
                  </div>
                </div>

                {/* Course Selector for New Student */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                      Assign Initial Courses ({newStudentData.enrolledCourses.length}/{educatorCourses.length})
                    </label>

                    <div className="flex items-center space-x-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setNewStudentData(prev => ({ ...prev, enrolledCourses: educatorCourses.map(c => c._id) }))}
                        className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={() => setNewStudentData(prev => ({ ...prev, enrolledCourses: [] }))}
                        className="text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 max-h-[190px] overflow-y-auto space-y-2">
                    {educatorCourses.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2 text-center">No courses created yet. Create a course first to assign it.</p>
                    ) : (
                      educatorCourses.map(course => {
                        const isChecked = newStudentData.enrolledCourses.includes(course._id);
                        return (
                          <div 
                            key={course._id}
                            onClick={() => handleCourseCheckboxChange(course._id)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                              isChecked
                                ? 'bg-purple-600/15 border-purple-500/50 text-white'
                                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0 pr-2">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                isChecked
                                  ? 'bg-purple-600 border-purple-500 text-white'
                                  : 'border-slate-700 bg-slate-800 text-transparent'
                              }`}>
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                              <span className="text-xs font-semibold truncate">{course.title}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isChecked ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
                            }`}>
                              {isChecked ? 'Selected' : 'Optional'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-800 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={addLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xs font-bold hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
                  >
                    {addLoading ? 'Creating...' : 'Create & Assign Student'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Student Access Modal */}
        {showEditModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900/95 border border-slate-700/80 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl shadow-blue-500/10 backdrop-blur-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Manage Student Access</h3>
                    <p className="text-xs text-slate-400">Assign or revoke course access for this student</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditStudentCoursesSubmit} className="p-6 space-y-5">
                {/* Alert Notifications */}
                {editError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{editError}</span>
                  </div>
                )}
                {editSuccess && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{editSuccess}</span>
                  </div>
                )}

                {/* Student Details Card */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                      {selectedStudent.name ? selectedStudent.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{selectedStudent.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {selectedStudent.email}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                    {editStudentCourses.length} Assigned
                  </span>
                </div>

                {/* Visual Course Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                      Assigned Courses ({editStudentCourses.length}/{educatorCourses.length})
                    </label>

                    {/* Bulk Action Controls */}
                    <div className="flex items-center space-x-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setEditStudentCourses(educatorCourses.map(c => c._id))}
                        className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={() => setEditStudentCourses([])}
                        className="text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Course Cards Container */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 max-h-[260px] overflow-y-auto space-y-2">
                    {educatorCourses.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        No courses created yet. Create a course first to assign it.
                      </div>
                    ) : (
                      educatorCourses.map(course => {
                        const isChecked = editStudentCourses.includes(course._id);
                        return (
                          <div
                            key={course._id}
                            onClick={() => handleEditCourseCheckboxChange(course._id)}
                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                              isChecked
                                ? 'bg-purple-600/15 border-purple-500/50 shadow-md shadow-purple-500/5'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0 pr-3">
                              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                isChecked
                                  ? 'bg-purple-600 border-purple-500 text-white'
                                  : 'border-slate-700 bg-slate-800 text-transparent'
                              }`}>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>

                              <div className="min-w-0">
                                <p className={`text-xs font-semibold truncate ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                                  {course.title}
                                </p>
                                <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                                  <span>{course.totalDuration || 1}h duration</span>
                                  <span>•</span>
                                  <span className="font-semibold text-slate-300">₹{course.price || 0}</span>
                                </div>
                              </div>
                            </div>

                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 border ${
                              isChecked
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {isChecked ? 'Assigned' : 'Not Enrolled'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={editLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all disabled:opacity-50"
                  >
                    {editLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Access Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducatorStudents;