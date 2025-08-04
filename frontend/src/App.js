import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/navbar';
import Event from './components/Events/viewevent';
import FullEvent from './components/Events/fullevent';
import BatchView from './components/Teams/batchview';
import TeamView from './components/Teams/teamview';
import AluminiBatch from './components/alumini/aluminibatch';
import AluminiView from './components/alumini/aluminiview';
import MentorBatch from './components/mentors/mentorbatch';
import MentorView from './components/mentors/mentorview';
import Landpage from './components/Home/landpage';
import AddProject from './components/admin/addproject';
import ManageProjects from './components/admin/manageproject';
import ViewProjects from './components/Projects/viewproject';
import Contact from './components/Contact/contact';
import Login from './components/Login/adminlogin';
import AdminPage from './components/Adminpage/adminpage'; 
import AddHackathon from './components/admin/addhackathon'
import ManageBatch from './components/admin/managebatch'
import AddBatch from './components/admin/addbatch'
import AddEvent from './components/admin/addevents'
import AddTeam from './components/admin/addteam'
import AddMember from './components/admin/addmember'
import ManageEvent from './components/admin/manageevent'
import ManageHackathon from './components/admin/managehackathon';
import AddAchievement from './components/admin/addachivements';
import ViewAchievement from './components/achivements/viewachivements';
import ManageAchievement from './components/admin/manageachivements';
import AddNews from './components/admin/addnews';
import ViewNews from './components/news/viewnews';
import FullNews from './components/news/fullnews'
import ManageNews from './components/admin/managenews';
import ViewHackathon from './components/hackathons/viewhackathon';
import { useAuth } from './components/Adminpage/auth';
import AddPoster from './components/slides/poster'
import LatestAchievement from './components/slides/latestachivement'
import './App.css';
import Footer from './components/Home/Footer';
import ProjectList from './components/projectlink/projectlink';
import ProjectManager from './components/admin/projectlink';
import Intership from './components/admin/intership'; // Updated component
import Inter from './components/Intership/internship';

const App = () => {
  const isAuthenticated = useAuth();
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landpage />} />
          <Route path="/events" element={<Event />} />
          <Route path="/fullevents/:eventId" element={<FullEvent />} />
          <Route path="/teams" element={<BatchView />} />
          <Route path="/team/:teamIndex" element={<TeamView />} />
          <Route path="/aluminibatch" element={<AluminiBatch />} />
          <Route path="/alumni/:batchNumber" element={<AluminiView />} />
          <Route path="/mentorbatch" element={<MentorBatch />} />
          <Route path="/mentors/:batchNumber" element={<MentorView />} />
          <Route path="/contactus" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/viewproject" element={<ViewProjects/>} />
          <Route path="/viewachivements" element={<ViewAchievement/>} />
          <Route path="/latestachivements" element={<LatestAchievement/>} />
          <Route path="/news" element={<ViewNews/>} />
          <Route path="/news/:id" element={<FullNews/>} />
          <Route path="/viewhackathon" element={<ViewHackathon/>} />

          <Route path="/admin" element={isAuthenticated ? <AdminPage /> : <Navigate to="/login" />} />
          <Route path="/managebatch" element={<ManageBatch />} />
          <Route path="/addbatch" element={<AddBatch />} />
          <Route path="/addteam" element={<AddTeam />} />
          <Route path="/addmember" element={<AddMember />} />

          {/* event routes */}
          <Route path="/addevent" element={isAuthenticated ? <AddEvent /> : <Navigate to="/login" />} />
          <Route path="/manageevent" element={isAuthenticated ? <ManageEvent /> : <Navigate to="/login" />} />

          {/* news routes */}
          <Route path="/managenews" element={isAuthenticated ? <ManageNews /> : <Navigate to="/login" />} /> 
          <Route path="/addnews" element={isAuthenticated ? <AddNews /> : <Navigate to="/login" />} />
          <Route path="/addposter" element={isAuthenticated ? <AddPoster /> : <Navigate to="/login" />} />

          {/* achievement routes */}
          <Route path="/addachivements" element={isAuthenticated ? <AddAchievement /> : <Navigate to="/login" />} /> 
          <Route path="/manageachivements" element={isAuthenticated ? <ManageAchievement /> : <Navigate to="/login" />} />

          {/* hackathon routes */}
          <Route path="/managehackathon" element={isAuthenticated ? <ManageHackathon /> : <Navigate to="/login" />}/>
          <Route path="/addhackathon" element={isAuthenticated ? <AddHackathon /> : <Navigate to="/login" />} />

          {/* project routes */}
          <Route path="/addproject" element={isAuthenticated ? <AddProject/> : <Navigate to="/login" />}/>
          <Route path="/manageproject" element={isAuthenticated ? <ManageProjects /> : <Navigate to="/login" />} />
          
          {/* Updated project showcase routes with parameters */}
          <Route path="/projectlink" element={<ProjectList />} />
          <Route path="/projectlink/batch/:batchNumber" element={<ProjectList />} />
          <Route path="/projectlink/batch/:batchNumber/team/:teamNumber" element={<ProjectList />} />
          
          {/* Admin project management routes with parameters */}
          <Route path="/addprojectlink" element={isAuthenticated ? <ProjectManager /> : <Navigate to="/login" />} />
          <Route path="/addprojectlink/batch/:batchNumber" element={isAuthenticated ? <ProjectManager /> : <Navigate to="/login" />} />
          
          {/* Updated internship routes - ADMIN SIDE */}
          <Route path="/addinternship" element={isAuthenticated ? <Intership /> : <Navigate to="/login" />} />
          <Route path="/addinternship/batch/:batchNumber" element={isAuthenticated ? <Intership /> : <Navigate to="/login" />} />
          <Route path="/addinternship/batch/:batchNumber/internship/:internshipId" element={isAuthenticated ? <Intership /> : <Navigate to="/login" />} />
          
          {/* Public internship viewing routes */}
          <Route path="/internship" element={<Inter />} />
          <Route path="/internship/batch/:batchNumber" element={<Inter />} />
          <Route path="/internship/batch/:batchNumber/internship/:internshipId" element={<Inter />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;