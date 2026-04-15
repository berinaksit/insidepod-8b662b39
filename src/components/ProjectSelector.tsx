import { ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjects } from '@/contexts/ProjectsContext';

export function ProjectSelector() {
  const { projects, activeProjectId, setActiveProjectId } = useProjects();

  const hasProjects = projects.length > 0;

  return (
    <Select
      value={activeProjectId || ''}
      onValueChange={(value) => setActiveProjectId(value || null)}
      disabled={!hasProjects}
    >
      <SelectTrigger className="w-[140px] sm:w-[180px] h-8 sm:h-9 text-xs sm:text-sm">
        <SelectValue placeholder={hasProjects ? "Select project" : "No projects"} />
      </SelectTrigger>
      <SelectContent>
        {projects.map(project => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
