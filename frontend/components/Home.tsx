
import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Star, BookOpen, Layers, BarChart3, ChevronLeft, ChevronRight, Brain, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const testimonials = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Software Engineer",
    image: "https://img.freepik.com/premium-photo/software-engineer-digital-avatar-generative-ai_934475-8997.jpg",
    rating: 5,
    text: "This platform helped me crack my placement aptitude tests. The streak feature kept me consistent for 30 days!"
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Class 12 Student",
    image: "https://img.freepik.com/free-vector/sticker-template-with-portrait-student-girl-school-uniform_1308-63582.jpg?semt=ais_hybrid&w=740&q=80",
    rating: 5,
    text: "I love the clean UI and the detailed explanations. The gamification with Paisa makes practicing actually fun."
  },
  {
    id: 3,
    name: "Sushant Sharma",
    role: "4th Year B.Tech Student",
    image: "https://img.freepik.com/free-photo/portrait-delighted-hipster-male-student-with-crisp-hair_176532-8157.jpg?semt=ais_hybrid&w=740&q=80",
    rating: 4.5,
    text: "Great collection of questions. The hard modules really pushed my limits. Highly recommended for beginners."
  },
  {
    id: 4,
    name: "Abhinav Singh",
    role: "CDS Aspirant",
    image: "https://static.vecteezy.com/system/resources/thumbnails/052/878/632/small/a-portrait-of-a-young-serviceman-in-uniform-showcasing-military-attire-with-shoulder-insignia-on-a-neutral-background-free-vector.jpg",
    rating: 5,
    text: "The timer feature simulates real exam pressure perfectly. I've improved my speed by 40% in just two weeks."
  },
  {
    id: 5,
    name: "Sahil Thakur",
    role: "Bank PO Aspirant",
    image: "https://plus.unsplash.com/premium_photo-1689708721750-8a0e6dc14cee?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fG1hbiUyMGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
    rating: 5,
    text: "Logical reasoning modules are top-notch. The hints help me learn without just giving away the answer immediately."
  },
  {
    id: 6,
    name: "Aakriti Sharma",
    role: "DSA enthusiast",
    image: "https://img.freepik.com/premium-vector/young-man-avatar-character-due-avatar-man-vector-icon-cartoon-illustration_1186924-4438.jpg?semt=ais_hybrid&w=740&q=80",
    rating: 5,
    text: "The unique question codes (RT1, STD1) make it so easy to discuss specific problems with my study group."
  },
  {
    id: 7,
    name: "Anushka Rana",
    role: "BCA student",
    image: "https://img.freepik.com/premium-vector/portrait-business-woman_505024-2780.jpg?semt=ais_hybrid&w=740&q=80",
    rating: 4,
    text: "I was weak in Probability, but the filtered practice sets helped me master the basics in just a few days.I got placed."
  }
];

const modules = [
  { name: 'Quantitative', count: '500+ Qs', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Logical', count: '300+ Qs', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'Verbal', count: '200+ Qs', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
  { name: 'Data Interpret', count: '150+ Qs', icon: Layers, color: 'text-orange-600', bg: 'bg-orange-50' },
];

const Home: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleStartPractice = () => {
    if (isAuthenticated) {
      navigate('/problems');
    } else {
      setAuthModalOpen(true);
    }
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 400; // Approx card width
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate pt-14">
        {/* Background Gradient */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
          />
        </div>

        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-8 flex justify-center">
                <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 bg-white/50 backdrop-blur-sm">
                  New challenges added daily. 
                  <button onClick={handleStartPractice} className="ml-1 font-semibold text-blue-600">
                    <span className="absolute inset-0" aria-hidden="true" />Start Solving <span aria-hidden="true">&rarr;</span>
                  </button>
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Level Up Your <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Aptitude Skills</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                The gamified platform for job seekers and students. Solve LeetCode-style aptitude questions, maintain your streak, and earn Paisa to unlock exclusive rewards.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
                {!isAuthenticated ? (
                  <>
                     <button
                        onClick={() => setAuthModalOpen(true)}
                        className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 flex items-center justify-center transition-all transform hover:scale-105"
                      >
                        Join Now - It's Free
                      </button>
                      <button 
                        onClick={() => setAuthModalOpen(true)} 
                        className="w-full sm:w-auto rounded-xl px-8 py-3.5 text-sm font-semibold text-gray-900 ring-1 ring-gray-900/10 hover:ring-gray-900/20 hover:bg-gray-50 flex items-center justify-center transition-all"
                      >
                        Login <ArrowRight className="ml-2 h-4 w-4 text-gray-500" />
                      </button>
                  </>
                ) : (
                   <Link
                    to="/problems"
                    className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 flex items-center justify-center transition-all transform hover:scale-105"
                  >
                    Continue Practice <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Stats Banner */}
            <div className="mt-16 sm:mt-24 border-y border-gray-200 bg-white/50 py-8 backdrop-blur-sm">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-8 text-center sm:grid-cols-3">
                    <div className="mx-auto flex max-w-xs flex-col gap-y-2">
                        <dt className="text-base leading-7 text-gray-600">Total Questions</dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">1,000+</dd>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col gap-y-2">
                        <dt className="text-base leading-7 text-gray-600">Active Users</dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">500+</dd>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col gap-y-2">
                        <dt className="text-base leading-7 text-gray-600">Modules Covered</dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">25+</dd>
                    </div>
                </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Explore Modules Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
                <h2 className="text-base font-semibold leading-7 text-blue-600">Curriculum</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Explore Modules
                </p>
                <p className="mt-4 text-lg text-gray-600">
                    Comprehensive coverage of all major aptitude topics divided into easy-to-digest modules.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {modules.map((module) => (
                    <div key={module.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center">
                         <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${module.bg}`}>
                            <module.icon className={`h-6 w-6 ${module.color}`} />
                         </div>
                         <h3 className="text-lg font-bold text-gray-900">{module.name}</h3>
                         <p className="text-sm text-gray-500 mt-2">{module.count}</p>
                         <button onClick={handleStartPractice} className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500">
                            View Questions &rarr;
                         </button>
                    </div>
                ))}
            </div>

            <div className="text-center">
                 <button onClick={handleStartPractice} className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500">
                    See all 50+ topics <span aria-hidden="true">→</span>
                </button>
            </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 sm:py-32 bg-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    What Users Say
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                    Join thousands of satisfied students and professionals.
                </p>
            </div>

            <div className="relative">
                {/* Desktop Navigation Buttons */}
                <button 
                  onClick={() => scrollSlider('left')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 shadow-md text-gray-600 hover:bg-gray-50 focus:outline-none"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => scrollSlider('right')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 shadow-md text-gray-600 hover:bg-gray-50 focus:outline-none"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Slider Container */}
                <div 
                  ref={sliderRef}
                  className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide px-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {testimonials.map((t) => (
                        <div 
                          key={t.id} 
                          className="flex-none w-[85vw] sm:w-[350px] md:w-[400px] snap-center bg-gray-50 rounded-2xl p-8 border border-gray-100 relative select-none"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <img src={t.image} alt={t.name} className="h-16 w-16 rounded-full border-2 border-white shadow-sm object-cover" />
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{t.name}</h3>
                                    <p className="text-xs text-gray-500">{t.role}</p>
                                </div>
                            </div>
                            <div className="flex mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed italic">
                                "{t.text}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default Home;
