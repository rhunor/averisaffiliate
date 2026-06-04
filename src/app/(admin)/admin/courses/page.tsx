"use client";

import { useEffect, useState } from "react";
import { Plus, BookOpen, Trash2, ChevronDown, ChevronRight, CheckCircle, XCircle, PlayCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  duration: number;
  isPublished: boolean;
  sortOrder: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  moduleNumber: number;
  isPublished: boolean;
  lessonCount: number;
  totalDuration: number;
  sortOrder: number;
}

function extractYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

const defaultCourseForm = { title: "", description: "", moduleNumber: "", sortOrder: "" };
const defaultLessonForm = { title: "", description: "", youtubeUrl: "", duration: "" };

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState(defaultCourseForm);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [courseError, setCourseError] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [lessonLoading, setLessonLoading] = useState<string | null>(null);
  const [showLessonForm, setShowLessonForm] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState(defaultLessonForm);
  const [addingLesson, setAddingLesson] = useState(false);
  const [lessonError, setLessonError] = useState("");

  const previewId = extractYouTubeId(lessonForm.youtubeUrl);

  function fetchCourses() {
    setLoading(true);
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchCourses(); }, []);

  async function fetchLessons(courseId: string) {
    setLessonLoading(courseId);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`);
      const data = await res.json();
      if (data.lessons) setLessons((prev) => ({ ...prev, [courseId]: data.lessons }));
    } finally {
      setLessonLoading(null);
    }
  }

  async function toggleExpand(courseId: string) {
    if (expandedId === courseId) { setExpandedId(null); return; }
    setExpandedId(courseId);
    if (!lessons[courseId]) await fetchLessons(courseId);
  }

  async function createCourse(e: { preventDefault(): void }) {
    e.preventDefault();
    setCourseError("");
    setCreatingCourse(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseForm.title,
          description: courseForm.description,
          moduleNumber: parseInt(courseForm.moduleNumber),
          sortOrder: parseInt(courseForm.sortOrder) || parseInt(courseForm.moduleNumber),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setCourseError(json.error || "Failed."); return; }
      setShowCourseForm(false);
      setCourseForm(defaultCourseForm);
      fetchCourses();
    } finally {
      setCreatingCourse(false);
    }
  }

  async function togglePublish(courseId: string, isPublished: boolean) {
    await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    fetchCourses();
  }

  async function addLesson(e: { preventDefault(): void }, courseId: string) {
    e.preventDefault();
    setLessonError("");
    setAddingLesson(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonForm.title,
          description: lessonForm.description,
          youtubeUrl: lessonForm.youtubeUrl,
          duration: parseInt(lessonForm.duration) || 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setLessonError(json.error || "Failed."); return; }
      setShowLessonForm(null);
      setLessonForm(defaultLessonForm);
      await fetchLessons(courseId);
      fetchCourses();
    } finally {
      setAddingLesson(false);
    }
  }

  async function deleteLesson(courseId: string, lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    await fetch(`/api/admin/courses/${courseId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });
    await fetchLessons(courseId);
    fetchCourses();
  }

  const inputCls = "w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Courses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage Academy video courses</p>
        </div>
        <button
          onClick={() => { setShowCourseForm((v) => !v); setCourseError(""); }}
          className="flex items-center gap-2 bg-secondary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-secondary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          New course
        </button>
      </div>

      {/* How-to banner */}
      <div className="flex items-start gap-3 bg-[#ff0000]/5 border border-[#ff0000]/20 rounded-xl px-4 py-3 text-sm">
        <PlayCircle className="h-4 w-4 text-[#ff0000] mt-0.5 shrink-0" />
        <div>
          <strong className="text-foreground">YouTube upload flow:</strong>
          <span className="text-muted-foreground"> Upload your video to YouTube (set to <em>Unlisted</em>), then paste the YouTube URL below when adding a lesson. The video ID is extracted automatically.</span>
        </div>
      </div>

      {/* Create course form */}
      {showCourseForm && (
        <Card>
          <CardHeader><CardTitle>New Course</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={createCourse} className="space-y-4">
              {courseError && <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">{courseError}</p>}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Course title</label>
                <input value={courseForm.title} onChange={(e) => setCourseForm((f) => ({ ...f, title: e.target.value }))} required className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Description</label>
                <textarea value={courseForm.description} onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))} required rows={3}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Module number</label>
                  <input type="number" value={courseForm.moduleNumber} onChange={(e) => setCourseForm((f) => ({ ...f, moduleNumber: e.target.value }))} required min={1} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Sort order</label>
                  <input type="number" value={courseForm.sortOrder} onChange={(e) => setCourseForm((f) => ({ ...f, sortOrder: e.target.value }))} min={0} placeholder="Same as module" className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={creatingCourse}
                  className="bg-secondary text-white font-semibold px-5 py-2 rounded-xl hover:bg-secondary-dark transition-colors disabled:opacity-60 text-sm">
                  {creatingCourse ? "Creating…" : "Create course"}
                </button>
                <button type="button" onClick={() => setShowCourseForm(false)}
                  className="bg-muted text-muted-foreground font-semibold px-5 py-2 rounded-xl hover:bg-border transition-colors text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Courses list */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No courses yet. Create your first course above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course._id} className="overflow-hidden">
              {/* Course header */}
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => toggleExpand(course._id)}>
                <div className="flex items-center gap-3">
                  {expandedId === course._id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{course.title}</p>
                      <Badge variant="secondary" className="text-xs">M{course.moduleNumber}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}
                      {course.totalDuration > 0 && ` · ${formatDuration(course.totalDuration)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => togglePublish(course._id, course.isPublished)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      course.isPublished ? "bg-success/10 text-success hover:bg-success/20" : "bg-muted text-muted-foreground hover:bg-border"
                    }`}>
                    {course.isPublished ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {course.isPublished ? "Published" : "Draft"}
                  </button>
                </div>
              </div>

              {/* Lessons panel */}
              {expandedId === course._id && (
                <div className="border-t border-border">
                  {lessonLoading === course._id ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-secondary border-t-transparent" />
                    </div>
                  ) : (
                    <>
                      {(lessons[course._id] || []).length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">No lessons yet</div>
                      ) : (
                        <div className="divide-y divide-border">
                          {(lessons[course._id] || []).map((lesson, idx) => (
                            <div key={lesson._id} className="flex items-center justify-between px-5 py-3 bg-muted/20">
                              <div className="flex items-center gap-3">
                                {lesson.youtubeVideoId ? (
                                  <img
                                    src={`https://img.youtube.com/vi/${lesson.youtubeVideoId}/default.jpg`}
                                    alt=""
                                    className="w-12 h-9 object-cover rounded-md bg-black"
                                  />
                                ) : (
                                  <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {lesson.youtubeVideoId && <span className="font-mono">{lesson.youtubeVideoId}</span>}
                                    {lesson.duration > 0 && ` · ${formatDuration(lesson.duration)}`}
                                  </p>
                                </div>
                              </div>
                              <button onClick={() => deleteLesson(course._id, lesson._id)}
                                className="p-1.5 rounded-lg text-danger/60 hover:text-danger hover:bg-danger/10 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add lesson form */}
                      {showLessonForm === course._id ? (
                        <form onSubmit={(e) => addLesson(e, course._id)} className="p-5 space-y-4 border-t border-border bg-muted/10">
                          {lessonError && <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">{lessonError}</p>}

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Lesson title</label>
                              <input value={lessonForm.title} onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))} required
                                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Duration (seconds)</label>
                              <input type="number" value={lessonForm.duration} onChange={(e) => setLessonForm((f) => ({ ...f, duration: e.target.value }))} min={0}
                                placeholder="e.g. 600 for 10 min"
                                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">YouTube URL</label>
                            <input
                              type="text"
                              value={lessonForm.youtubeUrl}
                              onChange={(e) => setLessonForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
                              required
                              placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                              className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                            />
                            {lessonForm.youtubeUrl && (
                              <p className={`text-xs mt-1 ${previewId ? "text-success" : "text-danger"}`}>
                                {previewId ? `✓ Video ID: ${previewId}` : "✗ Could not extract video ID — check the URL"}
                              </p>
                            )}
                          </div>

                          {/* Thumbnail preview */}
                          {previewId && (
                            <div className="flex items-center gap-3 p-3 bg-white border border-border rounded-xl">
                              <img
                                src={`https://img.youtube.com/vi/${previewId}/hqdefault.jpg`}
                                alt="Thumbnail"
                                className="w-24 h-16 object-cover rounded-lg bg-black"
                              />
                              <div>
                                <p className="text-xs font-semibold text-foreground">Thumbnail preview</p>
                                <p className="text-xs text-muted-foreground font-mono mt-0.5">{previewId}</p>
                                <a
                                  href={`https://youtu.be/${previewId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-secondary hover:underline mt-1 inline-block"
                                >
                                  Open on YouTube →
                                </a>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Description (optional)</label>
                            <textarea value={lessonForm.description} onChange={(e) => setLessonForm((f) => ({ ...f, description: e.target.value }))} rows={2}
                              className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-none" />
                          </div>

                          <div className="flex gap-3">
                            <button type="submit" disabled={addingLesson || !previewId}
                              className="bg-secondary text-white font-semibold px-4 py-2 rounded-xl hover:bg-secondary-dark transition-colors disabled:opacity-60 text-sm">
                              {addingLesson ? "Adding…" : "Add lesson"}
                            </button>
                            <button type="button" onClick={() => { setShowLessonForm(null); setLessonForm(defaultLessonForm); setLessonError(""); }}
                              className="bg-muted text-muted-foreground font-semibold px-4 py-2 rounded-xl hover:bg-border transition-colors text-sm">
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="px-5 py-3 border-t border-border">
                          <button
                            onClick={() => { setShowLessonForm(course._id); setLessonForm(defaultLessonForm); setLessonError(""); }}
                            className="flex items-center gap-2 text-sm text-secondary hover:text-secondary-dark transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                            Add lesson
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
