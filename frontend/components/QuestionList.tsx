import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Search, Circle, Tag, Filter } from 'lucide-react';
import { questions } from '../data/questions';
import { useProgress } from '../context/ProgressContext';
import { Difficulty } from '../types';

const PAGE_SIZE = 10;
const PAGE_WINDOW = 5; // 👈 show only 5 pages at a time

const QuestionList: React.FC = () => {
  const { progress } = useProgress();
  const [filterTopic, setFilterTopic] = useState<string>('All');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'All'>('All');
  const [filterExam, setFilterExam] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const topics = useMemo(() => {
    const t = new Set(questions.map(q => q.topic));
    return ['All', ...Array.from(t).sort()];
  }, []);

  const exams = useMemo(() => {
    const e = new Set(questions.map(q => q.exam).filter((exam): exam is string => !!exam));
    return ['All', ...Array.from(e).sort()];
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesTopic = filterTopic === 'All' || q.topic === filterTopic;
      const matchesDifficulty = filterDifficulty === 'All' || q.level === filterDifficulty;
      const matchesExam = filterExam === 'All' || q.exam === filterExam;
      const matchesSearch = 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.id.toString().includes(searchTerm) ||
        q.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.exam && q.exam.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesTopic && matchesDifficulty && matchesExam && matchesSearch;
    });
  }, [filterTopic, filterDifficulty, filterExam, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterTopic, filterDifficulty, filterExam, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredQuestions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredQuestions, currentPage]);

  // 🔥 Windowed pagination logic (5 pages at a time)
  const visiblePages = useMemo(() => {
    const startWindow = Math.floor((currentPage - 1) / PAGE_WINDOW) * PAGE_WINDOW;
    const windowPages = Math.min(PAGE_WINDOW, totalPages - startWindow);

    return Array.from({ length: windowPages }, (_, i) => startWindow + i + 1);
  }, [currentPage, totalPages]);

  const startRange = filteredQuestions.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endRange = filteredQuestions.length === 0
    ? 0
    : Math.min(currentPage * PAGE_SIZE, filteredQuestions.length);

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getDifficultyColor = (level: Difficulty) => {
    switch (level) {
      case 'easy': return 'text-green-700 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (id: number) => {
    const solved = progress.solvedQuestions[id];
    if (!solved) return <Circle className="h-4 w-4 text-gray-300" />;
    return solved.correct ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Problem Set</h1>
            <p className="text-gray-500 mt-1">Practice specific topics or challenge yourself.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Difficulty Filter */}
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            {(['All', 'easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setFilterDifficulty(d)}
                className={`
                    px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all
                    ${filterDifficulty === d 
                        ? 'bg-blue-50 text-blue-700 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Exam Filter */}
          <div className="relative">
            <select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer hover:bg-gray-50 transition-all"
            >
              {exams.map((exam) => (
                <option key={exam} value={exam}>
                  {exam === 'All' ? 'All Exams' : exam}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Search */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search ID, Code, Exam..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Horizontal Topic Scroll */}
      <div className="mb-8 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex space-x-2">
          {topics.map((t) => (
            <button 
              key={t}
              onClick={() => setFilterTopic(t)}
              className={`
                whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm border
                ${filterTopic === t 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}
              `}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-4 w-16 text-xs font-semibold text-gray-500">Status</th>
                        <th className="px-6 py-4 w-24 text-xs font-semibold text-gray-500">Code</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">Title</th>
                        <th className="px-6 py-4 w-32 text-xs font-semibold text-gray-500">Difficulty</th>
                        <th className="px-6 py-4 hidden sm:table-cell text-xs font-semibold text-gray-500">Topic</th>
                        <th className="px-6 py-4 w-32 text-xs font-semibold text-gray-500">Exam</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedQuestions.map((q) => (
                        <tr key={q.id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4 text-center">{getStatusIcon(q.id)}</td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 font-mono border group-hover:bg-white group-hover:border-blue-200">
                                    {q.code}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <Link
                                  to={`/question/${q.id}`}
                                  className="text-sm font-medium text-gray-900 group-hover:text-blue-600"
                                >
                                  {q.question.substring(0, 80)}{q.question.length > 80 ? '...' : ''}
                                </Link>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-0.5 text-xs rounded-full border ${getDifficultyColor(q.level)}`}>
                                    {q.level}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm hidden sm:table-cell">
                              <span className="inline-flex items-center px-2 py-1 bg-gray-50 border rounded-full">
                                    <Tag className="h-3 w-3 mr-1.5 text-gray-400" />
                                    {q.topic}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {q.exam ? (
                                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs bg-purple-50 text-purple-700 border">
                                        {q.exam}
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                )}
                            </td>
                        </tr>
                    ))}

                    {filteredQuestions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                  <div className="bg-gray-50 p-4 rounded-full mb-3">
                                      <Search className="h-6 w-6 text-gray-300" />
                                  </div>
                                  <p className="font-medium">No questions found</p>
                                  <p className="text-sm text-gray-400 mt-1">Try adjusting filters</p>
                              </div>
                          </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Footer + Pagination */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500 text-center sm:text-left">
            Showing <span className="font-semibold text-gray-900">{startRange}</span>
            {filteredQuestions.length > 0 && <> - <span className="font-semibold text-gray-900">{endRange}</span></>}
            {" "}of <span className="font-semibold text-gray-900">{filteredQuestions.length}</span> questions
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm overflow-hidden">
                <button
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm text-gray-500 disabled:text-gray-300"
                >
                    Prev
                </button>

                <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto max-w-[260px] scrollbar-hide">
                    {visiblePages.map(page => (
                        <button
                            key={page}
                            onClick={() => changePage(page)}
                            className={`w-8 h-8 rounded-full text-xs font-semibold
                              ${currentPage === page 
                                ? 'bg-blue-600 text-white shadow' 
                                : 'text-gray-500 hover:bg-gray-100'}
                            `}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm text-gray-500 disabled:text-gray-300"
                >
                    Next
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionList;
