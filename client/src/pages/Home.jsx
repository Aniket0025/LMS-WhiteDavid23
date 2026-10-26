import React from 'react';
import Hero from '../components/Student/Hero';
import Footer from '../components/Student/Footer';
import Companies from '../components/Student/Companies';
import StudentFeedback from '../components/Student/StudentFeedback';
import LearningJourney from '../components/Student/LearningJourney';
import CoursesSection from '../components/course/CoursesSection';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <main className="flex-grow">
        {/* 1. Hero Section with Live Metrics & Course Preview */}
        <Hero />

        {/* 2. Featured Masterclasses (Courses immediately accessible!) */}
        <CoursesSection />

        {/* 3. Platform Architecture & Industry Tech Stack */}
        <Companies />

        {/* 4. Structured Technical Learning Path */}
        <LearningJourney />

        {/* 5. Real Student Reviews & Community Pledge */}
        <StudentFeedback />
      </main>

      <Footer />
    </div>
  );
};

export default Home;