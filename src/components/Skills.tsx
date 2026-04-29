import React from 'react';
import { BlueprintBox } from './BlueprintBox';
import { data } from '../data/data';
import { Typewriter } from './Typewriter';
import { CheckSquare } from 'lucide-react';

export const Skills: React.FC = () => {
  return (
    <BlueprintBox coords={{ x: 20, y: 30 }} className="w-full h-full">
      <h3 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">
        <span className="text-secondary text-sm">##</span>
        <Typewriter text="System_Skills" delay={0.7} speed="fast" />
      </h3>
      <div className="flex flex-col gap-6">
        {data.skills.map((group, index) => (
          <div key={index}>
            <h4 className="text-sm font-bold text-primary/90 mb-3 border-b border-dashed border-line pb-2">
              // {group.category}
            </h4>
            <ul className="flex flex-col gap-2">
              {group.skills.map((skill, i) => (
                <li key={i} className="text-sm text-primary/80 flex items-center gap-2">
                  <CheckSquare className="w-3 h-3 text-accent/70" />
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </BlueprintBox>
  );
};