import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Upload, Plus, Trash2, Calculator } from "lucide-react";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, Panel, Notice } from "../components/Primitives.jsx";
import { makeSemesterSubjects } from "../config/vtuScheme2022.js";
import { extractMarks, saveSgpa } from "../services/students.js";

export const Route = createFileRoute("/student/calculate-sgpa")({ component: CalculateSGPA });

const gradeFor = (marks) => {
  const value = Number(marks);
  if (!Number.isFinite(value) || value < 0 || value > 100) return null;
  if (value >= 90) return { letter: "O", point: 10 };
  if (value >= 80) return { letter: "A+", point: 9 };
  if (value >= 70) return { letter: "A", point: 8 };
  if (value >= 60) return { letter: "B+", point: 7 };
  if (value >= 55) return { letter: "B", point: 6 };
  if (value >= 50) return { letter: "C", point: 5 };
  if (value >= 40) return { letter: "P", point: 4 };
  return { letter: "F", point: 0 };
};
const totalFor = (subject) => subject.total === "" ? Number.NaN : Number(subject.total);
function CalculateSGPA() {
  const [semester, setSemester] = useState(1);
  const [subjects, setSubjects] = useState(makeSemesterSubjects(1));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const graded = subjects.map((subject) => ({ ...subject, marks: totalFor(subject), grade: gradeFor(totalFor(subject)) }));
  const valid = graded.filter((subject) => subject.grade && Number(subject.credits) > 0);
  const credits = valid.reduce((sum, subject) => sum + Number(subject.credits), 0);
  const earnedCredits = valid.filter((subject) => subject.grade.point > 0).reduce((sum, subject) => sum + Number(subject.credits), 0);
  const sgpa = credits ? (valid.reduce((sum, subject) => sum + Number(subject.credits) * subject.grade.point, 0) / credits).toFixed(2) : null;

  function chooseSemester(next) {
    setSemester(next); setSubjects(makeSemesterSubjects(next)); setMessage(""); setError("");
  }
  function updateSubject(index, key, value) {
    setSubjects((current) => current.map((subject, i) => i === index ? { ...subject, [key]: value } : subject));
  }
  function handleFile(file) {
    if (!file) return;
    if (!/^(application\/pdf|image\/png|image\/jpeg)$/.test(file.type)) { setError("Upload a PDF, PNG, or JPEG marksheet."); return; }
    setUploading(true); setError(""); setMessage("");
    extractMarks(file, subjects.map(({ code }) => ({ code }))).then((result) => {
      const marks = result.marks || {};
      const extractedCount = Object.keys(marks).length;
      setSubjects((current) => current.map((subject) => Object.hasOwn(marks, subject.code) ? { ...subject, total: marks[subject.code] } : subject));
      setMessage(extractedCount ? (result.missingCodes?.length ? `Marks extracted. ${result.missingCodes.length} subject code(s) need manual totals.` : "Marks extracted. Please review every row before saving.") : "No subject codes matched. Please complete the form manually.");
    }).catch((err) => setError(err.message || "Could not extract the marksheet."))
      .finally(() => setUploading(false));
  }
  async function handleSave() {
    setError(""); setMessage("");
    if (!valid.length || valid.length !== subjects.length) { setError("Enter valid marks (0–100) and credits for every subject before saving."); return; }
    setSaving(true);
    try {
      const result = await saveSgpa({ semesterNumber: semester, subjects: graded.map((subject) => ({ code: subject.code, name: subject.name, credits: Number(subject.credits), marks: subject.marks })) });
      setMessage(`Semester ${semester} saved. Your updated CGPA is ${result.cgpa.toFixed(2)}.`);
    } catch (err) { setError(err.message || "Could not save SGPA."); }
    finally { setSaving(false); }
  }
  return <Shell role="student" breadcrumb="Calculate SGPA">
    <PageHeader eyebrow="Academic tools" title="Calculate SGPA" description="Calculate VTU 2022 Scheme SGPA from entered marks or an uploaded result card." />
    <div className="mb-6 flex flex-wrap gap-2">{Array.from({ length: 8 }, (_, i) => i + 1).map((item) => <button key={item} type="button" onClick={() => chooseSemester(item)} className={`rh-btn ${semester === item ? "rh-btn-primary" : "rh-btn-secondary"}`}>{item}{item === 1 ? "st" : item === 2 ? "nd" : item === 3 ? "rd" : "th"} Sem</button>)}</div>
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <Panel title={`Semester ${semester} marks`} description="Enter each subject's total marks out of 100. Grades update immediately.">
        <div className="[&_th:nth-child(4)]:hidden [&_th:nth-child(5)]:hidden [&_td:nth-child(4)]:hidden [&_td:nth-child(5)]:hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="border-b border-rule text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="p-3">Subject code</th><th className="p-3">Course name</th><th className="p-3">Credits</th><th className="p-3">CIE</th><th className="p-3">SEE</th><th className="p-3">Total / 100</th><th className="p-3">Grade</th><th className="p-3">Actions</th></tr></thead><tbody>{graded.map((subject, index) => <tr key={`${subject.code}-${index}`} className="border-b border-rule/60"><td className="p-2"><input className="rh-input min-w-28" value={subject.code} onChange={(e) => updateSubject(index, "code", e.target.value)} /></td><td className="p-2"><input className="rh-input min-w-56" value={subject.name} onChange={(e) => updateSubject(index, "name", e.target.value)} /></td><td className="p-2"><input aria-label="Credits" className="rh-input w-20" type="number" min="0" step="0.5" value={subject.credits} onChange={(e) => updateSubject(index, "credits", e.target.value)} /></td><td className="p-2"><input aria-label="CIE marks" className="rh-input w-20" type="number" min="0" max="100" value={subject.cie} onChange={(e) => updateSubject(index, "cie", e.target.value)} /></td><td className="p-2"><input aria-label="SEE marks" className="rh-input w-20" type="number" min="0" max="100" value={subject.see} onChange={(e) => updateSubject(index, "see", e.target.value)} /></td><td className="p-2"><input aria-label="Total marks" className="rh-input w-24" type="number" min="0" max="100" value={subject.total !== "" ? subject.total : (subject.cie !== "" || subject.see !== "" ? subject.marks : "")} onChange={(e) => updateSubject(index, "total", e.target.value)} /></td><td className="p-3"><span className="font-medium">{subject.grade ? `${subject.grade.letter} (${subject.grade.point})` : "—"}</span></td><td className="p-2"><button type="button" className="rh-btn rh-btn-ghost px-2" aria-label={`Remove ${subject.name || "subject"}`} onClick={() => setSubjects((current) => current.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>
        <button type="button" className="rh-btn rh-btn-secondary mt-4" onClick={() => setSubjects((current) => [...current, { code: "", name: "", credits: 3, total: "" }])}><Plus className="h-4 w-4" /> Add subject</button>
        </div>
      </Panel>
      <div className="space-y-6"><Panel title="Upload result card" description="PDF, PNG, or JPEG. Extracted values always remain editable."><input ref={inputRef} className="hidden" type="file" accept=".pdf,image/png,image/jpeg" onChange={(e) => handleFile(e.target.files?.[0])} /><button type="button" className="flex w-full flex-col items-center rounded-lg border-2 border-dashed border-rule p-6 text-center hover:bg-accent" onClick={() => inputRef.current?.click()} disabled={uploading}><Upload className="mb-2 h-6 w-6" />{uploading ? "Reading marksheet…" : "Choose a marksheet"}<span className="mt-1 text-xs text-muted-foreground">Maximum file size: 10 MB</span></button></Panel><Panel title="Your result"><div className="space-y-4"><div><p className="eyebrow">Calculated SGPA</p><p className="mt-1 text-4xl font-display">{sgpa ?? "—"}<span className="text-lg text-muted-foreground"> / 10.0</span></p></div><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-muted-foreground">Credits earned</p><p className="numeral text-lg">{earnedCredits}</p></div><div><p className="text-muted-foreground">Percentage equivalent</p><p className="numeral text-lg">{sgpa ? `${(Number(sgpa) * 10).toFixed(2)}%` : "—"}</p></div></div><button type="button" className="rh-btn rh-btn-primary w-full" disabled={saving} onClick={handleSave}><Calculator className="h-4 w-4" />{saving ? "Saving…" : "Save to profile"}</button><Notice tone="success">{message}</Notice><Notice tone="error">{error}</Notice></div></Panel></div>
    </div>
  </Shell>;
}
