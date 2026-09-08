import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import NotFound from "./pages/NotFound.jsx";

import TpoDashboard from "./pages/TpoDashboard.jsx";
import TpoSelectStudents from "./pages/TpoSelectStudents.jsx";
import TpoAnnouncements from "./pages/TpoAnnouncements.jsx";
import TpoStudents from "./pages/TpoStudents.jsx";
import TpoCompanies from "./pages/TpoCompanies.jsx";
import TpoSettings from "./pages/TpoSettings.jsx";

import StudentDashboard from "./pages/StudentDashboard.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import StudentResume from "./pages/StudentResume.jsx";
import StudentMarksheets from "./pages/StudentMarksheets.jsx";
import StudentJobs from "./pages/StudentJobs.jsx";
import StudentApplications from "./pages/StudentApplications.jsx";
import StudentAnnouncements from "./pages/StudentAnnouncements.jsx";

import CompanyDashboard from "./pages/CompanyDashboard.jsx";
import CompanyPostJob from "./pages/CompanyPostJob.jsx";
import CompanyJobs from "./pages/CompanyJobsIndex.jsx";
import CompanyApplicants from "./pages/CompanyJobsIdApplicants.jsx";

// This is the whole map of addresses in the app.
// Each line says: when the address bar shows this path,
// show this page. The last line catches anything unknown
// and shows the 404 page instead of a blank screen.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/tpo/dashboard" element={<TpoDashboard />} />
        <Route path="/tpo/select-students" element={<TpoSelectStudents />} />
        <Route path="/tpo/announcements" element={<TpoAnnouncements />} />
        <Route path="/tpo/students" element={<TpoStudents />} />
        <Route path="/tpo/companies" element={<TpoCompanies />} />
        <Route path="/tpo/settings" element={<TpoSettings />} />

        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/resume" element={<StudentResume />} />
        <Route path="/student/marksheets" element={<StudentMarksheets />} />
        <Route path="/student/jobs" element={<StudentJobs />} />
        <Route path="/student/applications" element={<StudentApplications />} />
        <Route path="/student/announcements" element={<StudentAnnouncements />} />

        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/post-job" element={<CompanyPostJob />} />
        <Route path="/company/jobs" element={<CompanyJobs />} />
        <Route path="/company/jobs/:id/applicants" element={<CompanyApplicants />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
