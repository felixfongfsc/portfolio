/**
 * cards.js — Project card builder and renderer
 * Depends on: js/data/projects.js (projects array must be loaded first)
 */

/**
 * Build a single project-card <li> from a project data object.
 * @param {object} project
 * @param {string} [thumbPrefix=""] - path prefix for pages nested inside subdirectories
 * @returns {HTMLLIElement}
 */
function buildProjectCard(project, thumbPrefix = "") {
  const li = document.createElement("li");
  li.className = "project-card";
  const startDate = project.overview?.started ? `<span class="project-card__started">${project.overview.started}</span>` : "";
  li.innerHTML = `
    <a href="${thumbPrefix}${project.url}" class="project-card__link">
      <div class="project-card__thumb">
        <img src="${thumbPrefix}${project.thumb}" alt="${project.title} project thumbnail" loading="lazy">
      </div>
      <div class="project-card__meta">
        <span class="project-card__title">${project.title}</span>
        ${project.caption ? `<span class="project-card__caption">${project.caption}</span>` : ""}
        <div class="project-card__footer">
          <span class="project-card__discipline">${project.discipline}</span>
          ${startDate}
        </div>
      </div>
    </a>
  `;
  return li;
}

/**
 * Render project cards into [data-project-list] containers.
 *
 * - data-project-list="highlights"  → all projects with highlight=true (used on index.html)
 * - data-project-list="UI/UX Design" → filtered by discipline AND works=true (used on works.html)
 */
(function renderProjectCards() {
  const highlightsList = document.querySelector('[data-project-list="highlights"]');
  if (highlightsList) {
    projects
      .filter((p) => p.highlight)
      .forEach((p) => highlightsList.appendChild(buildProjectCard(p)));
  }

  document.querySelectorAll('[data-project-list]').forEach((list) => {
    const discipline = list.dataset.projectList;
    if (discipline === "highlights") return;
    projects
      .filter((p) => p.discipline === discipline && (p.works !== false)) // Default to true if not specified
      .forEach((p) => list.appendChild(buildProjectCard(p)));
  });
})();
