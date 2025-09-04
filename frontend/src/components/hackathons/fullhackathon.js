import React from 'react';
import './fullhackathon.css';

const BACKEND_URL = 'http://localhost:5000';

const FullHackathon = ({ hackathon, onBack }) => {
  return (
    <div className="viewhackathon-body">
      <button onClick={onBack} className="back-button">Back to List</button>
      <div className="full-hackathon">
        <h2>{hackathon.name}</h2>
        <p><strong>Date:</strong> {new Date(hackathon.date).toLocaleDateString()}</p>
        <p><strong>Technology:</strong> {hackathon.technology}</p>
        <p><strong>Description:</strong> {hackathon.description}</p>
        <h3>Teams</h3>
        <div className="teams-grid">
          {hackathon.teams.map((team, index) => (
            <div key={index} className="team-details">
              <h4>Team {index + 1}: {team.projectName}</h4>
              <p><strong>GitHub Link:</strong> <a href={team.githubLink} target="_blank" rel="noopener noreferrer">{team.githubLink}</a></p>
              <h5>Members:</h5>
              <ul>
                {team.members.map((member, i) => (
                  <li key={i}>{member.name}</li>
                ))}
              </ul>
              <h5>Team Photo</h5>
              {team._id && (
                <div className="team-photo">
                  <img
                    src={`${BACKEND_URL}/api/hackathons/${hackathon._id}/team/${team._id}/photo`}
                    alt={`Team ${index + 1} Photo`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullHackathon;
