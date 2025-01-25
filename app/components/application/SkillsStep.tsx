import React from 'react';

interface Skill {
  name: string;
  level: 'Basic' | 'Intermediate' | 'Fluent' | 'Expert';
}

interface Language {
  name: string;
  level: 'Basic' | 'Intermediate' | 'Fluent' | 'Native';
}

interface SkillsStepProps {
  formData: {
    softSkills: Skill[];
    languages: Language[];
  };
  onUpdate: (
    data: Partial<{
      softSkills: Skill[];
      languages: Language[];
    }>
  ) => void;
}

const skillLevels = ['Basic', 'Intermediate', 'Fluent', 'Expert'] as const;
const languageLevels = ['Basic', 'Intermediate', 'Fluent', 'Native'] as const;

const commonSoftSkills = [
  'Communication',
  'Leadership',
  'Problem Solving',
  'Teamwork',
  'Time Management',
  'Adaptability',
  'Critical Thinking',
  'Creativity',
] as const;

const commonLanguages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Arabic',
  'Hindi',
] as const;

export function SkillsStep({ formData, onUpdate }: SkillsStepProps) {
  const [newSoftSkill, setNewSoftSkill] = React.useState('');
  const [newLanguage, setNewLanguage] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleAddSoftSkill = (skill: string) => {
    setError(null);
    if (!skill.trim()) {
      setError('Please enter a skill name');
      return;
    }

    if (formData.softSkills.some((s) => s.name.toLowerCase() === skill.toLowerCase())) {
      setError('This skill has already been added');
      return;
    }

    onUpdate({
      softSkills: [...formData.softSkills, { name: skill, level: 'Intermediate' }],
    });
    setNewSoftSkill('');
  };

  const handleAddLanguage = (language: string) => {
    setError(null);
    if (!language.trim()) {
      setError('Please enter a language name');
      return;
    }

    if (formData.languages.some((l) => l.name.toLowerCase() === language.toLowerCase())) {
      setError('This language has already been added');
      return;
    }

    onUpdate({
      languages: [...formData.languages, { name: language, level: 'Intermediate' }],
    });
    setNewLanguage('');
  };

  const handleRemoveSoftSkill = (index: number) => {
    onUpdate({
      softSkills: formData.softSkills.filter((_, i) => i !== index),
    });
  };

  const handleRemoveLanguage = (index: number) => {
    onUpdate({
      languages: formData.languages.filter((_, i) => i !== index),
    });
  };

  const handleSoftSkillLevelChange = (index: number, level: Skill['level']) => {
    const updatedSkills = [...formData.softSkills];
    updatedSkills[index] = { ...updatedSkills[index], level };
    onUpdate({ softSkills: updatedSkills });
  };

  const handleLanguageLevelChange = (index: number, level: Language['level']) => {
    const updatedLanguages = [...formData.languages];
    updatedLanguages[index] = { ...updatedLanguages[index], level };
    onUpdate({ languages: updatedLanguages });
  };

  return (
    <div className="space-y-8">
      {/* Soft Skills */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Soft Skills</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={newSoftSkill}
                onChange={(e) => setNewSoftSkill(e.target.value)}
                placeholder="Add a soft skill..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={() => newSoftSkill && handleAddSoftSkill(newSoftSkill)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {commonSoftSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleAddSoftSkill(skill)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
              >
                {skill}
              </button>
            ))}
          </div>

          {formData.softSkills.map((skill, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <span className="flex-1 font-medium">{skill.name}</span>
              <select
                value={skill.level}
                onChange={(e) =>
                  handleSoftSkillLevelChange(index, e.target.value as Skill['level'])
                }
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {skillLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleRemoveSoftSkill(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Languages</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add a language..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={() => newLanguage && handleAddLanguage(newLanguage)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {commonLanguages.map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => handleAddLanguage(language)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
              >
                {language}
              </button>
            ))}
          </div>

          {formData.languages.map((language, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <span className="flex-1 font-medium">{language.name}</span>
              <select
                value={language.level}
                onChange={(e) =>
                  handleLanguageLevelChange(index, e.target.value as Language['level'])
                }
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {languageLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleRemoveLanguage(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
