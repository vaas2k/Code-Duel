import React from 'react';
import { Code2, TrendingUp, Target } from 'lucide-react';

interface LanguageSkillsProps {
  userId?: string;
}

const LanguageSkills: React.FC<LanguageSkillsProps> = ({ userId }) => {
  // This would fetch actual language usage from backend
  // For now, using placeholder data
  const languages = [
    { name: "C++", percentage: 65, problems: 223 },
    { name: "Python", percentage: 25, problems: 85 },
    { name: "JavaScript", percentage: 8, problems: 27 },
    { name: "Java", percentage: 2, problems: 7 }
  ];

  const skills = [
    { name: "Algorithms", level: 4.5, category: "Core" },
    { name: "Data Structures", level: 4.2, category: "Core" },
    { name: "Dynamic Programming", level: 3.8, category: "Advanced" },
    { name: "Graph Theory", level: 3.5, category: "Advanced" }
  ];

  return (
    <div className="space-y-6">
      {/* Language Usage */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-purple-400" />
          Language Usage
        </h3>
        <div className="space-y-4">
          {languages.map((lang, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">{lang.name}</span>
                <span className="text-gray-400">{lang.percentage}% ({lang.problems})</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${lang.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          Skills
        </h3>
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">{skill.name}</span>
                <span className="text-gray-400">{skill.level}/5.0</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${(skill.level / 5) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{skill.category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSkills;