import React from 'react';

const DebugTeamData = ({ teams }) => {
  if (!teams || teams.length === 0) {
    return <div>No teams data available</div>;
  }

  // Take the first team as an example
  const sampleTeam = teams[0];

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">Debug: Team Data Structure</h3>
      <div className="text-xs">
        <p><strong>Sample Team:</strong> {sampleTeam.team_name}</p>
        <details className="mt-2">
          <summary className="cursor-pointer font-medium">Click to see full team object</summary>
          <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(sampleTeam, null, 2)}
          </pre>
        </details>
        
        <div className="mt-2">
          <p><strong>Submission-related fields found:</strong></p>
          <ul className="ml-4 list-disc">
            {Object.keys(sampleTeam).filter(key => 
              key.toLowerCase().includes('submission') || 
              key.toLowerCase().includes('submit') ||
              key.toLowerCase().includes('time') ||
              key.toLowerCase().includes('date')
            ).map(key => (
              <li key={key}>
                <code>{key}</code>: {JSON.stringify(sampleTeam[key])}
              </li>
            ))}
          </ul>
        </div>

        {sampleTeam.github_submission && (
          <div className="mt-2">
            <p><strong>GitHub submission object:</strong></p>
            <pre className="mt-1 p-2 bg-white rounded text-xs">
              {JSON.stringify(sampleTeam.github_submission, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugTeamData;