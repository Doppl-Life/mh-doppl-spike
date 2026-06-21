export type KernelView = 'assay' | 'microscope' | 'architecture';

type ViewLink = {
  key: KernelView;
  label: string;
  blurb: string;
};

const views: ViewLink[] = [
  { key: 'assay', label: 'Assay', blurb: 'cases + controls' },
  { key: 'microscope', label: 'Microscope', blurb: 'single trace' },
  { key: 'architecture', label: 'Architecture', blurb: 'system map' },
];

export type KernelViewHrefs = Record<KernelView, string>;

export function renderViewNav(
  active: KernelView,
  hrefs: KernelViewHrefs,
  options: { hubHref?: string; hubLabel?: string } = {},
): string {
  const links = views
    .map((view) => {
      const activeClass = view.key === active ? ' is-active' : '';
      return `<a class="kernel-view-link${activeClass}" href="${hrefs[view.key]}">${view.label}<small>${view.blurb}</small></a>`;
    })
    .join('');
  const hubHref = options.hubHref || '';
  const hub = hubHref
    ? `<a class="kernel-view-hub" href="${hubHref}">${options.hubLabel || 'Kernel hub'}</a>`
    : '';

  return `<!-- kernel-view-nav:start -->
<style>
.kernel-view-nav{position:sticky;top:0;z-index:2147483647;display:flex;gap:.35rem;align-items:center;flex-wrap:wrap;padding:.58rem .8rem;background:#0b0e13;border-bottom:1px solid #2a3544;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:.85rem;line-height:1.2;}
.kernel-view-nav strong{color:#8b9bb0;font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;margin-right:.25rem;}
.kernel-view-nav a{color:#e8edf4;text-decoration:none;border-radius:6px;padding:.34rem .62rem;white-space:nowrap;}
.kernel-view-nav a small{margin-left:.35rem;color:#8b9bb0;font-weight:400;}
.kernel-view-nav a:hover{background:#1b232e;color:#c084fc;}
.kernel-view-nav a:hover small{color:#c084fc;}
.kernel-view-nav a.is-active{background:#c084fc;color:#0b0e13;font-weight:700;}
.kernel-view-nav a.is-active small{color:#0b0e13;}
.kernel-view-nav .kernel-view-hub{margin-left:auto;color:#8b9bb0;}
@media (max-width:700px){.kernel-view-nav a small{display:none}.kernel-view-nav .kernel-view-hub{margin-left:0}}
</style>
<nav class="kernel-view-nav" aria-label="Kernel view navigation">
  <strong>Kernel views</strong>${links}${hub}
</nav>
<!-- kernel-view-nav:end -->`;
}

export function stripViewNav(html: string): string {
  return html.replace(/<!-- kernel-view-nav:start -->[\s\S]*?<!-- kernel-view-nav:end -->/g, '');
}
