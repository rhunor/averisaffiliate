"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, BookOpen, Trash2, ChevronDown, ChevronRight, CheckCircle, XCircle, PlayCircle, Cloud, Upload, X, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  cloudinaryVideoUrl: string;
  cloudinaryPublicId: string;
  duration: number;
  isPublished: boolean;
  sortOrder: number;
  group: string | null;
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

function getCloudinaryThumb(url: string): string {
  return url
    .replace("/video/upload/", "/video/upload/so_0,w_120,h_90,c_fill/")
    .replace(/\.(mp4|mov|avi|webm|mkv)(\?.*)?$/i, ".jpg");
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

  // Lesson edit state
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", youtubeUrl: "", group: "", description: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Video source toggle
  const [videoSource, setVideoSource] = useState<"youtube" | "cloudinary">("youtube");

  // Cloudinary state
  const [cloudInputMode, setCloudInputMode] = useState<"paste" | "upload">("paste");
  const [cloudPastedUrl, setCloudPastedUrl] = useState("");
  const [cloudFile, setCloudFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cloudUploadedUrl, setCloudUploadedUrl] = useState("");
  const [cloudUploadedPublicId, setCloudUploadedPublicId] = useState("");
  const [cloudUploadedDuration, setCloudUploadedDuration] = useState(0);
  const [cloudError, setCloudError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function extractCloudinaryPublicId(url: string): string {
    const m = url.match(/\/upload\/(?:v\d+\/)?(.+?)(\.[a-z0-9]+)?$/i);
    return m ? m[1] : url;
  }

  function applyPastedCloudinaryUrl(url: string) {
    const trimmed = url.trim();
    setCloudPastedUrl(trimmed);
    if (trimmed && trimmed.includes("res.cloudinary.com")) {
      setCloudUploadedUrl(trimmed);
      setCloudUploadedPublicId(extractCloudinaryPublicId(trimmed));
    } else {
      setCloudUploadedUrl("");
      setCloudUploadedPublicId("");
    }
  }

  const previewId = extractYouTubeId(lessonForm.youtubeUrl);

  function resetCloudinary() {
    setCloudInputMode("paste");
    setCloudPastedUrl("");
    setCloudFile(null);
    setUploading(false);
    setUploadProgress(0);
    setCloudUploadedUrl("");
    setCloudUploadedPublicId("");
    setCloudUploadedDuration(0);
    setCloudError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function resetLessonForm() {
    setLessonForm(defaultLessonForm);
    setVideoSource("youtube");
    resetCloudinary();
    setLessonError("");
  }

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

  async function uploadToCloudinary() {
    if (!cloudFile) return;
    setCloudError("");
    setUploading(true);
    setUploadProgress(0);

    try {
      // Get signed upload params from server
      const sigRes = await fetch("/api/admin/upload/signature", { method: "POST" });
      if (!sigRes.ok) throw new Error("Failed to get upload signature.");
      const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json();

      // Upload directly to Cloudinary via XHR (supports progress)
      await new Promise<void>((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", cloudFile);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", folder);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            setCloudUploadedUrl(data.secure_url);
            setCloudUploadedPublicId(data.public_id);
            setCloudUploadedDuration(data.duration || 0);
            setUploadProgress(100);
            resolve();
          } else {
            reject(new Error("Upload failed. Try again."));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload."));
        xhr.send(formData);
      });
    } catch (err) {
      setCloudError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function addLesson(e: { preventDefault(): void }, courseId: string) {
    e.preventDefault();
    setLessonError("");
    setAddingLesson(true);
    try {
      const body: Record<string, unknown> = {
        title: lessonForm.title,
        description: lessonForm.description,
        duration: parseInt(lessonForm.duration) || (videoSource === "cloudinary" ? Math.round(cloudUploadedDuration) : 0),
      };

      if (videoSource === "youtube") {
        body.youtubeUrl = lessonForm.youtubeUrl;
      } else {
        body.cloudinaryVideoUrl = cloudUploadedUrl;
        body.cloudinaryPublicId = cloudUploadedPublicId;
      }

      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setLessonError(json.error || "Failed."); return; }
      setShowLessonForm(null);
      resetLessonForm();
      await fetchLessons(courseId);
      fetchCourses();
    } finally {
      setAddingLesson(false);
    }
  }

  function startEdit(lesson: Lesson) {
    setEditingLesson(lesson._id);
    setEditForm({
      title: lesson.title,
      youtubeUrl: lesson.youtubeVideoId ? `https://youtu.be/${lesson.youtubeVideoId}` : "",
      group: lesson.group || "",
      description: lesson.description || "",
    });
    setEditError("");
  }

  async function saveEdit(e: { preventDefault(): void }, courseId: string, lessonId: string) {
    e.preventDefault();
    setEditError("");
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          youtubeUrl: editForm.youtubeUrl || undefined,
          group: editForm.group || null,
          description: editForm.description,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setEditError(json.error || "Failed to save."); return; }
      setEditingLesson(null);
      await fetchLessons(courseId);
    } finally {
      setSavingEdit(false);
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

  const canSubmitLesson =
    videoSource === "youtube" ? !!previewId : !!cloudUploadedUrl;

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
          <strong className="text-foreground">Video hosting:</strong>
          <span className="text-muted-foreground"> Paste a YouTube URL (set to <em>Unlisted</em>) or upload directly to Cloudinary for videos that can&apos;t go on YouTube.</span>
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
                            <div key={lesson._id}>
                              <div className="flex items-center justify-between px-5 py-3 bg-muted/20">
                                <div className="flex items-center gap-3">
                                  {lesson.cloudinaryVideoUrl ? (
                                    <div className="relative w-12 h-9 rounded-md overflow-hidden bg-black shrink-0">
                                      <img
                                        src={getCloudinaryThumb(lesson.cloudinaryVideoUrl)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                      />
                                      <div className="absolute bottom-0 right-0 bg-blue-600 rounded-tl px-1 py-0.5">
                                        <Cloud className="h-2.5 w-2.5 text-white" />
                                      </div>
                                    </div>
                                  ) : lesson.youtubeVideoId ? (
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
                                      {lesson.cloudinaryVideoUrl
                                        ? <span className="text-blue-500 font-medium">Cloudinary</span>
                                        : lesson.youtubeVideoId && <span className="font-mono">{lesson.youtubeVideoId}</span>
                                      }
                                      {lesson.duration > 0 && ` · ${formatDuration(lesson.duration)}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => editingLesson === lesson._id ? setEditingLesson(null) : startEdit(lesson)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-colors"
                                    title="Edit lesson"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button onClick={() => deleteLesson(course._id, lesson._id)}
                                    className="p-1.5 rounded-lg text-danger/60 hover:text-danger hover:bg-danger/10 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Inline edit form */}
                              {editingLesson === lesson._id && (
                                <form
                                  onSubmit={(e) => saveEdit(e, course._id, lesson._id)}
                                  className="px-5 py-4 bg-secondary/5 border-t border-secondary/20 space-y-3"
                                >
                                  {editError && (
                                    <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{editError}</p>
                                  )}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs font-medium text-muted-foreground block mb-1">Title</label>
                                      <input
                                        value={editForm.title}
                                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                                        required
                                        className="w-full bg-white border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-muted-foreground block mb-1">Group / Section name</label>
                                      <input
                                        value={editForm.group}
                                        onChange={(e) => setEditForm((f) => ({ ...f, group: e.target.value }))}
                                        placeholder="e.g. Part 3: DM Sales Closing"
                                        className="w-full bg-white border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1">YouTube URL</label>
                                    <input
                                      value={editForm.youtubeUrl}
                                      onChange={(e) => setEditForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
                                      placeholder="https://youtu.be/..."
                                      className="w-full bg-white border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="submit"
                                      disabled={savingEdit}
                                      className="bg-secondary text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-secondary-dark transition-colors disabled:opacity-60"
                                    >
                                      {savingEdit ? "Saving…" : "Save changes"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { setEditingLesson(null); setEditError(""); }}
                                      className="bg-muted text-muted-foreground text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-border transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              )}
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
                                placeholder={videoSource === "cloudinary" && cloudUploadedDuration ? String(Math.round(cloudUploadedDuration)) : "e.g. 600 for 10 min"}
                                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                            </div>
                          </div>

                          {/* Video source toggle */}
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Video source</label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => { setVideoSource("youtube"); resetCloudinary(); }}
                                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                                  videoSource === "youtube"
                                    ? "bg-[#ff0000]/10 text-[#ff0000] border border-[#ff0000]/20"
                                    : "bg-muted text-muted-foreground border border-transparent hover:bg-border"
                                }`}
                              >
                                <PlayCircle className="h-3.5 w-3.5" />
                                YouTube
                              </button>
                              <button
                                type="button"
                                onClick={() => { setVideoSource("cloudinary"); setLessonForm((f) => ({ ...f, youtubeUrl: "" })); }}
                                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                                  videoSource === "cloudinary"
                                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                                    : "bg-muted text-muted-foreground border border-transparent hover:bg-border"
                                }`}
                              >
                                <Cloud className="h-3.5 w-3.5" />
                                Upload to Cloudinary
                              </button>
                            </div>
                          </div>

                          {/* YouTube section */}
                          {videoSource === "youtube" && (
                            <>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground block mb-1.5">YouTube URL</label>
                                <input
                                  type="text"
                                  value={lessonForm.youtubeUrl}
                                  onChange={(e) => setLessonForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
                                  placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                                  className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                                />
                                {lessonForm.youtubeUrl && (
                                  <p className={`text-xs mt-1 ${previewId ? "text-success" : "text-danger"}`}>
                                    {previewId ? `✓ Video ID: ${previewId}` : "✗ Could not extract video ID — check the URL"}
                                  </p>
                                )}
                              </div>
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
                            </>
                          )}

                          {/* Cloudinary section */}
                          {videoSource === "cloudinary" && (
                            <div className="space-y-3">
                              {/* Sub-toggle: Paste URL / Upload file */}
                              {!cloudUploadedUrl && (
                                <div className="flex rounded-xl border border-border overflow-hidden text-xs font-semibold w-fit">
                                  <button
                                    type="button"
                                    onClick={() => { setCloudInputMode("paste"); setCloudFile(null); setCloudError(""); }}
                                    className={`px-3 py-1.5 transition-colors ${cloudInputMode === "paste" ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-muted"}`}
                                  >
                                    Paste URL
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { setCloudInputMode("upload"); setCloudPastedUrl(""); setCloudUploadedUrl(""); setCloudUploadedPublicId(""); }}
                                    className={`px-3 py-1.5 transition-colors ${cloudInputMode === "upload" ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-muted"}`}
                                  >
                                    Upload file
                                  </button>
                                </div>
                              )}

                              {/* Paste URL mode */}
                              {cloudInputMode === "paste" && !cloudUploadedUrl && (
                                <div>
                                  <input
                                    type="url"
                                    value={cloudPastedUrl}
                                    onChange={(e) => applyPastedCloudinaryUrl(e.target.value)}
                                    placeholder="https://res.cloudinary.com/..."
                                    className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono"
                                  />
                                  {cloudPastedUrl && !cloudUploadedUrl && (
                                    <p className="text-xs text-danger mt-1">Not a valid Cloudinary URL</p>
                                  )}
                                </div>
                              )}

                              {/* Upload file mode */}
                              {cloudInputMode === "upload" && !cloudUploadedUrl && (
                                <>
                                  <div
                                    className="border-2 border-dashed border-blue-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                  >
                                    <Upload className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-foreground">
                                      {cloudFile ? cloudFile.name : "Click to choose a video file"}
                                    </p>
                                    {cloudFile ? (
                                      <p className="text-xs text-muted-foreground mt-1">{(cloudFile.size / 1024 / 1024).toFixed(1)} MB</p>
                                    ) : (
                                      <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI, WebM supported</p>
                                    )}
                                  </div>
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) { setCloudFile(f); setCloudError(""); }
                                    }}
                                  />

                                  {cloudError && (
                                    <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-xl px-3 py-2">{cloudError}</p>
                                  )}

                                  {uploading && (
                                    <div>
                                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                        <span>Uploading…</span>
                                        <span>{uploadProgress}%</span>
                                      </div>
                                      <div className="w-full bg-border rounded-full h-2">
                                        <div
                                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                          style={{ width: `${uploadProgress}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {cloudFile && !uploading && (
                                    <button
                                      type="button"
                                      onClick={uploadToCloudinary}
                                      className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                                    >
                                      <Upload className="h-4 w-4" />
                                      Upload video
                                    </button>
                                  )}
                                </>
                              )}

                              {/* Success state (shared between paste and upload) */}
                              {cloudUploadedUrl && (
                                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                  <img
                                    src={getCloudinaryThumb(cloudUploadedUrl)}
                                    alt="Video thumbnail"
                                    className="w-20 h-14 object-cover rounded-lg bg-black shrink-0"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                                      <CheckCircle className="h-3.5 w-3.5" /> Video ready
                                    </p>
                                    {cloudUploadedDuration > 0 && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        Duration: {formatDuration(Math.round(cloudUploadedDuration))}
                                      </p>
                                    )}
                                    <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">{cloudUploadedPublicId}</p>
                                  </div>
                                  <button type="button" onClick={resetCloudinary} className="p-1 text-muted-foreground hover:text-danger transition-colors shrink-0">
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Description (optional)</label>
                            <textarea value={lessonForm.description} onChange={(e) => setLessonForm((f) => ({ ...f, description: e.target.value }))} rows={2}
                              className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-none" />
                          </div>

                          <div className="flex gap-3">
                            <button type="submit" disabled={addingLesson || !canSubmitLesson}
                              className="bg-secondary text-white font-semibold px-4 py-2 rounded-xl hover:bg-secondary-dark transition-colors disabled:opacity-60 text-sm">
                              {addingLesson ? "Adding…" : "Add lesson"}
                            </button>
                            <button type="button" onClick={() => { setShowLessonForm(null); resetLessonForm(); }}
                              className="bg-muted text-muted-foreground font-semibold px-4 py-2 rounded-xl hover:bg-border transition-colors text-sm">
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="px-5 py-3 border-t border-border">
                          <button
                            onClick={() => { setShowLessonForm(course._id); resetLessonForm(); }}
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
