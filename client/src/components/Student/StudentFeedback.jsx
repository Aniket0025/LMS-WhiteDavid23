import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const StudentFeedback = () => {
  const feedbacks = [
    {
      name: "Aarav Sharma",
      role: "Software Developer",
      feedback:
        "This platform completely transformed my learning experience! The interactive dashboard and expert guidance made complex topics easy to understand.",
    },
    {
      name: "Priya Das",
      role: "Frontend Engineer",
      feedback:
        "The flexibility and practical projects were exactly what I needed. The certificate I earned has already helped me land job interviews!",
    },
    {
      name: "Rohan Gupta",
      role: "Full Stack Developer",
      feedback:
        "I loved the course content and the friendly mentors. The real-world assignments helped me build a portfolio that stands out.",
    },
    {
      name: "Ananya Patel",
      role: "Cloud Specialist",
      feedback:
        "The AWS and DevOps training helped me land my first cloud engineer role. The mentors were incredibly helpful throughout.",
    },
    {
      name: "Vikram Singh",
      role: "Data Engineer",
      feedback:
        "The practical coding projects and industry-relevant curriculum gave me the confidence to excel in technical interviews.",
    },
    {
      name: "Kavya Verma",
      role: "UI/UX Student",
      feedback:
        "The self-paced learning schedule fit perfectly into my schedule. I gained practical skills that helped me clear campus placement.",
    },
  ];

  const getInitials = (name) => {
    if (!name) return "S";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const avatarGradients = [
    "from-blue-600 to-indigo-600 border-blue-400/60 text-white shadow-blue-500/20",
    "from-purple-600 to-pink-600 border-purple-400/60 text-white shadow-purple-500/20",
    "from-emerald-600 to-teal-600 border-emerald-400/60 text-white shadow-emerald-500/20",
    "from-amber-500 to-orange-600 border-amber-400/60 text-white shadow-amber-500/20",
    "from-cyan-600 to-blue-600 border-cyan-400/60 text-white shadow-cyan-500/20",
    "from-rose-600 to-pink-600 border-rose-400/60 text-white shadow-rose-500/20",
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 to-[#0a1128] overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            What Our Students{" "}
            <span className="text-blue-400">Say About Us</span>
          </h2>
        </div>

        <div className="h-9"></div>

        {/* Feedback Section - Desktop Marquee */}
        <div className="hidden md:block relative overflow-hidden">
          <div className="flex gap-6 animate-scrollX">
            {[...feedbacks, ...feedbacks].map((fb, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    {/* Character Letter Avatar */}
                    <div className={`w-13 h-13 min-w-[3.25rem] min-h-[3.25rem] rounded-2xl bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} border-2 flex items-center justify-center font-black text-base shadow-lg tracking-wider`}>
                      {getInitials(fb.name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{fb.name}</h3>
                      {fb.role && <p className="text-xs text-blue-400 font-medium">{fb.role}</p>}
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    “{fb.feedback}”
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Carousel */}
        <div className="block md:hidden">
          <Slider {...sliderSettings}>
            {feedbacks.map((fb, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-13 h-13 min-w-[3.25rem] min-h-[3.25rem] rounded-2xl bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} border-2 flex items-center justify-center font-black text-base shadow-lg tracking-wider`}>
                    {getInitials(fb.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{fb.name}</h3>
                    {fb.role && <p className="text-xs text-blue-400 font-medium">{fb.role}</p>}
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  “{fb.feedback}”
                </p>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Animation Styles */}
      <style>
        {`
          @keyframes scrollX {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scrollX {
            display: flex;
            animation: scrollX 15s linear infinite;
          }
        `}
      </style>
    </section>
  );
};

export default StudentFeedback;