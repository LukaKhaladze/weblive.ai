import { Project } from "./types";

export const STORAGE_KEY = "weblive_projects_v1";
export const CURRENT_PROJECT_KEY = "weblive_current_project_v1";

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as Project[];
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function setCurrentProjectId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENT_PROJECT_KEY, id);
}

export function getCurrentProjectId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CURRENT_PROJECT_KEY);
}

export function upsertProject(project: Project) {
  const projects = loadProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.unshift(project);
  }
  saveProjects(projects);
  return projects;
}

export function getProjectById(id: string): Project | undefined {
  const projects = loadProjects();
  return projects.find((p) => p.id === id);
}
