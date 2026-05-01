import { describe, it, expect } from 'vitest';
import { data } from './data';

describe('portfolio data', () => {

  describe('personal', () => {
    it('has a non-empty name', () => {
      expect(data.personal.name.trim().length).toBeGreaterThan(0);
    });

    it('has a non-empty title', () => {
      expect(data.personal.title.trim().length).toBeGreaterThan(0);
    });

    it('professional email is a valid email format', () => {
      expect(data.personal.emails.professional).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('personal email is a valid email format', () => {
      expect(data.personal.emails.personal).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('GitHub URL starts with https', () => {
      expect(data.personal.social.github).toMatch(/^https:\/\//);
    });

    it('LinkedIn URL starts with https', () => {
      expect(data.personal.social.linkedin).toMatch(/^https:\/\//);
    });

    it('WhatsApp URL starts with https', () => {
      expect(data.personal.social.whatsapp).toMatch(/^https:\/\//);
    });

    it('aboutMe is non-empty', () => {
      expect(data.personal.aboutMe.trim().length).toBeGreaterThan(0);
    });
  });

  describe('experience', () => {
    it('has at least one entry', () => {
      expect(data.experience.length).toBeGreaterThan(0);
    });

    it('every entry has company, role, and period', () => {
      for (const exp of data.experience) {
        expect(exp.company.trim().length).toBeGreaterThan(0);
        expect(exp.role.trim().length).toBeGreaterThan(0);
        expect(exp.period.trim().length).toBeGreaterThan(0);
      }
    });

    it('every entry has at least one description bullet', () => {
      for (const exp of data.experience) {
        expect(exp.description.length).toBeGreaterThan(0);
        for (const bullet of exp.description) {
          expect(bullet.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('education', () => {
    it('has at least one entry', () => {
      expect(data.education.length).toBeGreaterThan(0);
    });

    it('every entry has institution, degree, and period', () => {
      for (const edu of data.education) {
        expect(edu.institution.trim().length).toBeGreaterThan(0);
        expect(edu.degree.trim().length).toBeGreaterThan(0);
        expect(edu.period.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe('skills', () => {
    it('has at least one skill group', () => {
      expect(data.skills.length).toBeGreaterThan(0);
    });

    it('every group has a category name and at least one skill', () => {
      for (const group of data.skills) {
        expect(group.category.trim().length).toBeGreaterThan(0);
        expect(group.skills.length).toBeGreaterThan(0);
      }
    });

    it('no skill is an empty string', () => {
      for (const group of data.skills) {
        for (const skill of group.skills) {
          expect(skill.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('projects', () => {
    it('has at least one project', () => {
      expect(data.projects.length).toBeGreaterThan(0);
    });

    it('every project has a title and description', () => {
      for (const project of data.projects) {
        expect(project.title.trim().length).toBeGreaterThan(0);
        expect(project.description.trim().length).toBeGreaterThan(0);
      }
    });

    it('every project has at least one technology', () => {
      for (const project of data.projects) {
        expect(project.technologies.length).toBeGreaterThan(0);
      }
    });

    it('liveUrl starts with https when present', () => {
      for (const project of data.projects) {
        if (project.liveUrl) {
          expect(project.liveUrl).toMatch(/^https?:\/\//);
        }
      }
    });

    it('githubUrl starts with https when present', () => {
      for (const project of data.projects) {
        if (project.githubUrl) {
          expect(project.githubUrl).toMatch(/^https?:\/\//);
        }
      }
    });
  });
});
