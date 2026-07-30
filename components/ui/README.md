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

No provider, hook, image, icon package, or runtime state is required. Its two
dot-grid icon states are CSS-only, and reduced-motion users get an effectively
instant state change.

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
