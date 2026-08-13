# UI components

This is the project's default shared-component location because `tsconfig.json`
maps `@/*` to the repository root. Components here can be imported consistently
as `@/components/ui/...`, which also matches shadcn's conventional alias.

## Animated arrow button

`animated-arrow-button.tsx` supports anchor and button semantics, optional
desktop/mobile labels, three sizes, full-width layout, and these variants:

- `brand`
- `light`
- `dark`
- `outline-light`
- `outline-dark`

### Visual specification

- All button variants use square corners (`border-radius: 0`).
- The icon has no circle, border, or background container.
- The resting state is a compact 5 × 5 dot field.
- Hover and keyboard focus resolve the dots into a right-pointing arrow made
  from ten dots on a 6 × 5 grid.
- The completed arrow is rotated `-45deg`, so it points diagonally upward while
  retaining a clearly readable horizontal shaft and arrowhead.
- Icon allocation is 24px, 30px, and 34px for the small, medium, and large
  button sizes respectively. The arrow itself may extend into that transparent
  allocation because the wrapper intentionally uses `overflow: visible`.

The arrow geometry follows the supplied references: the silhouette comes from
the dotted right arrow and its final angle comes from the diagonal example. The
circle visible in the diagonal reference is intentionally omitted.

### Props

| Prop | Values | Default | Purpose |
| --- | --- | --- | --- |
| `text` | `string` | `"Nothing-Plop"` | Visible accessible label |
| `compactText` | `string` | — | Alternate label below 620px |
| `variant` | `brand`, `light`, `dark`, `outline-light`, `outline-dark` | `brand` | Color treatment |
| `size` | `small`, `medium`, `large` | `medium` | Height, type, padding, and icon allocation |
| `fullWidth` | `boolean` | `false` | Expands to the parent width |
| `href` | `string` | — | Renders an anchor when present; otherwise renders a button |

All native anchor and button attributes are forwarded, including `target`,
`rel`, `onClick`, `disabled`, and ARIA attributes.

### Project usage

The shared component is used for:

- the fixed navigation and full-screen menu collaboration actions;
- both hero destination actions;
- every case-study and live-product action in Selected Work; and
- the full-width contact email action.

No provider, hook, image, SVG, icon package, or runtime state is required. Both
icon states are CSS-only. Decorative dots are hidden from assistive technology,
focus remains visibly outlined, and reduced-motion users get an effectively
instant state change without vertical movement.

### Maintenance checklist

When the component changes:

1. Verify every variant in `demo.tsx`.
2. Confirm buttons and icon wrappers remain free of rounded corners and rings.
3. Check that the hover/focus arrow forms a ten-dot right arrow at `-45deg`.
4. Test the compact label at 620px or narrower.
5. Run type checking, linting, and the production build before publishing.

## Optional Tailwind and shadcn setup

The portfolio currently uses TypeScript and a custom global/CSS-module design
system. Tailwind and shadcn are not installed, so this component deliberately
uses the existing CSS architecture.

If the whole project is intentionally migrated later:

1. Install Tailwind using its current Next.js guide:
   <https://tailwindcss.com/docs/installation/framework-guides/nextjs>
2. Initialize shadcn from the repository root:

   ```bash
   pnpm dlx shadcn@latest init
   ```

3. In the generated `components.json`, keep the UI alias set to
   `@/components/ui` and the global stylesheet set to `app/globals.css`.
4. Re-run `pnpm typecheck`, `pnpm lint`, and `pnpm build` because the project
   uses vinext/Cloudflare Sites rather than the default Next.js runtime.

Official shadcn instructions:
<https://ui.shadcn.com/docs/installation/next>
