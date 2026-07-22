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
  Trash2
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
      const res = await getAllStudentsAndEducators();
      const payload = res?.data ?? res;
      // try common response shapes
      let rawStudents = [];
      let rawCourses = [];

      if (Array.isArray(payload)) {
        rawStudents = payload;
      } else {
        rawStudents = payload.students ?? payload.users ?? payload.data ?? [];
        rawCourses = payload.courses ?? [];
      }

      const normalizeStudent = (s) => {
        const name = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.fullName || s.email || 'Unknown';
        
        let coursesArray = [];
        if (Array.isArray(s.enrolledCourse)) {
          coursesArray = s.enrolledCourse;
        } else if (s.enrolledCourse) {
          coursesArray = [s.enrolledCourse];
        }
        
        const courseNames = coursesArray.map(c => c.title || c.name || c).filter(Boolean).join(', ');
        
        return {
          id: s._id || s.id || s.userId || Math.random().toString(36).slice(2, 9),
          name,
          email: s.email || s.contactEmail || '',
          avatar: s.avatar || s.avatarUrl || s.photo || s.profilePic || s.image || null,
          status: s.status || (s.isActive ? 'active' : 'inactive') || 'active',
          courses: coursesArray.map(c => c._id || c.id || c),
          courseName: courseNames || 'Unassigned',
          progress: typeof s.progress === 'number' ? s.progress : s.completion ?? s.progressPercent ?? 0,
          lessonsCompleted: s.lessonsCompleted ?? s.completedLessons ?? 0,
          timeSpent: s.timeSpent ?? s.hoursSpent ?? 0,
          rating: s.rating ?? s.avgRating ?? 0,
          createdAt: s.createdAt || s.created || s.joinedAt || null
        };
      };

      const studentsList = (Array.isArray(rawStudents) ? rawStudents : []).map(normalizeStudent);

      // derive courses either from payload.courses or from students
      let coursesList = [];
      if (Array.isArray(rawCourses) && rawCourses.length > 0) {
        coursesList = rawCourses.map(c => ({
          id: c._id || c.id || c.courseId,
          title: c.title || c.name || 'Untitled Course'
        }));
      } else {
        // build unique list from students
        const map = {};
        studentsList.forEach(s => {
          if (s.courseId && !map[s.courseId]) {
            map[s.courseId] = { id: s.courseId, title: s.courseName || 'Untitled Course' };
          }
        });
        coursesList = Object.values(map);
      }

      setStudents(studentsList);
      setCourses(coursesList);
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
                      <td className="py-3 px-3 align-middle text-slate-300 text-sm">{student.courseName || '—'}</td>
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
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{addError}</span>
                  </div>
                )}
                {addSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm flex items-center gap-2">
                    <span>✅</span>
                    <span>{addSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Student Name *</label>
                  <input 
                    type="text"
                    required
                    value={newStudentData.name}
                    onChange={e => setNewStudentData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter student's full name"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address *</label>
                    <input 
                      type="email"
                      required
                      value={newStudentData.email}
                      onChange={e => setNewStudentData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="student@example.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password *</label>
                    <input 
                      type="password"
                      required
                      value={newStudentData.password}
                      onChange={e => setNewStudentData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Assign Courses
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white flex justify-between items-center text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <span className={newStudentData.enrolledCourses.length > 0 ? "text-white font-medium" : "text-slate-500"}>
                      {newStudentData.enrolledCourses.length > 0 
                        ? `${newStudentData.enrolledCourses.length} Course(s) Selected` 
                        : "Select Courses (0 selected)"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showCourseDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showCourseDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowCourseDropdown(false)}></div>
                      <div className="absolute left-0 right-0 mt-2 bg-slate-950 border border-slate-850 rounded-xl p-3 max-h-[180px] overflow-y-auto space-y-2 shadow-2xl z-20">
                        {educatorCourses.length === 0 ? (
                          <p className="text-xs text-slate-500 italic p-1">No courses created yet. Create a course first to assign it.</p>
                        ) : (
                          educatorCourses.map(course => {
                            const isChecked = newStudentData.enrolledCourses.includes(course._id);
                            return (
                              <label 
                                key={course._id}
                                className={`flex items-start gap-3 cursor-pointer p-2 rounded-lg transition-colors select-none text-xs ${
                                  isChecked ? 'bg-purple-600/15 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                                }`}
                              >
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleCourseCheckboxChange(course._id)}
                                  className="mt-0.5 rounded border-slate-700 text-purple-600 bg-slate-900 focus:ring-purple-500/50"
                                />
                                <span className="flex-1 leading-normal font-medium">{course.title}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-800 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={addLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
                  >
                    {addLoading ? 'Creating...' : 'Assign & Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Student Modal */}
        {showEditModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-900/30">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 font-sans">
                  <Edit className="w-5 h-5 text-blue-400" />
                  <span>Manage Student Access</span>
                </h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditStudentCoursesSubmit} className="p-6 space-y-4">
                {editError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{editError}</span>
                  </div>
                )}
                {editSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm flex items-center gap-2">
                    <span>✅</span>
                    <span>{editSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Student Details</label>
                  <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
                    <p className="text-sm font-semibold text-white">{selectedStudent.name}</p>
                    <p className="text-xs text-slate-400">{selectedStudent.email}</p>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Assign/Remove Courses
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEditCourseDropdown(!showEditCourseDropdown)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white flex justify-between items-center text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <span className={editStudentCourses.length > 0 ? "text-white font-medium" : "text-slate-500"}>
                      {editStudentCourses.length > 0 
                        ? `${editStudentCourses.length} Course(s) Assigned` 
                        : "No Courses Assigned (0 selected)"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showEditCourseDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showEditCourseDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowEditCourseDropdown(false)}></div>
                      <div className="absolute left-0 right-0 mt-2 bg-slate-950 border border-slate-850 rounded-xl p-3 max-h-[180px] overflow-y-auto space-y-2 shadow-2xl z-20">
                        {educatorCourses.length === 0 ? (
                          <p className="text-xs text-slate-500 italic p-1">No courses created yet. Create a course first to assign it.</p>
                        ) : (
                          educatorCourses.map(course => {
                            const isChecked = editStudentCourses.includes(course._id);
                            return (
                              <label 
                                key={course._id}
                                className={`flex items-start gap-3 cursor-pointer p-2 rounded-lg transition-colors select-none text-xs ${
                                  isChecked ? 'bg-purple-600/15 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                                }`}
                              >
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleEditCourseCheckboxChange(course._id)}
                                  className="mt-0.5 rounded border-slate-700 text-purple-600 bg-slate-900 focus:ring-purple-500/50"
                                />
                                <span className="flex-1 leading-normal font-medium">{course.title}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-800 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={editLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
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