import rawCourse from '../../course-content.json';
import type { CourseContent, CourseModule } from '@/shared/types';

export const course = rawCourse as CourseContent;
export const modules = course.modules;

export function getModuleBySlug(slug: string): CourseModule | undefined {
  return modules.find((module) => module.slug === slug || String(module.id) === slug);
}

export const ICON_MAP: Record<string, string> = {
  'devicon-vscode-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-plain.svg',
  'devicon-html5-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-plain.svg',
  'devicon-css3-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-plain.svg',
  'devicon-javascript-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-plain.svg',
  'devicon-typescript-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-plain.svg',
  'devicon-git-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-plain.svg',
  'devicon-linux-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-plain.svg',
  'devicon-react-original': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
  'devicon-vuejs-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-plain.svg',
  'devicon-nuxtjs-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nuxtjs/nuxtjs-plain.svg',
  'devicon-nodejs-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-plain.svg',
  'devicon-express-original': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg',
  'devicon-nestjs-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nestjs/nestjs-plain.svg',
  'devicon-postgresql-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-plain.svg',
  'devicon-docker-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-plain.svg',
  'devicon-nginx-original': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nginx/nginx-original.svg',
  'devicon-github-original': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg',
  'devicon-redis-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-plain.svg',
  'devicon-jest-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jest/jest-plain.svg',
  'devicon-figma-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-plain.svg',
  'devicon-threejs-original': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/threejs/threejs-original.svg',
  'devicon-fastapi-plain': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-plain.svg',
};
