import { Link } from 'react-router-dom'
import { Target, BookOpen, Award, PlayCircle, Clock, ExternalLink, Search, Download, CheckCircle2 } from 'lucide-react'
import type { PlatformAnalyticsData, PopularCourse } from './types'

interface CourseEngagementSectionProps {
  data: PlatformAnalyticsData | null
  filteredCourses: PopularCourse[]
  courseSearch: string
  setCourseSearch: (v: string) => void
  selectedCategory: string
  setSelectedCategory: (v: string) => void
  onExportCsv: () => void
}

export default function CourseEngagementSection({ data, filteredCourses, courseSearch, setCourseSearch, selectedCategory, setSelectedCategory, onExportCsv }: CourseEngagementSectionProps) {
  // Course Engagement & Popular Courses Section (User Request Addition)
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" /> Course engagement & popularity rankings
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            How many courses are played, active curriculum engagement, and learner completion rates.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
            {data?.coursesAndLearning.coursesPlayed ?? 4} Courses Active / Played
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
            {data?.coursesAndLearning.certificatesReleased ?? 43} Certificates Released
          </span>
        </div>
      </div>

      {/* 5 Summary Stat Pills for Courses */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <PlayCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Courses Played</span>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {data?.coursesAndLearning.coursesPlayed ?? 4}{' '}
            <span className="text-xs font-normal text-slate-400">/ {data?.coursesAndLearning.totalCourses ?? 6} total</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            <span>Lessons Completed</span>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {data?.coursesAndLearning.lessonsCompleted ?? 84}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-purple-500" />
            <span>Video Watch Time</span>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {data?.coursesAndLearning.totalWatchMinutes ?? 142}{' '}
            <span className="text-xs font-normal text-slate-400">mins</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
            <span>Quiz Pass Rate</span>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {data?.coursesAndLearning.quizStats?.passRate ?? 87}%{' '}
            <span className="text-[11px] font-normal text-slate-400">
              ({data?.coursesAndLearning.quizStats?.avgScore ?? 84} avg)
            </span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Certificates Issued</span>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {data?.coursesAndLearning.certificatesReleased ?? 43}
          </p>
        </div>
      </div>

      {/* Filter, Search & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['all', 'Excel & Analytics', 'Product Management', 'Sales & Growth'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Search & Export Action */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              placeholder="Filter courses..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-40 sm:w-48"
            />
          </div>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all"
            title="Export Course Performance CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Popular Courses Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
              <th className="pb-2.5">Course Name</th>
              <th className="pb-2.5">Category</th>
              <th className="pb-2.5">Enrollments</th>
              <th className="pb-2.5">Completion Rate</th>
              <th className="pb-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course, idx) => (
                <tr key={course.id || idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 pr-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="truncate max-w-[280px]">{course.title}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-slate-500">{course.category}</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{course.enrollmentCount}</span>
                      <span className="text-slate-400 text-[10px]">learners</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2 max-w-[140px]">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0F172A] h-full rounded-full"
                          style={{ width: `${Math.max(course.completionRate, 5)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-900 w-9 text-right">
                        {course.completionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/courses/${course.slug}`}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                  No courses match your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
