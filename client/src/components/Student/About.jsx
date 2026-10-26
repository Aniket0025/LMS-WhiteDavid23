import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Award, 
  Target, 
  Zap, 
  Globe,
  Shield,
  Clock,
  Star,
  TrendingUp,
  Heart,
  Lightbulb,
  Rocket,
  CheckCircle
} from 'lucide-react';

const About = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Courses",
      description: "From beginner to advanced levels, our courses cover every aspect of modern technology and business skills."
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from industry professionals with years of real-world experience and proven teaching methods."
    },
    {
      icon: Award,
      title: "Certified Learning",
      description: "Earn certificates that are recognized by leading companies and boost your career prospects."
    },
    {
      icon: Target,
      title: "Skill-Based Learning",
      description: "Focus on practical skills that you can immediately apply in your work and projects."
    },
    {
      icon: Clock,
      title: "Flexible Schedule",
      description: "Learn at your own pace with lifetime access to course materials and community support."
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Join a worldwide network of learners and professionals sharing knowledge and experiences."
    }
  ];

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We constantly evolve our platform with the latest educational technologies and methodologies."
    },
    {
      icon: Heart,
      title: "Student Success",
      description: "Your success is our priority. We provide personalized support throughout your learning journey."
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Every course undergoes rigorous quality checks to ensure the highest educational standards."
    },
    {
      icon: Rocket,
      title: "Career Growth",
      description: "We focus on practical skills that directly contribute to your professional advancement."
    }
  ];

  const stats = [
    { number: "900+", label: "Active Students", icon: Users },
    { number: "50+", label: "Expert Courses", icon: BookOpen },
    { number: "150+", label: "Industry Experts", icon: Award },
    { number: "98%", label: "Success Rate", icon: TrendingUp }
  ];

  const teamMembers = [
    {
      name: "Mehtab Raza",
      tag: "Cybersecurity Diploma – IIT Kharagpur",
      role: "CYBER SECURITY TRAINER | OFFENSIVE & DEFENSIVE SECURITY SPECIALIST",
      description: "Mehtab Raza is a seasoned cybersecurity professional with over 5 years of hands-on experience in offensive and defensive security operations. He specializes in advanced penetration testing, threat intelligence, and digital forensics, delivering structured real-world training programs that build industry-ready professionals. His expertise includes Android and cloud security testing, Windows and web penetration testing, malware analysis, digital forensics, security research, OSINT, bug hunting, web development, and blockchain development.",
      badges: ["eMAPT", "eCTHP", "OSCP"],
      education: "Education: BCA – Amity University",
      image: "/teams/Mehtab Raza.png",
      accent: "from-pink-500 to-rose-600"
    },
    {
      name: "Varun Singh",
      tag: "Cybersecurity Diploma – IIT Kanpur",
      role: "DEVELOPER | AI & DATA SCIENCE SPECIALIST | NETWORK ENGINEER",
      description: "Varun Singh is a technology professional with over 4 years of experience in software development, AI-driven systems, and network engineering. He specializes in building secure, scalable web and infrastructure solutions powered by automation and data intelligence. With expertise in Python, Java, CCNA/CCNP Firewall, Generative AI, and enterprise networking, he delivers performance-driven, security-focused technology solutions across modern digital environments.",
      badges: ["CCEP", "Python", "Java", "PHP", "CCNA", "CCNP Firewall", "Generative AI", "Data Science", "MCSE", "CEH"],
      education: "Education: BCA – Chhatrapati Shahu Ji Maharaj University",
      image: "/teams/Varun Singh.png",
      accent: "from-blue-500 to-indigo-600"
    },
    {
      name: "Nikhil Kumar",
      tag: "Expert Class",
      role: "BUG BOUNTY HUNTER | SECURITY RESEARCHER | PYTHON DEVELOPER",
      description: "Nikhil Kumar is a cybersecurity professional with over 3 years of hands-on experience in bug bounty hunting and security research. He specializes in identifying vulnerabilities, performing web application security assessments, and applying ethical hacking methodologies in real-world environments. He actively contributes to responsible disclosure practices and leverages Python for automation and advanced security research workflows.",
      badges: ["eJPT v2", "CEH v13"],
      education: "Education: BCA – Sachchidanand Sinha College",
      image: "/teams/Nikhil Kumar.png",
      accent: "from-orange-500 to-amber-600"
    },
    {
      name: "Huzaifah Tahir",
      tag: "Expert Class",
      role: "CYBERSECURITY STUDENT & TRAINER | PLATFORM ARCHITECT",
      description: "Huzaifah Tahir is a cybersecurity professional with over 4 years of hands-on experience in penetration testing, Active Directory environments, and advanced Linux system administration. He conducts practical training sessions focused on real-world attack simulations and defensive security strategies. Alongside cybersecurity operations, he is involved in designing scalable digital platforms aimed at improving accessibility, automation, and user experience within modern technology ecosystems.",
      badges: ["REMAC+", "MSAC+", "CPPS", "CCEP", "CPTS", "Google Certified Cybersecurity Professional"],
      education: "Education: BSCS (Computer Science), Specialization in Cybersecurity",
      image: "/teams/Huzaifah Tahir.png",
      accent: "from-green-500 to-emerald-600"
    },
    {
      name: "Binayak Bisoyi",
      tag: "Expert Class",
      role: "OSINT SPECIALIST | SOC ANALYST | PENETRATION TESTER",
      description: "Binayak Bisoyi is a cybersecurity professional with over 3+ years of hands-on experience in penetration testing and web application security assessments. He specializes in vulnerability identification, attack surface analysis, and strengthening security posture through structured methodologies. He also brings expertise in OSINT investigations and SOC operations, including threat monitoring, incident analysis, and digital reconnaissance to support proactive and intelligence-driven defense strategies.",
      badges: [],
      education: "Education: Cybersecurity Specialist & OSINT Professional",
      image: "/teams/Binayak Bisoyi.png",
      accent: "from-purple-500 to-violet-600"
    },
    {
      name: "Vikram Barnwal",
      tag: "Expert Class",
      role: "CYBERSECURITY TRAINER | PENETRATION TESTING SPECIALIST",
      description: "Vikram Barnwal is a cybersecurity professional with over 2 years of experience in penetration testing, vulnerability assessment, malware analysis, and network security. Alongside his technical expertise, he delivers structured and practical cybersecurity training programs focused on real-world application. He has hands-on experience with industry-standard tools including Metasploit, Nessus, OpenVAS, Burp Suite, and Nmap for conducting comprehensive security assessments and attack simulations, emphasizing both offensive and defensive methodologies.",
      badges: ["CEH v12", "CPENT"],
      education: "Education: Koyalanchal University (BBMKU), Dhanbad",
      image: "/teams/Vikram Barnwal.png",
      accent: "from-teal-500 to-cyan-600"
    },
    {
      name: "Kuldeep Singh",
      tag: "Expert Class",
      role: "SALES EXECUTIVE & SOCIAL MEDIA MANAGER",
      description: "Kuldeep Singh is a results-driven professional with over 3 years of experience in sales, client relationship management, and social media operations. He specializes in lead generation, client conversion, and building long-term business relationships while managing brand presence across digital platforms. With experience as a Relationship Manager at Simpex Media, he has developed strong expertise in client coordination, campaign execution, and revenue-focused strategies, contributing to consistent business growth and digital engagement.",
      badges: [],
      education: "Education: Diploma in Graphic Design & Animation | BA – Lucknow University",
      image: "/teams/Kuldeep Singh.png",
      accent: "from-red-500 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <motion.section 
        className="pt-24 pb-16 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              About{' '}
            </span>
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              whitedavid23
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-slate-300 max-w-3xl mx-auto mb-12"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            Empowering learners worldwide with cutting-edge courses, expert instruction, 
            and a community-driven approach to skill development and career advancement.
          </motion.p>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInUp}>
              <h2 className="text-4xl font-bold text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                At whitedavid23, we believe that quality education should be accessible to everyone, 
                everywhere. Our mission is to democratize learning by providing world-class courses 
                that bridge the gap between traditional education and industry requirements.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                We're committed to creating an ecosystem where learners can acquire in-demand skills, 
                connect with industry experts, and accelerate their career growth through practical, 
                hands-on learning experiences.
              </p>
            </motion.div>
            
            <motion.div 
              className="relative"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-8">
                <Rocket className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white text-center mb-4">
                  Transforming Education
                </h3>
                <p className="text-slate-300 text-center">
                  With innovative teaching methods and real-world applications, 
                  we're reshaping how people learn and grow professionally.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Statistics Section */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-white text-center mb-12"
            variants={fadeInUp}
          >
            Our Impact
          </motion.h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 text-center hover:border-slate-600/50 hover:bg-slate-800/70 transition-all duration-300"
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mx-auto mb-3 sm:mb-4" />
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{stat.number}</div>
                  <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-white text-center mb-12"
            variants={fadeInUp}
          >
            Why Choose whitedavid23?
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 hover:bg-slate-800/70 transition-all duration-300 group"
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <IconComponent className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-white text-center mb-12"
            variants={fadeInUp}
          >
            Our Values
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <motion.div
                  key={value.title}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center hover:border-slate-600/50 hover:bg-slate-800/70 transition-all duration-300 group"
                  variants={fadeInUp}
                  transition={{ delay: index * 0.15 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{value.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Vision Section */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-4xl font-bold text-white mb-8"
            variants={fadeInUp}
          >
            Our Vision
          </motion.h2>
          
          <motion.div 
            className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-3xl p-8 mb-8"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <Target className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <p className="text-xl text-slate-300 leading-relaxed">
              To become the world's leading platform for skill-based learning, where anyone can 
              access high-quality education, connect with expert mentors, and build a successful 
              career in the digital economy.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
              variants={fadeInUp}
            >
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Accessibility</h3>
              <p className="text-slate-300 text-sm">Making quality education accessible to learners worldwide</p>
            </motion.div>
            
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
              variants={fadeInUp}
            >
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Innovation</h3>
              <p className="text-slate-300 text-sm">Leveraging cutting-edge technology for immersive learning</p>
            </motion.div>
            
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
              variants={fadeInUp}
            >
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Excellence</h3>
              <p className="text-slate-300 text-sm">Maintaining the highest standards in course quality and delivery</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Teams Section */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/80 border-t border-slate-900"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Meet Our Expert Team
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg">
              Learn from industry-leading instructors and subject matter experts who bring years of practical experience to our courses.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <motion.div
                key={member.name}
                variants={fadeInUp}
                className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 group"
              >
                {/* Decorative glow background */}
                <div className={`absolute -right-16 -top-16 w-36 h-36 bg-gradient-to-br ${member.accent} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-300`} />

                <div>
                  {/* Top Row: Decorative Checkbox & Tag */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-5 h-5 rounded border border-slate-700 bg-slate-900/50 flex items-center justify-center">
                      <div className={`w-2.5 h-2.5 rounded-sm bg-gradient-to-r ${member.accent} opacity-40 group-hover:opacity-100 transition-opacity`} />
                    </div>
                    
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full shadow-inner max-w-[200px] truncate">
                      {member.tag}
                    </span>
                  </div>

                  {/* Circular Avatar */}
                  <div className="relative mb-6 w-24 h-24">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${member.accent} p-[2px]`}>
                      <div className="w-full h-full rounded-full bg-[#0b1329] overflow-hidden">
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Name and Role */}
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {member.name}
                  </h3>
                  
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 italic mb-4 leading-normal">
                    {member.role}
                  </p>

                  {/* Description */}
                  <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-6 font-normal font-sans">
                    {member.description}
                  </p>
                </div>

                {/* Badges, Divider & Education */}
                <div>
                  {/* Badges Section */}
                  {member.badges && member.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {member.badges.map(badge => (
                        <span 
                          key={badge}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white transition-colors`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="h-[1px] bg-slate-800/80 w-full mb-4" />

                  {/* Education */}
                  <p className="text-[11px] text-slate-500 font-semibold tracking-wide">
                    {member.education || "Education: Cybersecurity Professional"}
                  </p>
                </div>

                {/* Color-accent Bottom Bar */}
                <div className={`absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r ${member.accent}`} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600/10 to-purple-600/10"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of students who have transformed their careers with whitedavid23
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/course"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <BookOpen className="w-5 h-5" />
              Explore Courses
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute w-96 h-96 bg-blue-500/5 rounded-full top-1/4 left-1/4 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.03, 0.08, 0.03]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute w-64 h-64 bg-purple-500/5 rounded-full bottom-1/4 right-1/4 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.08, 0.03, 0.08]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
      </div>
    </div>
  );
};

export default About;